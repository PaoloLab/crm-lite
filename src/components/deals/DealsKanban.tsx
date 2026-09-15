'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
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
//
// Il visual del drag vero e proprio è delegato a <DragOverlay> (vedi
// DealsKanban sotto): le colonne hanno overflow-y-auto (per lo scroll interno
// quando una lista è più lunga dello schermo), che per spec CSS forza anche
// overflow-x ad "auto" — qualunque elemento spostato con transform/translate
// FUORI dai bordi della colonna verrebbe quindi tagliato via dal container
// scrollabile a prescindere dallo z-index (bug segnalato: la card sparisce
// dietro la colonna di destinazione). DragOverlay renderizza la copia
// trascinata in un layer separato fuori da questi container con overflow;
// qui l'elemento originale resta fermo e diventa solo un placeholder
// invisibile mentre dura il drag.
function DraggableDealCard({
  deal,
  stageColor,
  stageLabel,
}: {
  deal: DealRowData;
  stageColor: DotColor;
  stageLabel: string;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: deal.dealId,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={['touch-none', isDragging ? 'cursor-grabbing opacity-0' : 'cursor-grab'].join(
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

      {/* max-h approssimato (topbar + padding pagina + titolo + toggle vista +
          header/bottone colonna): niente token esatto disponibile per uno
          spazio che dipende da elementi fuori da questo componente, stesso
          criterio delle altre dimensioni strutturali "una tantum" in
          AGENTS.md. Overflow scoped qui (non su tutta l'area main) così a
          scorrere quando una colonna è più lunga dello schermo è solo la
          colonna, non l'intera board. Stile scrollbar globale, vedi
          globals.css. */}
      <div className="flex flex-col gap-nl-xs overflow-y-auto pr-nl-3xs max-h-[calc(100vh-22rem)]">
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

  const [activeDealId, setActiveDealId] = useState<number | null>(null);
  const activeDeal = deals.find((deal) => deal.dealId === activeDealId) ?? null;
  const activeDealState = activeDeal
    ? dealStates.find((state) => state.dealStateId === activeDeal.dealStateId)
    : undefined;

  function handleDragStart(event: DragStartEvent) {
    setActiveDealId(Number(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDealId(null);
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
    <DndContext
      id="deals-kanban"
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDealId(null)}
    >
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

      {/* Copia visuale della card in drag, renderizzata in un layer fuori
          dai container con overflow delle colonne (vedi commento su
          DraggableDealCard) — segue il puntatore senza essere tagliata. */}
      <DragOverlay>
        {activeDeal ? (
          <DealCard
            title={activeDeal.title}
            value={currencyFormatter.format(activeDeal.value)}
            stageColor={
              activeDealState
                ? (DEAL_STATE_COLOR[activeDealState.code] ?? DEFAULT_DEAL_STATE_COLOR)
                : DEFAULT_DEAL_STATE_COLOR
            }
            stageLabel={activeDealState?.label ?? ''}
            contact={activeDeal.contactName}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
