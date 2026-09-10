import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/authorization';
import { TopbarAction } from '@/components/layout/TopbarAction';
import { ContactsTable, type ContactRowData } from '@/components/contacts/ContactsTable';
import { NewContactButton } from '@/components/contacts/NewContactButton';

export default async function ContactsPage() {
  await requireAuth();

  const [contacts, companies] = await Promise.all([
    prisma.contact.findMany({
      orderBy: [{ surname: 'asc' }, { name: 'asc' }],
      include: { company: { select: { name: true } } },
    }),
    prisma.company.findMany({
      orderBy: { name: 'asc' },
      select: { companyId: true, name: true },
    }),
  ]);

  const contactRows: ContactRowData[] = contacts.map((contact) => ({
    contactId: contact.contactId,
    name: contact.name,
    surname: contact.surname,
    companyName: contact.company?.name ?? null,
  }));

  return (
    <div className="flex flex-col gap-nl-xl">
      <TopbarAction>
        <NewContactButton companies={companies} />
      </TopbarAction>

      <div>
        <h1 className="font-display text-2xl font-medium text-text-primary">Contatti</h1>
      </div>

      <ContactsTable contacts={contactRows} />
    </div>
  );
}
