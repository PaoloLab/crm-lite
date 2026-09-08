// Nome del cookie di sessione, condiviso tra src/lib/session.ts (che lo usa con
// iron-session) e src/proxy.ts (che ne controlla solo la presenza). Va tenuto
// in un modulo separato e senza dipendenze da Prisma/iron-session perché il
// proxy non deve trascinarsi dietro codice non eseguibile in quel contesto.
export const SESSION_COOKIE_NAME = "crm_session";
