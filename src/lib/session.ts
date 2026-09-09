import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import bcrypt from "bcryptjs";
import { Prisma, type Role, type User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 giorni

interface CookieSessionData {
  sessionToken?: string;
}

const sessionOptions: SessionOptions = {
  cookieName: SESSION_COOKIE_NAME,
  password: process.env.SESSION_SECRET as string,
  ttl: SESSION_DURATION_MS / 1000,
  cookieOptions: {
    httpOnly: true, // il cookie non è leggibile da JS lato client (mitiga XSS)
    secure: process.env.NODE_ENV === "production", // solo HTTPS in produzione
    sameSite: "lax", // protezione base da CSRF, senza rompere la navigazione da link esterni
  },
};

async function getCookieSession() {
  return getIronSession<CookieSessionData>(await cookies(), sessionOptions);
}

// Nessun campo sensibile (passwordHash) presente: whitelist esplicita dei campi esposti.
function toSafeUser(user: User & { role: Role }) {
  return {
    userId: user.userId,
    username: user.username,
    name: user.name,
    surname: user.surname,
    birthDate: user.birthDate,
    roleId: user.roleId,
    role: {
      roleId: user.role.roleId,
      description: user.role.description,
      level: user.role.level,
    },
  };
}

export type SafeUser = ReturnType<typeof toSafeUser>;

/**
 * Verifica le credenziali e, se valide, crea una riga in Session e il cookie firmato.
 * Ritorna sempre lo stesso esito generico per utente inesistente o password errata,
 * per non dare a un attaccante un modo di scoprire quali username esistono.
 */
export async function login(
  username: string,
  password: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { username } });
  const isValid = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!user || !isValid) {
    return false;
  }

  const sessionToken = randomUUID();
  const expires = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: { sessionToken, userId: user.userId, expires },
  });

  const cookieSession = await getCookieSession();
  cookieSession.sessionToken = sessionToken;
  await cookieSession.save();

  return true;
}

/**
 * Da usare in Server Components/Server Actions per sapere chi è loggato.
 * La sessione viene sempre validata contro il DB (non solo contro il cookie),
 * così revocare la riga in Session disconnette l'utente immediatamente.
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const cookieSession = await getCookieSession();
  const { sessionToken } = cookieSession;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: { include: { role: true } } },
  });

  if (!session || session.expires < new Date()) {
    // La sessione lato DB non è (più) valida: ripuliamo anche il cookie,
    // così il browser smette di mandare un sessionToken morto. In un Server
    // Component in fase di rendering i cookie sono read-only e questa
    // scrittura lancerebbe un errore: qui non è un problema, perché stiamo
    // comunque per ritornare null (accesso negato) indipendentemente da
    // riuscire a ripulire il cookie o meno.
    try {
      cookieSession.destroy();
    } catch {
      // Ignorato volutamente: verrà ripulito al prossimo giro utile
      // (es. dentro la Server Action di logout, o un Route Handler).
    }
    return null;
  }

  return toSafeUser(session.user);
}

/**
 * Elimina la sessione lato DB (revoca) e svuota il cookie lato browser.
 */
export async function logout(): Promise<void> {
  const cookieSession = await getCookieSession();
  const { sessionToken } = cookieSession;

  if (sessionToken) {
    try {
      await prisma.session.delete({ where: { sessionToken } });
    } catch (error) {
      // Se la sessione è già stata revocata altrove (es. disattivazione utente),
      // non è un errore: l'obiettivo del logout è comunque raggiunto.
      const alreadyDeleted =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025";
      if (!alreadyDeleted) {
        throw error;
      }
    }
  }

  cookieSession.destroy();
}
