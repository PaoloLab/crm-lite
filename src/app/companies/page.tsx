import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/authorization';
import { CompanyList } from '@/components/companies/CompanyList';

export default async function CompaniesPage() {
  await requireAuth();

  const companies = await prisma.company.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Aziende</h1>
        <Link href="/companies/new">+ Nuova azienda</Link>
      </div>

      <CompanyList companies={companies} />
    </div>
  );
}
