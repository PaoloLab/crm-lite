import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/authorization';
import { MetricCard, Badge, Dot, type DotColor } from '@/components/ui';
import { DEAL_STATE_COLOR, DEFAULT_DEAL_STATE_COLOR } from '@/components/deals/dealStateColors';
import { PipelineTrendChart, type PipelineTrendPoint } from '@/components/dashboard/PipelineTrendChart';

const currencyFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

// Chiavi stabili di prisma/seed.ts (DealState.code): WON/LOST sono gli unici
// due stati "chiusi", usati sia per escludere la pipeline aperta sia per il
// tasso di chiusura.
const WON_CODE = 'WON';
const LOST_CODE = 'LOST';

const STAGE_BAR_BG: Record<DotColor, string> = {
  muted: 'bg-text-muted',
  primary: 'bg-primary',
  warning: 'bg-warning',
  success: 'bg-success',
  danger: 'bg-danger',
};

const MONTHS_IT_SHORT = [
  'gen',
  'feb',
  'mar',
  'apr',
  'mag',
  'giu',
  'lug',
  'ago',
  'set',
  'ott',
  'nov',
  'dic',
];

function monthKey(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default async function DashboardPage() {
  await requireAuth();

  // Ogni metrica è calcolata su tutti i dati presenti nel DB, nessun filtro
  // periodo (requisito esplicito, nessun toggle Mese/Trimestre/Anno). Le
  // prime query usano aggregate()/groupBy() di Prisma dove la metrica è un
  // singolo numero/gruppo; le liste "per entità" (aziende, squadra) restano
  // sul pattern già usato in CompaniesPage (findMany con include + reduce in
  // JS), perché richiedono un aggregato su una relazione annidata (Company ->
  // Contact -> Deal / User -> Deal) che Prisma non esprime in un solo
  // groupBy.
  const [
    openPipelineAgg,
    wonAgg,
    wonCount,
    lostCount,
    allDealsAgg,
    openDealStates,
    stageGroups,
    companiesWithDeals,
    usersWithActiveDeals,
    dealsForChart,
  ] = await Promise.all([
    prisma.deal.aggregate({
      _sum: { value: true },
      where: { dealState: { code: { notIn: [WON_CODE, LOST_CODE] } } },
    }),
    prisma.deal.aggregate({
      _sum: { value: true },
      where: { dealState: { code: WON_CODE } },
    }),
    prisma.deal.count({ where: { dealState: { code: WON_CODE } } }),
    prisma.deal.count({ where: { dealState: { code: LOST_CODE } } }),
    prisma.deal.aggregate({ _avg: { value: true }, _count: { _all: true } }),
    // "Pipeline per fase" replica la logica del mockup approvato: include lo
    // stato "Vinto" (è l'ultimo stadio del funnel), esclude solo "Perso" (è
    // un'uscita dal funnel, non uno stadio).
    prisma.dealState.findMany({
      where: { code: { not: LOST_CODE } },
      orderBy: { sequence: 'asc' },
    }),
    prisma.deal.groupBy({ by: ['dealStateId'], _sum: { value: true }, _count: { _all: true } }),
    prisma.company.findMany({
      select: {
        companyId: true,
        name: true,
        contacts: { select: { deals: { select: { value: true } } } },
      },
    }),
    prisma.user.findMany({
      select: {
        userId: true,
        name: true,
        surname: true,
        deals: {
          where: { dealState: { code: { notIn: [WON_CODE, LOST_CODE] } } },
          select: { value: true },
        },
      },
    }),
    prisma.deal.findMany({
      select: {
        value: true,
        dateCreation: true,
        dateLastModified: true,
        dealState: { select: { code: true } },
      },
    }),
  ]);

  // --- Card 1/2: pipeline aperta e vinto ---
  const openPipelineValue = Number(openPipelineAgg._sum.value ?? 0);
  const wonValue = Number(wonAgg._sum.value ?? 0);

  // --- Card 3: tasso di chiusura (solo trattative chiuse: vinte + perse) ---
  const closedCount = wonCount + lostCount;
  const closureRate = closedCount > 0 ? (wonCount / closedCount) * 100 : 0;

  // --- Card 4: valore medio su TUTTI i deal, ogni stato incluso ---
  const avgDealValue = Number(allDealsAgg._avg.value ?? 0);
  const totalDealsCount = allDealsAgg._count._all;

  // --- Pipeline per fase ---
  const stageAggById = new Map(
    stageGroups.map((group) => [
      group.dealStateId,
      { value: Number(group._sum.value ?? 0), count: group._count._all },
    ])
  );
  const stageRows = openDealStates.map((state) => {
    const agg = stageAggById.get(state.dealStateId) ?? { value: 0, count: 0 };
    return {
      id: state.dealStateId,
      label: state.label,
      color: DEAL_STATE_COLOR[state.code] ?? DEFAULT_DEAL_STATE_COLOR,
      count: agg.count,
      value: agg.value,
    };
  });
  const stageTotalValue = stageRows.reduce((sum, row) => sum + row.value, 0);
  const maxStageValue = Math.max(...stageRows.map((row) => row.value), 1);

  // --- Aziende per valore: somma di TUTTE le trattative collegate (ogni
  // stato), non solo quelle aperte — "valore" complessivo generato
  // dall'azienda, non solo pipeline residua. Nessuna azienda con valore 0
  // in classifica (non aggiungerebbe informazione). ---
  const companyRows = companiesWithDeals
    .map((company) => ({
      id: company.companyId,
      name: company.name,
      value: company.contacts
        .flatMap((contact) => contact.deals)
        .reduce((sum, deal) => sum + Number(deal.value), 0),
    }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const maxCompanyValue = Math.max(...companyRows.map((row) => row.value), 1);

  // --- Squadra commerciale: valore/conteggio delle trattative ATTIVE (non
  // vinte/perse) per utente, come da sottotitolo "N trattative attive". ---
  const teamRows = usersWithActiveDeals
    .map((user) => ({
      id: user.userId,
      name: `${user.name} ${user.surname}`,
      value: user.deals.reduce((sum, deal) => sum + Number(deal.value), 0),
      count: user.deals.length,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // --- Andamento valore pipeline: ultimi 6 mesi, "Vinto" è storico reale
  // (SUM per mese di dateLastModified dei deal vinti), "Pipeline aperta" è
  // un'APPROSSIMAZIONE (non uno storico reale: il progetto non ha una
  // tabella di snapshot). Per ogni mese sommiamo il valore dei deal
  // ATTUALMENTE aperti la cui dateCreation cade in quel mese o prima — quindi
  // mostra "quanto pipeline aperta oggi risale a quel mese", non il valore
  // di pipeline che esisteva realmente in quel mese passato (trattative da
  // allora chiuse/vinte non compaiono più). Da non scambiare per uno storico
  // affidabile.
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return { key: monthKey(date), label: MONTHS_IT_SHORT[date.getMonth()] };
  });

  const wonValueByMonth = new Map<number, number>();
  for (const deal of dealsForChart) {
    if (deal.dealState.code === WON_CODE) {
      const key = monthKey(deal.dateLastModified);
      wonValueByMonth.set(key, (wonValueByMonth.get(key) ?? 0) + Number(deal.value));
    }
  }

  const openDealsForChart = dealsForChart.filter(
    (deal) => deal.dealState.code !== WON_CODE && deal.dealState.code !== LOST_CODE
  );

  const chartData: PipelineTrendPoint[] = months.map((month) => {
    const pipelineAperta = openDealsForChart
      .filter((deal) => monthKey(deal.dateCreation) <= month.key)
      .reduce((sum, deal) => sum + Number(deal.value), 0);

    return {
      month: month.label,
      vinto: wonValueByMonth.get(month.key) ?? 0,
      pipelineAperta,
    };
  });

  return (
    <div className="flex flex-col gap-nl-xl">
      <div>
        <h1 className="font-display text-2xl font-medium text-text-primary">Dashboard</h1>
        {/* "aggiornato alle HH:MM" riflette l'orario reale del render server
            (nessuna cache), non una stima inventata come "4 minuti fa" del
            mockup — qui non esiste un timestamp di "ultimo dato cambiato". */}
        <p className="text-xs text-text-muted">
          Panoramica commerciale · aggiornato alle{' '}
          {now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-nl-md sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Valore pipeline aperta" value={currencyFormatter.format(openPipelineValue)} />
        <MetricCard label="Vinto" value={currencyFormatter.format(wonValue)} />
        <MetricCard
          label="Tasso di chiusura"
          value={closedCount > 0 ? `${Math.round(closureRate)}%` : '—'}
          headerRight={
            <span className="text-label text-text-muted">
              {closedCount > 0
                ? `${wonCount} ${wonCount === 1 ? 'vinta' : 'vinte'} su ${closedCount}`
                : 'nessuna chiusa'}
            </span>
          }
          progress={closureRate}
        />
        <MetricCard
          label="Valore medio trattativa"
          value={currencyFormatter.format(avgDealValue)}
          headerRight={<Badge variant="accent">media</Badge>}
          sublabel={`su ${totalDealsCount} trattative`}
        />
      </div>

      <div className="grid grid-cols-1 gap-nl-md lg:grid-cols-5">
        <div className="flex flex-col gap-nl-lg rounded-card border border-border-subtle bg-surface-1 p-nl-xl lg:col-span-2">
          <div className="flex items-center justify-between gap-nl-sm">
            <h2 className="text-body font-medium text-text-primary">Pipeline per fase</h2>
            <Link href="/deals" className="shrink-0 text-xs text-primary-soft hover:underline">
              Apri trattative →
            </Link>
          </div>

          <div className="flex h-2 w-full overflow-hidden rounded-pill bg-surface-3" aria-hidden="true">
            {stageRows.map(
              (row) =>
                stageTotalValue > 0 &&
                row.value > 0 && (
                  <div
                    key={row.id}
                    className={STAGE_BAR_BG[row.color]}
                    style={{ width: `${(row.value / stageTotalValue) * 100}%` }}
                  />
                )
            )}
          </div>

          <div className="flex flex-col gap-nl-sm">
            {stageRows.map((row) => (
              <div key={row.id} className="flex items-center gap-nl-sm">
                <Dot color={row.color} />
                <span className="w-[100px] shrink-0 truncate text-body text-text-secondary">
                  {row.label}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-3">
                  <div
                    className={`h-full rounded-pill ${STAGE_BAR_BG[row.color]}`}
                    style={{ width: `${(row.value / maxStageValue) * 100}%` }}
                  />
                </div>
                <span className="w-[64px] shrink-0 text-right text-xs text-text-muted">
                  {row.count} tratt.
                </span>
                <span className="w-[90px] shrink-0 text-right font-mono text-body text-text-primary">
                  {currencyFormatter.format(row.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-nl-md rounded-card border border-border-subtle bg-surface-1 p-nl-xl lg:col-span-3">
          <div className="flex flex-wrap items-start justify-between gap-nl-sm">
            <div>
              <h2 className="text-body font-medium text-text-primary">Andamento valore pipeline</h2>
              <p className="text-xs text-text-muted">Somma valore trattative per mese · ultimi 6 mesi</p>
            </div>
            <div className="flex items-center gap-nl-lg">
              <span className="flex items-center gap-nl-3xs text-xs text-text-secondary">
                <Dot color="primary" /> Pipeline aperta{' '}
                <span className="font-mono text-text-primary">
                  {currencyFormatter.format(openPipelineValue)}
                </span>
              </span>
              <span className="flex items-center gap-nl-3xs text-xs text-text-secondary">
                <Dot color="success" /> Vinto{' '}
                <span className="font-mono text-text-primary">{currencyFormatter.format(wonValue)}</span>
              </span>
            </div>
          </div>

          <PipelineTrendChart data={chartData} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-nl-md lg:grid-cols-2">
        <div className="flex flex-col gap-nl-lg rounded-card border border-border-subtle bg-surface-1 p-nl-xl">
          <h2 className="text-body font-medium text-text-primary">Aziende per valore</h2>
          <div className="flex flex-col gap-nl-md">
            {companyRows.map((row) => (
              <div key={row.id} className="flex items-center gap-nl-sm">
                <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-surface-3 text-xs font-medium text-text-secondary">
                  {initials(row.name)}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-nl-4xs">
                  <div className="flex items-center justify-between gap-nl-sm">
                    <span className="truncate text-body text-text-primary">{row.name}</span>
                    <span className="shrink-0 font-mono text-body text-text-primary">
                      {currencyFormatter.format(row.value)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-3">
                    <div
                      className="h-full rounded-pill bg-primary"
                      style={{ width: `${(row.value / maxCompanyValue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {companyRows.length === 0 && (
              <p className="text-xs text-text-muted">Nessuna trattativa registrata.</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-nl-lg rounded-card border border-border-subtle bg-surface-1 p-nl-xl">
          <h2 className="text-body font-medium text-text-primary">Squadra commerciale</h2>
          <div className="flex flex-col gap-nl-md">
            {teamRows.map((row) => (
              <div key={row.id} className="flex items-center gap-nl-sm">
                <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-surface-3 text-xs font-medium text-text-secondary">
                  {initials(row.name)}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-body text-text-primary">{row.name}</span>
                  <span className="text-xs text-text-muted">
                    {row.count} {row.count === 1 ? 'trattativa attiva' : 'trattative attive'}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-body text-text-primary">
                  {currencyFormatter.format(row.value)}
                </span>
              </div>
            ))}
            {teamRows.length === 0 && (
              <p className="text-xs text-text-muted">Nessuna trattativa attiva.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
