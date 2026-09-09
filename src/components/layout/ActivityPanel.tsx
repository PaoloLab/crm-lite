import { Dot, type DotColor } from '@/components/ui';

interface TodayTask {
  title: string;
  time: string;
}

interface RecentActivityItem {
  id: number;
  actor: string;
  description: string;
  time: string;
  color: DotColor;
}

// Dati finti statici: il collegamento a dati reali (task/attività dell'utente
// loggato) è rimandato a un prossimo step, qui isoliamo solo il componente.
const TODAY_TASKS: TodayTask[] = [
  { title: 'Chiamare Orso Logistics per follow-up', time: '10:30' },
  { title: 'Inviare contratto a Corte Vinicola', time: '14:00' },
  { title: 'Demo prodotto con Nordika SRL', time: '16:15' },
];

const RECENT_ACTIVITY: RecentActivityItem[] = [
  {
    id: 1,
    actor: 'Giulia P.',
    description: 'ha spostato Nordika SRL in Qualificato',
    time: '12 minuti fa',
    color: 'primary',
  },
  {
    id: 2,
    actor: 'Marco R.',
    description: 'ha chiuso Lumen Interiors',
    time: '1 ora fa',
    color: 'success',
  },
  {
    id: 3,
    actor: 'Federico T.',
    description: 'ha inviato una proposta a Meridiana Group',
    time: '3 ore fa',
    color: 'warning',
  },
  {
    id: 4,
    actor: 'Laura B.',
    description: 'ha aggiunto un nuovo contatto: Piave Solutions',
    time: 'ieri',
    color: 'primary',
  },
];

export function ActivityPanel() {
  return (
    <aside className="flex w-[300px] shrink-0 flex-col gap-nl-4xl overflow-y-auto border-l border-border-subtle bg-background-deep px-nl-xl py-nl-2xl">
      <section className="flex flex-col gap-nl-sm">
        <h2 className="text-label uppercase tracking-label text-text-muted">Attività di oggi</h2>
        <ul className="flex flex-col gap-nl-xs">
          {TODAY_TASKS.map((task) => (
            <li key={task.title} className="flex items-start gap-nl-xs">
              <input
                type="checkbox"
                aria-label={task.title}
                className="mt-1 size-4 shrink-0 rounded-checkbox border border-border accent-primary"
              />
              <span className="flex flex-col">
                <span className="text-body text-text-primary">{task.title}</span>
                <span className="font-mono text-xs text-text-muted">{task.time}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-nl-sm">
        <h2 className="text-label uppercase tracking-label text-text-muted">Attività recente</h2>
        <ul className="flex flex-col gap-nl-lg">
          {RECENT_ACTIVITY.map((item) => (
            <li key={item.id} className="flex gap-nl-2xs">
              <Dot color={item.color} className="mt-1.5" />
              <span className="flex flex-col">
                <span className="text-body text-text-secondary">
                  <span className="font-semibold text-text-primary">{item.actor}</span>{' '}
                  {item.description}
                </span>
                <span className="text-xs text-text-muted">{item.time}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
