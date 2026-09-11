import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/authorization';
import { MetricCard } from '@/components/ui';
import { TopbarAction } from '@/components/layout/TopbarAction';
import { CompaniesTable, type CompanyRowData } from '@/components/companies/CompaniesTable';
import { NewCompanyButton } from '@/components/companies/NewCompanyButton';

const currencyFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

// Nessuna metrica qui ha uno storico reale su cui calcolare un trend: Company
// non ha un campo data di creazione. Delta e sparkline restano quindi
// segnaposto neutri (nessun dato inventato), a differenza del valore
// principale di ogni card che è sempre calcolato dai dati reali. Vedi
// riepilogo.
const NO_TREND_DELTA = { direction: 'positive' as const, label: 'n/d' };
const NO_TREND_SPARKLINE: [number, number, number, number, number, number, number] = [
  1, 1, 1, 1, 1, 1, 1,
];

export default async function CompaniesPage() {
  await requireAuth();

  // Query invariata nella sua forma (stesso orderBy) rispetto a quella usata
  // finora per il CRUD; l'unica aggiunta è l'include di sola lettura di
  // contatti/trattative, necessario per calcolare Stato/Trattative/Valore
  // nella tabella e le card metriche senza inventare dati né aggiungere una
  // seconda query separata. Nessuna logica di create/update/delete è stata
  // toccata (resta in actions.ts).
  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
    include: {
      contacts: {
        select: {
          name: true,
          surname: true,
          deals: {
            select: {
              dealId: true,
              title: true,
              value: true,
              dealState: { select: { code: true, label: true } },
            },
          },
        },
      },
    },
  });

  const companyRows: CompanyRowData[] = companies.map((company) => {
    const deals = company.contacts.flatMap((contact) => contact.deals);
    const dealsValue = deals.reduce((sum, deal) => sum + Number(deal.value), 0);
    const hasWonDeal = deals.some((deal) => deal.dealState.code === 'WON');
    const primaryContact = company.contacts[0]
      ? { name: company.contacts[0].name, surname: company.contacts[0].surname }
      : null;

    return {
      companyId: company.companyId,
      name: company.name,
      address: company.address,
      piva: company.piva,
      status: hasWonDeal ? 'cliente' : 'prospect',
      dealsCount: deals.length,
      dealsValue,
      primaryContact,
      deals: deals.map((deal) => ({
        dealId: deal.dealId,
        title: deal.title,
        value: Number(deal.value),
        stateLabel: deal.dealState.label,
      })),
    };
  });

  const registeredCompaniesCount = companyRows.length;
  const activeClientsCount = companyRows.filter((row) => row.status === 'cliente').length;
  const prospectsCount = registeredCompaniesCount - activeClientsCount;
  const totalDealsValue = companyRows.reduce((sum, row) => sum + row.dealsValue, 0);

  return (
    <div className="flex h-full flex-col gap-nl-xl">
      <TopbarAction>
        <NewCompanyButton />
      </TopbarAction>

      {/* Intestazione fissa (titolo + card riassuntive): non deve scorrere
          insieme all'elenco sotto, solo l'elenco ha il proprio scroll interno. */}
      <div className="flex flex-col gap-nl-xl">
        <div>
          <h1 className="font-display text-2xl font-medium text-text-primary">Aziende</h1>
        </div>

        <div className="grid grid-cols-1 gap-nl-md sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Aziende registrate"
            value={String(registeredCompaniesCount)}
            delta={NO_TREND_DELTA}
            sparkline={NO_TREND_SPARKLINE}
          />
          <MetricCard
            label="Clienti attivi"
            value={String(activeClientsCount)}
            delta={NO_TREND_DELTA}
            sparkline={NO_TREND_SPARKLINE}
          />
          <MetricCard
            label="Prospect in corso"
            value={String(prospectsCount)}
            delta={NO_TREND_DELTA}
            sparkline={NO_TREND_SPARKLINE}
          />
          <MetricCard
            label="Valore complessivo"
            value={currencyFormatter.format(totalDealsValue)}
            delta={NO_TREND_DELTA}
            sparkline={NO_TREND_SPARKLINE}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <CompaniesTable companies={companyRows} />
      </div>
    </div>
  );
}
