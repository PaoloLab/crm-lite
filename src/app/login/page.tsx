// app/login/page.tsx
import { redirect } from "next/navigation";
import { login } from "@/lib/session";
import { Button, Checkbox, Input } from "@/components/ui";
import { PasswordField } from "./PasswordField";

// Dati statici/segnaposto: pagina pubblica non autenticata, niente query
// reali sulla pipeline qui (vedi riepilogo).
const PIPELINE_STATS = [
  { value: "184.500 €", label: "Pipeline attiva", accent: "text-success" },
  { value: "12", label: "Trattative aperte", accent: "text-text-primary" },
  { value: "34%", label: "Tasso di chiusura", accent: "text-text-primary" },
] as const;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="grid min-h-screen grid-cols-[1.15fr_1fr]">
      {/* Pannello sinistro: branding, come sidebar/pannelli decorativi
          dell'app, sfondo background-deep (vedi commento token in
          globals.css: "sidebar, pannello destro, pannello login"). */}
      <div className="flex flex-col justify-between bg-background-deep px-nl-4xl py-nl-4xl">
        <div className="flex items-center gap-nl-2xs">
          <span className="flex size-[38px] items-center justify-center rounded-panel bg-[image:var(--gradient-logo)] font-display text-lg font-semibold text-white">
            C
          </span>
          <span className="font-display text-lg font-semibold text-text-primary">CRM-Lite</span>
        </div>

        <div className="flex max-w-md flex-col gap-nl-sm">
          <h1 className="font-display text-4xl font-medium leading-tight text-text-primary">
            La tua pipeline, letta a colpo d&apos;occhio.
          </h1>
          <p className="text-body text-text-secondary">
            Trattative, attività e previsioni in un unico posto. Accedi per riprendere da dove avevi
            lasciato.
          </p>
        </div>

        <div className="flex items-center gap-nl-4xl">
          {PIPELINE_STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-nl-3xs">
              <span className={`font-mono text-xl font-semibold ${stat.accent}`}>{stat.value}</span>
              <span className="text-xs text-text-muted">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pannello destro: form, sfondo background (base pagina, come area
          main del resto dell'app) — divisore border-subtle a sinistra. */}
      <div className="flex items-center justify-center border-l border-border-subtle bg-background px-nl-3xl">
        <div className="w-full max-w-sm">
          <div className="mb-nl-2xl flex flex-col gap-nl-4xs">
            <h2 className="font-display text-2xl font-semibold text-text-primary">Accedi</h2>
            <p className="text-body text-text-secondary">Inserisci le credenziali del tuo account.</p>
          </div>

          {error && (
            <p className="mb-nl-lg rounded-control border border-danger-border bg-danger-bg px-nl-sm py-nl-xs text-body text-danger-text">
              Username o password non validi.
            </p>
          )}

          <form
            className="flex flex-col gap-nl-lg"
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
            <Input
              name="username"
              variant="login"
              label="Utente"
              placeholder="nome.cognome"
              autoComplete="username"
              required
            />

            <PasswordField />

            <div className="flex items-center justify-between">
              <Checkbox name="remember" defaultChecked label="Ricordami" />
              {/* Link non funzionante per ora (vedi riepilogo). */}
              <a href="#" className="text-body text-primary-soft hover:underline">
                Password dimenticata?
              </a>
            </div>

            <Button type="submit" fullWidth>
              Accedi
            </Button>
          </form>

          <p className="mt-nl-lg text-center text-body text-text-secondary">
            Non hai un account?{" "}
            {/* Link non funzionante per ora (vedi riepilogo). */}
            <a href="#" className="text-primary-soft hover:underline">
              Richiedi accesso
            </a>{" "}
            al tuo amministratore.
          </p>
        </div>
      </div>
    </div>
  );
}
