'use client';

import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { DealCard, type DotColor } from '@/components/ui';
import { NewDealButton } from './NewDealButton';
import type { DealFormContactOption } from './DealForm';
import { DEAL_STATE_COLOR, DEFAULT_DEAL_STATE_COLOR } from './dealStateColors';
import type { DealRowData } from './DealsTable';

export interface DealsKanbanState {
  dealStateId: number;
  code: string;
  label: string;
}

const currencyFormatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });

// Card trascinabile: wrapper sottile attorno a DealCard con
// useDraggable(dnd-kit/core). id = dealId (numero, dnd-kit li tratta come
// string | number indifferentemente).
function DraggableDealCard({
  deal,
  stageColor,
  stageLabel,
}: {
  deal: DealRowData;
  stageColor: DotColor;
  stageLabel: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.dealId,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        // Sopra le altre card mentre si trascina, altrimenti finirebbe sotto
        // le colonne successive durante il movimento.
        zIndex: isDragging ? 10 : undefined,
      }}
      className={['touch-none', isDragging ? 'cursor-grabbing opacity-60' : 'cursor-grab'].join(
        ' '
      )}
    >
      <DealCard
        title={deal.title}
        value={currencyFormatter.format(deal.value)}
        stageColor={stageColor}
        stageLabel={stageLabel}
        contact={deal.contactName}
      />
    </div>
  );
}

// Colonna: zona di drop con useDroppable(dnd-kit/core). id = dealStateId.
function KanbanColumn({
  dealState,
  stateDeals,
  stageColor,
  contacts,
  allDealStates,
}: {
  dealState: DealsKanbanState;
  stateDeals: DealRowData[];
  stageColor: DotColor;
  contacts: DealFormContactOption[];
  allDealStates: DealsKanbanState[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: dealState.dealStateId });

  return (
    <div
      ref={setNodeRef}
      className={[
        'flex flex-col gap-nl-sm rounded-card border p-nl-sm transition-colors',
        isOver ? 'border-primary bg-surface-2' : 'border-border-subtle bg-surface-1',
      ].join(' ')}
    >
      <div className="flex items-center justify-between px-nl-2xs">
        <span className="text-label uppercase tracking-label text-text-muted">
          {dealState.label}
        </span>
        <span className="text-xs text-text-muted">{stateDeals.length}</span>
      </div>

      <div className="flex flex-col gap-nl-xs">
        {stateDeals.length === 0 && (
          <p className="px-nl-2xs text-xs text-text-muted">Nessuna trattativa.</p>
        )}
        {stateDeals.map((deal) => (
          <DraggableDealCard
            key={deal.dealId}
            deal={deal}
            stageColor={stageColor}
            stageLabel={dealState.label}
          />
        ))}
      </div>

      <NewDealButton
        contacts={contacts}
        dealStates={allDealStates.map((state) => ({
          dealStateId: state.dealStateId,
          label: state.label,
        }))}
        defaultDealStateId={dealState.dealStateId}
        label="+ Aggiungi trattativa"
        buttonVariant="secondary"
        buttonClassName="w-full justify-center"
      />
    </div>
  );
}

export function DealsKanban({
  deals,
  dealStates,
  contacts,
  onDealStateChange,
}: {
  deals: DealRowData[];
  /** Ordinate per sequence ASC dal chiamante (page.tsx). */
  dealStates: DealsKanbanState[];
  contacts: DealFormContactOption[];
  onDealStateChange: (dealId: number, dealStateId: number) => void;
}) {
  // Piccola distanza di attivazione: evita che un click/tap sulla card parta
  // come drag per un micro-movimento involontario del puntatore.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const dealId = Number(active.id);
    const targetDealStateId = Number(over.id);
    const deal = deals.find((item) => item.dealId === dealId);

    if (!deal || deal.dealStateId === targetDealStateId) return;

    onDealStateChange(dealId, targetDealStateId);
  }

  return (
    // id fisso: senza, dnd-kit genera gli id per aria-describedby con un
    // contatore globale che non coincide tra il render server (SSR di questo
    // Client Component) e l'hydration client, causando un hydration mismatch
    // — vedi https://docs.dndkit.com/api-documentation/context-provider#id.
    <DndContext id="deals-kanban" sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-nl-md sm:grid-cols-2 lg:grid-cols-4">
        {dealStates.map((dealState) => {
          const stateDeals = deals.filter((deal) => deal.dealStateId === dealState.dealStateId);
          const stageColor = DEAL_STATE_COLOR[dealState.code] ?? DEFAULT_DEAL_STATE_COLOR;

          return (
            <KanbanColumn
              key={dealState.dealStateId}
              dealState={dealState}
              stateDeals={stateDeals}
              stageColor={stageColor}
              contacts={contacts}
              allDealStates={dealStates}
            />
          );
        })}
      </div>
    </DndContext>
  );
}
