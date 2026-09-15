import { prisma } from '@/lib/prisma';
import { requireAuth, ownRowsWhere } from '@/lib/authorization';
import { TopbarAction } from '@/components/layout/TopbarAction';
import { DealsView } from '@/components/deals/DealsView';
import { NewDealButton } from '@/components/deals/NewDealButton';
import type { DealRowData } from '@/components/deals/DealsTable';

// Stessa firma già usata in activities/page.tsx per l'avatar iniziali —
// duplicata qui invece di condivisa: nessun modulo di utility comuni nel
// progetto, ogni file definisce i propri piccoli helper (vedi AGENTS.md).
function initialsOf(name: string, surname: string): string {
  return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
}

export default async function DealsPage() {
  const user = await requireAuth();

  // Dati per la lista trattative: UNA SOLA query Prisma (deal.findMany) con
  // include di contact (+ company annidata), dealState, user — nessuna
  // query per riga. Include anche le activities collegate (+ user/activityType
  // annidati, ordinate per data DESC) per l'espansione riga della vista
  // Elenco, stesso principio "niente query per riga" già rispettato sopra.
  //
  // Filtro per ruolo (ownRowsWhere): un non-admin vede solo le trattative di
  // cui è proprietario (Deal.userId), l'admin le vede tutte — vedi nota
  // "Autorizzazione basata sul ruolo" in AGENTS.md. dealStates/contacts
  // restano NON filtrati: sono dati di riferimento per il form di creazione
  // (select) e per le colonne Kanban (che devono mostrare anche stati senza
  // trattative, quindi non possono essere derivati dai risultati di
  // deal.findMany), due query aggiuntive necessarie, stesso principio già
  // usato in ContactsPage (contacts + companies via Promise.all) per i dati
  // di supporto al form. Contact resta comunque dato di team (nessun owner,
  // vedi nota Contact in AGENTS.md), quindi la lista contatti per il select
  // non va filtrata.
  const [deals, dealStates, contacts] = await Promise.all([
    prisma.deal.findMany({
      where: ownRowsWhere(user),
      orderBy: { dateLastModified: 'desc' },
      include: {
        contact: { include: { company: { select: { name: true } } } },
        dealState: true,
        user: { select: { name: true, surname: true } },
        activities: {
          orderBy: { date: 'desc' },
          include: {
            user: { select: { name: true, surname: true } },
            activityType: true,
          },
        },
      },
    }),
    prisma.dealState.findMany({ orderBy: { sequence: 'asc' } }),
    prisma.contact.findMany({
      orderBy: [{ surname: 'asc' }, { name: 'asc' }],
      select: { contactId: true, name: true, surname: true },
    }),
  ]);

  // Stato di default per una nuova trattativa: quello con slug "nuovo",
  // recuperato via query (non hardcodato). Fallback al primo stato per
  // sequence solo per robustezza difensiva: prisma/seed.ts garantisce che
  // "nuovo" esista sempre.
  const defaultDealState = dealStates.find((state) => state.slug === 'nuovo') ?? dealStates[0];

  const dealRows: DealRowData[] = deals.map((deal) => ({
    dealId: deal.dealId,
    title: deal.title,
    value: Number(deal.value),
    dealStateId: deal.dealStateId,
    dealStateCode: deal.dealState.code,
    dealStateLabel: deal.dealState.label,
    contactName: `${deal.contact.name} ${deal.contact.surname}`,
    companyName: deal.contact.company?.name ?? null,
    dateLastModified: deal.dateLastModified,
    activities: deal.activities.map((activity) => ({
      activityId: activity.activityId,
      description: activity.description,
      date: activity.date,
      activityTypeCode: activity.activityType.code,
      activityTypeLabel: activity.activityType.label,
      userName: `${activity.user.name} ${activity.user.surname}`,
      userInitials: initialsOf(activity.user.name, activity.user.surname),
    })),
  }));

  const dealStateOptions = dealStates.map((state) => ({
    dealStateId: state.dealStateId,
    code: state.code,
    label: state.label,
  }));

  return (
    <div className="flex h-full flex-col gap-nl-xl">
      <TopbarAction>
        <NewDealButton
          contacts={contacts}
          dealStates={dealStates.map((state) => ({
            dealStateId: state.dealStateId,
            label: state.label,
          }))}
          defaultDealStateId={defaultDealState.dealStateId}
        />
      </TopbarAction>

      <div>
        <h1 className="font-display text-2xl font-medium text-text-primary">Trattative</h1>
      </div>

      {/* DealsView riceve l'altezza residua della pagina: al suo interno tiene
          fissi i tastini Kanban/Elenco e fa scorrere solo la vista attiva,
          stesso pattern già usato in CompaniesPage. */}
      <div className="min-h-0 flex-1">
        <DealsView deals={dealRows} dealStates={dealStateOptions} contacts={contacts} />
      </div>
    </div>
  );
}
