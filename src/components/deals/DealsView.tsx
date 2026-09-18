'use client';

import { useEffect, useState } from 'react';
import { updateDealState } from '@/app/(dashboard)/deals/actions';
import { DealsTable, type DealRowData } from './DealsTable';
import { DealsKanban, type DealsKanbanState } from './DealsKanban';
import type { DealFormContactOption } from './DealForm';

type ViewMode = 'kanban' | 'list';

const ERROR_AUTO_DISMISS_MS = 5000;

// Client Component che possiede lo stato locale sia del toggle Kanban/Elenco
// sia dei dealStateId (per l'aggiornamento ottimistico condiviso da
// entrambe le viste: cambiare vista dopo un drag&drop/select non deve perdere
// l'aggiornamento). I dati iniziali arrivano già pronti da
// app/(dashboard)/deals/page.tsx (Server Component); nessuna nuova query qui.
export function DealsView({
  deals: initialDeals,
  dealStates,
  contacts,
  currentUserName,
}: {
  deals: DealRowData[];
  dealStates: DealsKanbanState[];
  contacts: DealFormContactOption[];
  /** Passato solo a DealsTable: AttachmentsModal lo usa per attribuire subito in UI un allegato appena caricato. DealsKanban non gestisce Allegati in questo step. */
  currentUserName: string;
}) {
  const [view, setView] = useState<ViewMode>('list');
  const [deals, setDeals] = useState(initialDeals);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Bug fix: React NON re-inizializza uno useState quando cambia la prop da
  // cui è stato inizializzato (initialDeals) su un componente già montato.
  // Senza questo, dopo router.refresh() (es. da NewDealButton dopo una
  // creazione, o da revalidatePath su qualunque altra Server Action) la
  // pagina server rifà la query con i dati aggiornati ma questo componente
  // continuava a mostrare la sua copia locale ormai stale — da qui il bug
  // "devo uscire e rientrare per vedere la nuova trattativa". Pattern
  // "adjusting state during render" (non un useEffect): la regola
  // react-hooks/set-state-in-effect del progetto vieta setState sincrono
  // dentro un effect, ed eseguirlo durante il render invece che dopo evita
  // comunque un giro di render in più rispetto a un useEffect equivalente.
  const [prevInitialDeals, setPrevInitialDeals] = useState(initialDeals);
  if (initialDeals !== prevInitialDeals) {
    setPrevInitialDeals(initialDeals);
    setDeals(initialDeals);
  }

  // Auto-dismiss del banner errore: nessun pattern di notifica preesistente
  // nel progetto da riusare (vedi AGENTS.md), soluzione più semplice coerente
  // con lo stile esistente (stesse classi del banner errore login).
  useEffect(() => {
    if (!errorMessage) return;
    const timeout = setTimeout(() => setErrorMessage(null), ERROR_AUTO_DISMISS_MS);
    return () => clearTimeout(timeout);
  }, [errorMessage]);

  async function handleDealStateChange(dealId: number, dealStateId: number) {
    const previousDealStateId = deals.find((deal) => deal.dealId === dealId)?.dealStateId;
    if (previousDealStateId === undefined || previousDealStateId === dealStateId) return;

    // Aggiornamento ottimistico: la card/riga si sposta subito, la Server
    // Action parte in background.
    setDeals((prev) =>
      prev.map((deal) => (deal.dealId === dealId ? { ...deal, dealStateId } : deal))
    );

    const result = await updateDealState(dealId, dealStateId);

    if (!result.success) {
      // Rollback allo stato originale se la Server Action fallisce.
      setDeals((prev) =>
        prev.map((deal) =>
          deal.dealId === dealId ? { ...deal, dealStateId: previousDealStateId } : deal
        )
      );
      setErrorMessage(result.error);
    }
  }

  return (
    <div className="flex h-full flex-col gap-nl-lg">
      {/* Barra fissa (banner errore + toggle Kanban/Elenco): non scorre,
          solo la vista sotto (Kanban o Elenco) ha il proprio scroll interno. */}
      {errorMessage && (
        <p
          role="alert"
          className="rounded-control border border-danger-border bg-danger-bg px-nl-sm py-nl-xs text-body text-danger-text"
        >
          {errorMessage}
        </p>
      )}

      <div className="flex justify-end">
        {/* Segmented control (stile tab "Tutte/Clienti/Prospect/Inattive" del
            mockup Companies): container con bordo, tab attiva come pillola
            interna senza spazio tra le voci, invece dei due Button separati
            usati in precedenza. */}
        <div className="inline-flex items-center rounded-pill border border-border bg-surface-1 p-nl-5xs">
          <button
            type="button"
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
            className={[
              'rounded-pill px-nl-sm py-nl-4xs text-ui font-sans font-semibold transition-colors',
              view === 'list'
                ? 'bg-surface-3 text-text-primary'
                : 'text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            Elenco
          </button>
          <button
            type="button"
            onClick={() => setView('kanban')}
            aria-pressed={view === 'kanban'}
            className={[
              'rounded-pill px-nl-sm py-nl-4xs text-ui font-sans font-semibold transition-colors',
              view === 'kanban'
                ? 'bg-surface-3 text-text-primary'
                : 'text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            Kanban
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {view === 'kanban' ? (
          <DealsKanban
            deals={deals}
            dealStates={dealStates}
            contacts={contacts}
            onDealStateChange={handleDealStateChange}
          />
        ) : (
          <DealsTable
            deals={deals}
            dealStates={dealStates}
            onDealStateChange={handleDealStateChange}
            currentUserName={currentUserName}
          />
        )}
      </div>
    </div>
  );
}
