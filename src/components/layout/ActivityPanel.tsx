import { prisma } from '@/lib/prisma';
import { Dot } from '@/components/ui';
import { DEAL_STATE_COLOR, DEFAULT_DEAL_STATE_COLOR } from '@/components/deals/dealStateColors';

// Tempo relativo minimale, nessuna libreria: copre i casi del design system
// ("12 minuti fa", "1 ora fa", "ieri"). Non esiste altrove nel progetto
// un'utility di questo tipo da riusare — formatActivityDateTime in
// DealsTable.tsx formatta una data/ora assoluta, non un tempo relativo.
// Oltre i 7 giorni cade su una data assoluta invece di "N giorni fa".
function formatRelativeTime(date: Date): string {
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60_000);

  if (diffMinutes < 1) return 'adesso';
  if (diffMinutes < 60) return `${diffMinutes} minut${diffMinutes === 1 ? 'o' : 'i'} fa`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} or${diffHours === 1 ? 'a' : 'e'} fa`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'ieri';
  if (diffDays < 7) return `${diffDays} giorni fa`;

  return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export async function ActivityPanel() {
  // Ultime 4 attività per data, con l'esecutore (User) e lo stato ATTUALE
  // della deal collegata (Deal -> DealState) per colorare il pallino — non
  // uno storico dello stato al momento dell'attività, che il progetto non
  // traccia. Colore riusa DEAL_STATE_COLOR (dealStateColors.ts, già chiave su
  // DealState.code): stessa mappatura semantica richiesta per slug
  // (nuovo/proposta/vinto/perso), niente da duplicare.
  const activities = await prisma.activity.findMany({
    orderBy: { date: 'desc' },
    take: 4,
    include: {
      user: { select: { name: true, surname: true } },
      deal: { include: { dealState: true } },
    },
  });

  return (
    <aside className="flex w-[300px] shrink-0 flex-col gap-nl-4xl overflow-y-auto border-l border-border-subtle bg-background-deep px-nl-xl py-nl-2xl">
      <section className="flex flex-col gap-nl-sm">
        <h2 className="text-label uppercase tracking-label text-text-muted">Attività recente</h2>
        <ul className="flex flex-col gap-nl-lg">
          {activities.map((activity) => (
            <li key={activity.activityId} className="flex gap-nl-2xs">
              <Dot
                color={DEAL_STATE_COLOR[activity.deal.dealState.code] ?? DEFAULT_DEAL_STATE_COLOR}
                className="mt-1.5"
              />
              <span className="flex flex-col">
                <span className="text-body text-text-secondary">
                  <span className="font-semibold text-text-primary">
                    {activity.user.name} {activity.user.surname}
                  </span>{' '}
                  {activity.description}
                </span>
                <span className="text-xs text-text-muted">{formatRelativeTime(activity.date)}</span>
              </span>
            </li>
          ))}
          {activities.length === 0 && (
            <li className="text-body text-text-muted">Nessuna attività registrata.</li>
          )}
        </ul>
      </section>
    </aside>
  );
}
