'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { DealsTable, type DealRowData } from './DealsTable';
import { DealsKanban, type DealsKanbanState } from './DealsKanban';
import type { DealFormContactOption } from './DealForm';

type ViewMode = 'kanban' | 'list';

// Client Component che gestisce SOLO lo stato locale del toggle
// Kanban/Elenco: nessuna nuova query al cambio vista, i dati arrivano già
// pronti da app/(dashboard)/deals/page.tsx (Server Component).
export function DealsView({
  deals,
  dealStates,
  contacts,
}: {
  deals: (DealRowData & { dealStateId: number })[];
  dealStates: DealsKanbanState[];
  contacts: DealFormContactOption[];
}) {
  const [view, setView] = useState<ViewMode>('kanban');

  return (
    <div className="flex flex-col gap-nl-lg">
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
        <DealsKanban deals={deals} dealStates={dealStates} contacts={contacts} />
      ) : (
        <DealsTable deals={deals} />
      )}
    </div>
  );
}
