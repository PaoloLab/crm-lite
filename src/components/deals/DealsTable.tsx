'use client';

import { Dot, Table, type TableColumn } from '@/components/ui';
import { DEAL_STATE_COLOR, DEFAULT_DEAL_STATE_COLOR } from './dealStateColors';

export interface DealRowData {
  dealId: number;
  title: string;
  value: number;
  dealStateId: number;
  dealStateCode: string;
  dealStateLabel: string;
  contactName: string;
  companyName: string | null;
  dateLastModified: Date;
}

// Stessa forma di DealsKanbanState (DealsKanban.tsx): duplicata qui invece di
// importata per evitare un import circolare (DealsKanban importa già
// DealRowData da questo file) — caso d'uso singolo, stesso criterio già usato
// altrove nel progetto per piccole forme di prop one-off (vedi AGENTS.md).
export interface DealStageOption {
  dealStateId: number;
  code: string;
  label: string;
}

const currencyFormatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

// Stesso stile del select nativo di DealForm (nessun componente Select in
// components/ui/), ma più compatto (padding ridotto) per stare dentro una
// cella di tabella.
const STAGE_SELECT_CLASSES =
  'rounded-control border border-border bg-surface-2 py-nl-4xs pl-nl-2xs pr-nl-2xs text-body text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export function DealsTable({
  deals,
  dealStates,
  onDealStateChange,
}: {
  deals: DealRowData[];
  /** Tutti i DealState disponibili, ordinate per sequence dal chiamante (page.tsx). */
  dealStates: DealStageOption[];
  onDealStateChange: (dealId: number, dealStateId: number) => void;
}) {
  const columns: TableColumn<DealRowData>[] = [
    {
      // Non elencata esplicitamente tra le colonne richieste, ma senza titolo
      // le righe di uno stesso contatto/azienda sarebbero indistinguibili
      // (unica altra colonna univoca sarebbe "Azioni", non ancora
      // implementata in questo step — vedi sotto). Aggiunta segnalata.
      key: 'title',
      label: 'Trattativa',
      width: '200px',
    },
    {
      key: 'companyName',
      label: 'Azienda',
      render: (row) => (
        <span className={row.companyName ? undefined : 'text-text-muted'}>
          {row.companyName ?? row.contactName}
        </span>
      ),
    },
    {
      key: 'dealStateLabel',
      label: 'Stage',
      width: '160px',
      render: (row) => {
        // Colore derivato da dealStates (prop, sempre aggiornata) via
        // dealStateId, non da row.dealStateCode: dopo un cambio stato
        // ottimistico row.dealStateCode resterebbe quello vecchio, il colore
        // no.
        const code = dealStates.find((state) => state.dealStateId === row.dealStateId)?.code;
        return (
          <span className="flex items-center gap-nl-2xs">
            <Dot color={DEAL_STATE_COLOR[code ?? ''] ?? DEFAULT_DEAL_STATE_COLOR} />
            <select
              value={row.dealStateId}
              onChange={(event) => onDealStateChange(row.dealId, Number(event.target.value))}
              className={STAGE_SELECT_CLASSES}
              aria-label={`Stato di ${row.title}`}
            >
              {dealStates.map((state) => (
                <option key={state.dealStateId} value={state.dealStateId}>
                  {state.label}
                </option>
              ))}
            </select>
          </span>
        );
      },
    },
    {
      key: 'value',
      label: 'Valore',
      width: '120px',
      render: (row) => <span className="font-mono">{currencyFormatter.format(row.value)}</span>,
    },
    { key: 'contactName', label: 'Contatto', width: '160px' },
    {
      key: 'dateLastModified',
      label: 'Aggiornato',
      width: '110px',
      render: (row) => dateFormatter.format(row.dateLastModified),
    },
    {
      // Nessuna modifica/eliminazione trattativa richiesta in questo step
      // (solo creazione): colonna presente come da richiesta, ma senza
      // azioni cablate — stesso pattern "non wired in questo step" già usato
      // altrove nel progetto (vedi AGENTS.md, sezione AppShell).
      key: 'dealId',
      label: 'Azioni',
      width: '80px',
      render: () => <span className="text-text-muted">—</span>,
    },
  ];

  if (deals.length === 0) {
    return <p className="text-body text-text-secondary">Nessuna trattativa registrata.</p>;
  }

  return <Table columns={columns} rows={deals} rowKey={(row) => row.dealId} />;
}
