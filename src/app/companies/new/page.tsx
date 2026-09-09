import { requireAuth } from '@/lib/authorization';
import { CompanyForm } from '@/components/companies/CompanyForm';

export default async function NewCompanyPage() {
  await requireAuth();

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">Nuova azienda</h1>
      <CompanyForm />
    </div>
  );
}
