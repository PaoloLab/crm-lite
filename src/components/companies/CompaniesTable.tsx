'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { Dot, Table, type TableColumn } from '@/components/ui';
import { DeleteCompanyButton } from '@/components/companies/DeleteCompanyButton';

export type CompanyStatus = 'cliente' | 'prospect';

export interface CompanyDealRow {
  dealId: number;
  title: string;
  value: number;
  stateLabel: string;
}

export interface CompanyRowData {
  companyId: number;
  name: string;
  address: string;
  piva: string;
  /** 'cliente' se l'azienda ha almeno una trattativa vinta, altrimenti 'prospect'. */
  status: CompanyStatus;
  dealsCount: number;
  dealsValue: number;
  primaryContact: { name: string; surname: string } | null;
  deals: CompanyDealRow[];
}

const currencyFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const STATUS_LABEL: Record<CompanyStatus, string> = {
  cliente: 'Cliente',
  prospect: 'Prospect',
};

function ExpandedField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-nl-4xs">
      <span className="text-label uppercase tracking-label text-text-muted">{label}</span>
      <span className="text-body text-text-secondary">{children}</span>
    </div>
  );
}

// Company non ha un campo "owner": una trattativa ha un userId proprio, ma
// non esiste un proprietario unico a livello di azienda (un'azienda può
// avere trattative di più venditori). Segnaposto esplicito, vedi riepilogo.
const OWNER_PLACEHOLDER = '—';

// Company non ha un campo note: segnaposto esplicito, vedi riepilogo.
const NOTES_PLACEHOLDER = 'Campo note non ancora presente nel modello dati.';

function renderExpandedCompany(row: CompanyRowData) {
  return (
    <>
      <ExpandedField label="Referente principale">
        {row.primaryContact ? (
          `${row.primaryContact.name} ${row.primaryContact.surname}`
        ) : (
          <span className="text-text-muted">Nessun referente collegato</span>
        )}
      </ExpandedField>

      <ExpandedField label="Dati societari">P.IVA {row.piva}</ExpandedField>

      <ExpandedField label="Sede">{row.address}</ExpandedField>

      <ExpandedField label="Relazione">
        {STATUS_LABEL[row.status]}
        {row.dealsCount > 0 && (
          <>
            <br />
            <span className="font-mono text-success">
              {currencyFormatter.format(row.dealsValue)} lifetime
            </span>
          </>
        )}
      </ExpandedField>

      <ExpandedField label="Trattative collegate">
        {row.deals.length === 0 ? (
          <span className="text-text-muted">Nessuna trattativa collegata</span>
        ) : (
          <ul className="flex flex-col gap-nl-4xs">
            {row.deals.map((deal) => (
              <li key={deal.dealId}>
                {deal.title} — {currencyFormatter.format(deal.value)} ({deal.stateLabel})
              </li>
            ))}
          </ul>
        )}
      </ExpandedField>

      <ExpandedField label="Note">
        <span className="text-text-muted">{NOTES_PLACEHOLDER}</span>
      </ExpandedField>
    </>
  );
}

export function CompaniesTable({ companies }: { companies: CompanyRowData[] }) {
  const columns: TableColumn<CompanyRowData>[] = [
    {
      key: 'name',
      label: 'Azienda',
      width: '220px',
      render: (row) => (
        <span className="flex flex-col">
          <span className="text-text-primary">{row.name}</span>
          <span className="text-xs text-text-muted">P.IVA {row.piva}</span>
        </span>
      ),
    },
    { key: 'address', label: 'Sede', width: '160px' },
    {
      key: 'status',
      label: 'Stato',
      width: '120px',
      render: (row) => (
        <span className="flex items-center gap-nl-2xs">
          <Dot color={row.status === 'cliente' ? 'success' : 'primary'} />
          {STATUS_LABEL[row.status]}
        </span>
      ),
    },
    { key: 'dealsCount', label: 'Trattative', width: '100px' },
    {
      key: 'dealsValue',
      label: 'Valore',
      width: '110px',
      render: (row) => (
        <span className="font-mono">{currencyFormatter.format(row.dealsValue)}</span>
      ),
    },
    {
      key: 'companyId',
      label: 'Owner',
      width: '100px',
      render: () => <span className="text-text-muted">{OWNER_PLACEHOLDER}</span>,
    },
    {
      key: 'piva',
      label: 'Azioni',
      render: (row) => (
        <span className="flex items-center gap-nl-4xs">
          <Link
            href={`/companies/${row.companyId}/edit`}
            aria-label={`Modifica ${row.name}`}
            title={`Modifica ${row.name}`}
            onClick={(event) => event.stopPropagation()}
            className="flex size-[30px] items-center justify-center rounded-icon text-text-secondary hover:bg-surface-3 hover:text-text-primary"
          >
            <Pencil size={15} strokeWidth={1.8} />
          </Link>
          <DeleteCompanyButton companyId={row.companyId} companyName={row.name} variant="icon" />
        </span>
      ),
    },
  ];

  if (companies.length === 0) {
    return <p className="text-body text-text-secondary">Nessuna azienda registrata.</p>;
  }

  return (
    <Table
      columns={columns}
      rows={companies}
      rowKey={(row) => row.companyId}
      renderExpanded={renderExpandedCompany}
    />
  );
}
