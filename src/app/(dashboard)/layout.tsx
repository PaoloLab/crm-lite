import type { ReactNode } from 'react';
import { ActivityPanel } from '@/components/layout/ActivityPanel';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { TopbarActionProvider } from '@/components/layout/TopbarAction';
import { getCurrentUser } from '@/lib/session';

// Shell condiviso da tutte le sezioni del CRM (Aziende, Contatti, Trattative,
// ecc.). Non protegge le route: quello resta compito di src/proxy.ts e di
// requireAuth()/requireAdmin() nelle singole pagine, come per il resto del
// progetto — questo layout è puro guscio visivo. Usa getCurrentUser() (non
// requireAuth()) solo per leggere i dati da mostrare nel menu utente della
// Topbar: nessun redirect qui, ogni pagina protegge già se stessa.
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <TopbarActionProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar user={user ?? { name: '?', surname: '', username: '' }} />
          <main className="flex-1 overflow-y-auto px-nl-3xl py-nl-4xl">{children}</main>
        </div>
        <ActivityPanel />
      </div>
    </TopbarActionProvider>
  );
}
