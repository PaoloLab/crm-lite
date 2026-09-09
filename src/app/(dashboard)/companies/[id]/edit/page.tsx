import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/authorization';
import { CompanyForm } from '@/components/companies/CompanyForm';

export default async function EditCompanyPage(props: PageProps<'/companies/[id]/edit'>) {
  await requireAuth();

  const { id } = await props.params;
  const companyId = Number(id);

  if (!Number.isInteger(companyId)) {
    notFound();
  }

  const company = await prisma.company.findUnique({ where: { companyId } });

  if (!company) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">Modifica azienda</h1>
      <CompanyForm defaultValues={company} />
    </div>
  );
}
