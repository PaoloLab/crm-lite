// app/login/page.tsx
import { redirect } from "next/navigation";
import { login } from "@/lib/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <form
      action={async (formData) => {
        "use server";

        const username = formData.get("username");
        const password = formData.get("password");

        const success =
          typeof username === "string" &&
          typeof password === "string" &&
          (await login(username, password));

        if (!success) {
          redirect("/login?error=1");
        }

        redirect("/dashboard");
      }}
    >
      {error && <p>Username o password non validi.</p>}
      <input name="username" placeholder="Username" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  );
}
