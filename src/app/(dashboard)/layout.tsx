import type { ReactNode } from 'react';
import { ActivityPanel } from '@/components/layout/ActivityPanel';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { TopbarActionProvider } from '@/components/layout/TopbarAction';

// Shell condiviso da tutte le sezioni del CRM (Aziende, Contatti, Trattative,
// ecc.). Non protegge le route: quello resta compito di src/proxy.ts e di
// requireAuth()/requireAdmin() nelle singole pagine, come per il resto del
// progetto — questo layout è puro guscio visivo.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <TopbarActionProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-y-auto px-nl-3xl py-nl-4xl">{children}</main>
        </div>
        <ActivityPanel />
      </div>
    </TopbarActionProvider>
  );
}
