'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
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
}: {
  deals: DealRowData[];
  dealStates: DealsKanbanState[];
  contacts: DealFormContactOption[];
}) {
  const [view, setView] = useState<ViewMode>('kanban');
  const [deals, setDeals] = useState(initialDeals);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    <div className="flex flex-col gap-nl-lg">
      {errorMessage && (
        <p
          role="alert"
          className="rounded-control border border-danger-border bg-danger-bg px-nl-sm py-nl-xs text-body text-danger-text"
        >
          {errorMessage}
        </p>
      )}

      <div className="flex gap-nl-2xs">
        <Button
          variant={view === 'kanban' ? 'primary' : 'secondary'}
          onClick={() => setView('kanban')}
        >
          Kanban
        </Button>
        <Button variant={view === 'list' ? 'primary' : 'secondary'} onClick={() => setView('list')}>
          Elenco
        </Button>
      </div>

      {view === 'kanban' ? (
        <DealsKanban
          deals={deals}
          dealStates={dealStates}
          contacts={contacts}
          onDealStateChange={handleDealStateChange}
        />
      ) : (
        <DealsTable deals={deals} dealStates={dealStates} onDealStateChange={handleDealStateChange} />
      )}
    </div>
  );
}
