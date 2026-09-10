'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { Table, type TableColumn } from '@/components/ui';
import { DeleteContactButton } from '@/components/contacts/DeleteContactButton';

export interface ContactRowData {
  contactId: number;
  name: string;
  surname: string;
  companyName: string | null;
}

export function ContactsTable({ contacts }: { contacts: ContactRowData[] }) {
  const columns: TableColumn<ContactRowData>[] = [
    { key: 'surname', label: 'Cognome', width: '180px' },
    { key: 'name', label: 'Nome', width: '180px' },
    {
      key: 'companyName',
      label: 'Azienda',
      render: (row) => (
        <span className={row.companyName ? undefined : 'text-text-muted'}>
          {row.companyName ?? 'Nessuna azienda'}
        </span>
      ),
    },
    {
      key: 'contactId',
      label: 'Azioni',
      width: '90px',
      render: (row) => (
        <span className="flex items-center gap-nl-4xs">
          <Link
            href={`/contacts/${row.contactId}/edit`}
            aria-label={`Modifica ${row.name} ${row.surname}`}
            title={`Modifica ${row.name} ${row.surname}`}
            className="flex size-[30px] items-center justify-center rounded-icon text-text-secondary hover:bg-surface-3 hover:text-text-primary"
          >
            <Pencil size={15} strokeWidth={1.8} />
          </Link>
          <DeleteContactButton
            contactId={row.contactId}
            contactName={`${row.name} ${row.surname}`}
            variant="icon"
          />
        </span>
      ),
    },
  ];

  if (contacts.length === 0) {
    return <p className="text-body text-text-secondary">Nessun contatto registrato.</p>;
  }

  return <Table columns={columns} rows={contacts} rowKey={(row) => row.contactId} />;
}
