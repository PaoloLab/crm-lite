import Link from 'next/link';
import type { Company } from '@prisma/client';
import { DeleteCompanyButton } from '@/components/companies/DeleteCompanyButton';

export function CompanyList({ companies }: { companies: Company[] }) {
  if (companies.length === 0) {
    return <p>Nessuna azienda registrata.</p>;
  }

  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr>
          <th className="border-b p-2">Nome</th>
          <th className="border-b p-2">Partita IVA</th>
          <th className="border-b p-2">Indirizzo</th>
          <th className="border-b p-2">Azioni</th>
        </tr>
      </thead>
      <tbody>
        {companies.map((company) => (
          <tr key={company.companyId}>
            <td className="border-b p-2">{company.name}</td>
            <td className="border-b p-2">{company.piva}</td>
            <td className="border-b p-2">{company.address}</td>
            <td className="border-b p-2">
              <div className="flex items-center gap-3">
                <Link href={`/companies/${company.companyId}/edit`}>Modifica</Link>
                <DeleteCompanyButton companyId={company.companyId} companyName={company.name} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
