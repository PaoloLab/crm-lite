import { redirect } from "next/navigation";
import { getCurrentUser, logout } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    // Non un redirect diretto a /login: un Server Component non può
    // cancellare il cookie di sessione ormai orfano (vedi la route per il
    // perché), e senza pulirlo il proxy rimanderebbe qui all'infinito.
    redirect("/api/session/clear");
  }

  return (
    <div>
      <p>
        Ciao, {user.name} {user.surname}
      </p>
      <form
        action={async () => {
          "use server";
          await logout();
          redirect("/login");
        }}
      >
        <button type="submit">Logout</button>
      </form>
    </div>
  );
}
