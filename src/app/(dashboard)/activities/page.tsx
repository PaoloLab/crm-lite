import { prisma } from '@/lib/prisma';
import { requireAuth, ownRowsWhere } from '@/lib/authorization';
import { TopbarAction } from '@/components/layout/TopbarAction';
import { ActivitiesView } from '@/components/activities/ActivitiesView';
import { NewActivityButton } from '@/components/activities/NewActivityButton';
import type { ActivityRowData } from '@/components/activities/ActivitiesTable';
import type { ActivityFormDealOption } from '@/components/activities/ActivityForm';

function initialsOf(name: string, surname: string): string {
  return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
}

// "Titolo — Azienda" per il select trattativa (creazione + filtro): stesso
// fallback azienda/contatto già usato in DealsTable quando la trattativa non
// ha un'azienda collegata.
function dealSubtitleOf(deal: { contact: { name: string; surname: string; company: { name: string } | null } }): string {
  return deal.contact.company?.name ?? `${deal.contact.name} ${deal.contact.surname}`;
}

export default async function ActivitiesPage() {
  const user = await requireAuth();

  // Dati per la lista attività: UNA SOLA query Prisma (activity.findMany) con
  // include di deal (+ contact/company annidati), user, activityType — nessuna
  // query per riga. dealStates/activityTypes/deals sono dati di supporto per i
  // filtri e il form di creazione (stesso principio già usato in DealsPage).
  //
  // Filtro per ruolo (ownRowsWhere): su activity.findMany filtra per
  // Activity.userId, cioè "attività che ho svolto io" (l'esecutore, non il
  // proprietario della deal collegata — vedi nota Activity.userId in
  // AGENTS.md); un non-admin non vede quindi le attività svolte da altri
  // colleghi, anche su una propria deal. Applicato anche a deals.findMany
  // (le opzioni del select trattativa nel form di creazione), qui su
  // Deal.userId: un non-admin deve poter scegliere solo tra le trattative
  // che già vede in DealsPage, altrimenti il dropdown rivelerebbe
  // l'esistenza di trattative altrui che la lista Trattative nasconde.
  const [activities, deals, activityTypes] = await Promise.all([
    prisma.activity.findMany({
      where: ownRowsWhere(user),
      orderBy: { date: 'desc' },
      include: {
        deal: { include: { contact: { include: { company: { select: { name: true } } } } } },
        user: { select: { name: true, surname: true } },
        activityType: true,
      },
    }),
    prisma.deal.findMany({
      where: ownRowsWhere(user),
      orderBy: { title: 'asc' },
      include: { contact: { include: { company: { select: { name: true } } } } },
    }),
    prisma.activityType.findMany({ orderBy: { activityTypeId: 'asc' } }),
  ]);

  const activityRows: ActivityRowData[] = activities.map((activity) => ({
    activityId: activity.activityId,
    description: activity.description,
    date: activity.date,
    dealId: activity.dealId,
    dealTitle: activity.deal.title,
    dealSubtitle: dealSubtitleOf(activity.deal),
    activityTypeCode: activity.activityType.code,
    activityTypeLabel: activity.activityType.label,
    userName: `${activity.user.name} ${activity.user.surname}`,
    userInitials: initialsOf(activity.user.name, activity.user.surname),
  }));

  const dealOptions: ActivityFormDealOption[] = deals.map((deal) => ({
    dealId: deal.dealId,
    title: deal.title,
    subtitle: dealSubtitleOf(deal),
  }));

  const activityTypeOptions = activityTypes.map((type) => ({
    activityTypeId: type.activityTypeId,
    code: type.code,
    label: type.label,
  }));

  return (
    <div className="flex h-full flex-col gap-nl-xl">
      <TopbarAction>
        <NewActivityButton deals={dealOptions} activityTypes={activityTypeOptions} />
      </TopbarAction>

      <div>
        <h1 className="font-display text-2xl font-medium text-text-primary">Attività</h1>
      </div>

      {/* ActivitiesView riceve l'altezza residua della pagina: al suo interno
          tiene fissi i filtri e fa scorrere solo l'elenco, stesso pattern
          già usato in CompaniesPage/DealsView. */}
      <div className="min-h-0 flex-1">
        <ActivitiesView activities={activityRows} deals={dealOptions} activityTypes={activityTypeOptions} />
      </div>
    </div>
  );
}
