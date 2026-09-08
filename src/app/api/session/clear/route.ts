import { NextResponse } from "next/server";
import { logout } from "@/lib/session";

// Le pagine protette (Server Component) non possono scrivere/cancellare
// cookie durante il render: è una restrizione di Next.js, non aggirabile.
// Quando trovano un cookie presente ma una sessione non più valida sul DB,
// reindirizzano qui invece che direttamente a /login: un Route Handler può
// modificare i cookie, quindi qui la pulizia (già implementata in logout(),
// che cancella anche l'eventuale riga Session residua) va effettivamente a
// buon fine. Senza questo passaggio, il proxy - che sa solo se il cookie è
// presente, non se è valido - rimanderebbe l'utente avanti e indietro tra
// /dashboard e /login all'infinito.
export async function GET(request: Request) {
  await logout();
  return NextResponse.redirect(new URL("/login", request.url));
}
