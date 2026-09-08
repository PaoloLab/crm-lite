import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";

// Solo le route effettivamente protette da autenticazione oggi nel progetto.
const PROTECTED_PATHS = ["/dashboard"];
const PUBLIC_ONLY_PATHS = ["/login"];

function matchesPath(pathname: string, paths: string[]): boolean {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

// Nota: qui controlliamo solo che il cookie di sessione sia presente.
// Prisma non è disponibile in questo contesto, quindi la verifica reale
// (sessione esistente, non scaduta, non revocata) resta in
// src/lib/session.ts::getCurrentUser(), già chiamata dentro le pagine
// protette (es. src/app/dashboard/page.tsx). Questo proxy è solo un
// filtro veloce per evitare di caricare pagine protette senza alcun cookie.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);

  if (matchesPath(pathname, PROTECTED_PATHS) && !hasSessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (matchesPath(pathname, PUBLIC_ONLY_PATHS) && hasSessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
