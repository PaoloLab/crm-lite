import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/authorization';
import { ContactForm } from '@/components/contacts/ContactForm';

export default async function EditContactPage(props: PageProps<'/contacts/[id]/edit'>) {
  await requireAuth();

  const { id } = await props.params;
  const contactId = Number(id);

  if (!Number.isInteger(contactId)) {
    notFound();
  }

  const [contact, companies] = await Promise.all([
    prisma.contact.findUnique({ where: { contactId } }),
    prisma.company.findMany({
      orderBy: { name: 'asc' },
      select: { companyId: true, name: true },
    }),
  ]);

  if (!contact) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-nl-xl">
      <h1 className="font-display text-2xl font-medium text-text-primary">Modifica contatto</h1>
      <ContactForm defaultValues={contact} companies={companies} />
    </div>
  );
}
