import { redirect } from "next/navigation";
import { logout } from "@/lib/session";
import { requireAuth, requireAdmin } from "@/lib/authorization";

export default async function DashboardPage() {
  const user = await requireAuth();

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

      {/*
        TEST TEMPORANEO - da rimuovere quando esiste una vera pagina admin.

        Il bottone è visibile a chiunque sia loggato, admin o no: qui non
        serve nasconderlo con isAdmin(), perché è proprio così che si
        verifica che il controllo server-side funzioni in entrambi i casi.
        La vera protezione è dentro la Server Action, che chiama
        requireAdmin() come primo controllo prima di fare qualunque altra
        cosa - esattamente come dovrebbe fare qualunque Server Action
        riservata agli admin in futuro.
      */}
      <form
        action={async () => {
          "use server";
          const adminUser = await requireAdmin();
          console.log(
            `[TEST TEMPORANEO] Accesso area admin concesso a "${adminUser.username}" (role: ${adminUser.role.description}, level: ${adminUser.role.level})`
          );
        }}
      >
        <button type="submit">Area riservata admin</button>
      </form>
    </div>
  );
}
