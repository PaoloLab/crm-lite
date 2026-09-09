<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# crm-lite — contesto di progetto

## Stack e versioni
- Next.js 16.3.4, App Router, TypeScript (`typescript@^5`)
- Package manager: npm (unico lockfile presente: `package-lock.json`)
- Database: PostgreSQL su Neon (cloud, serverless) — niente Postgres/Docker locale, vedi `DATABASE_URL` in `.env`
- ORM: Prisma 7.10.0, con driver adapter esplicito `@prisma/adapter-pg` (Prisma 7 richiede un adapter, non usa più il query engine binario di default delle versioni precedenti)

## Convenzioni specifiche di questa versione di Next.js
- Il file di protezione route si chiama `proxy.ts` (non `middleware.ts`), ed è in `src/proxy.ts`. In Next 16 `middleware.ts`/`export function middleware` è deprecato a favore di `proxy.ts`/`export function proxy` (funziona ancora ma con warning di build). Va messo nella cartella genitore di `app/`: qui `app` sta in `src/app`, quindi il file va in `src/`, **non** nella root del progetto — in root verrebbe ignorato silenziosamente.
- Il runtime di default del proxy è **Node.js**, non Edge (diversamente dalle versioni precedenti di Next, dove il middleware girava su Edge Runtime). Impostare `runtime` nel proxy genera un errore: non è configurabile.

## Autenticazione e sessioni
- Sessioni custom basate su cookie firmato (`iron-session`) + tabella `Session` su Prisma. **Non** Auth.js/NextAuth (rimosso: era incompatibile con sessioni "database" quando l'unico provider è Credentials, e comunque non permetteva la revoca immediata voluta).
- Motivo della scelta: revoca lato server immediata (requisito: poter disconnettere subito un utente da tutti i dispositivi) — non ottenibile con JWT stateless, dove il token resta valido finché non scade.
- File coinvolti:
  - `src/lib/session.ts` — `login()`, `logout()`, `getCurrentUser()`. `getCurrentUser()` valida sempre la sessione contro il DB (non solo il cookie); include anche `user.role` nella query. Contiene anche il fix di pulizia cookie: se la sessione risulta assente/scaduta, prova a cancellare il cookie (`cookieSession.destroy()` in un `try/catch`, perché un Server Component in fase di render non può scrivere cookie — vedi sotto).
  - `src/lib/session-cookie.ts` — costante `SESSION_COOKIE_NAME`, condivisa tra `session.ts` e `proxy.ts` per non duplicare il nome del cookie.
  - `src/proxy.ts` — controllo veloce di sola presenza del cookie (nessuna query DB/Prisma, che nel proxy va evitata a prescindere dal runtime): protegge le route riservate e rimanda via da `/login` chi ha già un cookie.
  - `src/app/api/session/clear/route.ts` — Route Handler che cancella davvero il cookie (chiama `logout()`) e reindirizza a `/login`. Esiste perché Next.js vieta di scrivere/cancellare cookie durante il render di un Server Component; senza questo passaggio, una sessione invalida con cookie ancora presente farebbe rimbalzare l'utente all'infinito tra pagina protetta e `/login` (il proxy vede il cookie e rimanda alla pagina, la pagina vede la sessione invalida e rimanda a login). Va usato per qualunque redirect da sessione-non-valida, non solo `redirect("/login")` diretto.
  - `src/lib/authorization.ts` — vedi sezione sotto.
- `SESSION_SECRET` in `.env` (minimo 32 caratteri, generato con `openssl rand -base64 32`): password di cifratura del cookie iron-session, nessun default/fallback in codice.

## Autorizzazione basata sul ruolo
- Regola: `Role.level = 1` → Admin, qualunque altro valore → utente non-admin (Venditore). Confermato nel seed (`prisma/seed.ts`): Amministratore `level: 1`, Venditore `level: 2`.
- Helper in `src/lib/authorization.ts`:
  - `requireAuth()` — richiede utente loggato, altrimenti redirect (via `/api/session/clear`, non `/login` diretto — stesso motivo del loop spiegato sopra). Usabile in Server Component e Server Action.
  - `requireAdmin()` — come sopra, più controllo `role.level === 1`; se fallisce, redirect a `/unauthorized`.
  - `isAdmin(user)` — funzione pura, nessun redirect, solo `true`/`false`. Da usare **solo** per mostrare/nascondere UI, mai come unico controllo di sicurezza.
- Principio da rispettare sempre: ogni Server Action che modifica dati sensibili deve chiamare `requireAuth()`/`requireAdmin()` al proprio interno lato server — non fidarsi mai del fatto che la UI nasconda un bottone o un'opzione.

## Schema dati
Definizione completa in `prisma/schema.prisma`; qui solo un riferimento sintetico:
- `Role` — ruoli utente (level determina i permessi, vedi sopra)
- `User` — utenti di sistema (credenziali, anagrafica, `roleId`)
- `Company` — aziende clienti
- `Contact` — contatti, opzionalmente collegati a una `Company`
- `DealState` — stati possibili di una trattativa (lookup table: nuovo/contattato/proposta/vinta/persa...)
- `Deal` — trattativa/opportunità commerciale (valore, stato, proprietario, contatto)
- `ActivityType` — tipologie di attività (chiamata/email/meeting/nota...)
- `Activity` — attività svolte su una `Deal`
- Nota di design: `Activity.userId` è tenuto distinto da `Deal.userId` apposta, per non perdere la storia di chi ha svolto un'attività quando la deal viene riassegnata a un altro utente.

## Route protette
- Configurazione in `src/proxy.ts`, `matcher: ["/dashboard/:path*", "/login"]`.
- Protette (richiedono cookie di sessione): `/dashboard`.
- Pubblica esclusiva (redirect via se già loggato): `/login`.
- Il matcher va aggiornato manualmente ogni volta che si crea una nuova sezione protetta del CRM — non è automatico in base alle pagine esistenti.
