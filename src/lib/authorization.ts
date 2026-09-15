import { redirect } from "next/navigation";
import { getCurrentUser, type SafeUser } from "@/lib/session";

// Convenzione concordata: level 1 = Admin, qualsiasi altro valore = utente
// non-admin (es. Venditore, level 2). Coincide con quanto già seedato in
// prisma/seed.ts (Amministratore -> level 1, Venditore -> level 2).
const ADMIN_ROLE_LEVEL = 1;

/**
 * Da chiamare all'inizio di qualunque pagina o Server Action che richieda un
 * utente loggato, qualunque sia il ruolo. Se non c'è sessione valida,
 * reindirizza a /login e non ritorna.
 *
 * Nota: il redirect passa per /api/session/clear e non direttamente per
 * /login. Se il cookie di sessione è presente ma la sessione sul DB non è
 * più valida (scaduta o revocata), un redirect diretto a /login lascerebbe
 * il cookie intatto: src/proxy.ts, che sa solo se il cookie è presente (non
 * se è valido), rimanderebbe subito l'utente indietro creando un loop
 * infinito tra la pagina protetta e /login. La route /api/session/clear
 * pulisce davvero il cookie (i Server Component non possono farlo in fase di
 * render) prima di mandare a /login.
 */
export async function requireAuth(): Promise<SafeUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/api/session/clear");
  }

  return user;
}

/**
 * Come requireAuth(), ma richiede anche che l'utente sia Admin (role.level
 * === 1). Se l'utente è loggato ma non è admin, reindirizza a /unauthorized.
 *
 * Sicura da chiamare sia in pagine/Server Component sia dentro Server
 * Action: va usata come primo controllo in ogni Server Action che modifica
 * dati riservati agli admin, non solo per proteggere il rendering di una
 * pagina.
 */
export async function requireAdmin(): Promise<SafeUser> {
  const user = await requireAuth();

  if (!isAdmin(user)) {
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Funzione pura, nessun redirect: dice solo se l'utente è admin.
 * Da usare ESCLUSIVAMENTE per decidere cosa mostrare/nascondere nella UI
 * (es. non renderizzare un bottone). Non è un controllo di sicurezza: ogni
 * Server Action sensibile deve comunque chiamare requireAdmin() (o
 * requireAuth()) al proprio interno, perché la UI nascosta non impedisce a
 * qualcuno di invocare la Server Action direttamente.
 */
export function isAdmin(user: SafeUser): boolean {
  return user.role.level === ADMIN_ROLE_LEVEL;
}

/**
 * Filtro Prisma "where" per la visibilità riga-per-riga su Deal/Activity:
 * Admin vede tutto ({}), utente non-admin vede solo le proprie righe
 * ({ userId }). Un solo helper per entrambi i modelli perché la regola è
 * identica, anche se il significato di userId è diverso nei due casi — Deal
 * (proprietario) vs Activity (esecutore), distinzione voluta e documentata
 * in AGENTS.md. Da usare sia per i findMany di lettura sia dentro il `where`
 * di update/delete nelle Server Action (mai fidarsi che la UI nasconda già
 * le righe non proprie: un non-admin non deve poter scrivere su una riga che
 * non gli appartiene, anche invocando l'azione direttamente).
 */
export function ownRowsWhere(user: SafeUser): { userId?: number } {
  return isAdmin(user) ? {} : { userId: user.userId };
}
