'use client';

import { Dot, Table, type TableColumn } from '@/components/ui';
import { DEAL_STATE_COLOR, DEFAULT_DEAL_STATE_COLOR } from './dealStateColors';

export interface DealRowData {
  dealId: number;
  title: string;
  value: number;
  dealStateCode: string;
  dealStateLabel: string;
  contactName: string;
  companyName: string | null;
  dateLastModified: Date;
}

const currencyFormatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function DealsTable({ deals }: { deals: DealRowData[] }) {
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
      width: '140px',
      render: (row) => (
        <span className="flex items-center gap-nl-2xs">
          <Dot color={DEAL_STATE_COLOR[row.dealStateCode] ?? DEFAULT_DEAL_STATE_COLOR} />
          {row.dealStateLabel}
        </span>
      ),
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
