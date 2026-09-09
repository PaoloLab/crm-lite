import { Button } from '@/components/ui';
import { TopbarAction } from '@/components/layout/TopbarAction';

// Pagina temporanea solo per verificare l'AppShell (sidebar, topbar con
// azione contestuale, pannello attività) — non protetta da src/proxy.ts,
// non linkata da nessuna navigazione. Da cancellare dopo la revisione.
export default function ShellPreviewPage() {
  return (
    <>
      <TopbarAction>
        <Button>+ Nuova azienda</Button>
      </TopbarAction>

      <div className="flex flex-col gap-nl-md">
        <h1 className="font-display text-2xl font-medium text-text-primary">
          Contenuto di pagina (segnaposto)
        </h1>
        <p className="max-w-xl text-ui text-text-secondary">
          Questo testo vive dentro {'{children}'} del layout condiviso: sidebar, topbar (con il
          bottone qui sopra iniettato da questa pagina tramite {'<TopbarAction>'}) e pannello
          attività a destra restano identici su ogni pagina che userà questo shell.
        </p>
      </div>
    </>
  );
}
