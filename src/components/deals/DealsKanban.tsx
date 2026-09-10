'use client';

import { DealCard } from '@/components/ui';
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

export function DealsKanban({
  deals,
  dealStates,
  contacts,
}: {
  deals: (DealRowData & { dealStateId: number })[];
  /** Ordinate per sequence ASC dal chiamante (page.tsx). */
  dealStates: DealsKanbanState[];
  contacts: DealFormContactOption[];
}) {
  return (
    <div className="grid grid-cols-1 gap-nl-md sm:grid-cols-2 lg:grid-cols-4">
      {dealStates.map((dealState) => {
        const stateDeals = deals.filter((deal) => deal.dealStateId === dealState.dealStateId);
        const stageColor = DEAL_STATE_COLOR[dealState.code] ?? DEFAULT_DEAL_STATE_COLOR;

        return (
          <div
            key={dealState.dealStateId}
            className="flex flex-col gap-nl-sm rounded-card border border-border-subtle bg-surface-1 p-nl-sm"
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
                <DealCard
                  key={deal.dealId}
                  title={deal.title}
                  value={currencyFormatter.format(deal.value)}
                  stageColor={stageColor}
                  stageLabel={dealState.label}
                  contact={deal.contactName}
                />
              ))}
            </div>

            <NewDealButton
              contacts={contacts}
              dealStates={dealStates.map((state) => ({
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
      })}
    </div>
  );
}
