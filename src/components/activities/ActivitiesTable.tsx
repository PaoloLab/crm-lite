import { ACTIVITY_TYPE_STYLE, DEFAULT_ACTIVITY_TYPE_STYLE } from './activityTypeStyle';

export interface ActivityRowData {
  activityId: number;
  description: string;
  date: Date;
  dealId: number;
  dealTitle: string;
  /** Azienda del contatto della trattativa, o il nome del contatto se senza azienda (stesso fallback di DealsTable). */
  dealSubtitle: string;
  activityTypeCode: string;
  activityTypeLabel: string;
  userName: string;
  userInitials: string;
}

const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' });

function dayKey(date: Date): string {
  return date.toDateString();
}

interface Group {
  key: string;
  title: string;
  subtitle: string | null;
  count: number;
  rows: ActivityRowData[];
}

// Raggruppa per giorno (default, come da mockup) o per trattativa (toggle
// "Trattativa" in ActivitiesView) — i gruppi restano nell'ordine in cui le
// righe sono già ordinate dal chiamante (per data, secondo sortOrder), niente
// riordino aggiuntivo qui.
function groupActivities(activities: ActivityRowData[], groupByDeal: boolean): Group[] {
  const groups = new Map<string, Group>();

  for (const activity of activities) {
    const key = groupByDeal ? String(activity.dealId) : dayKey(activity.date);
    let group = groups.get(key);
    if (!group) {
      group = groupByDeal
        ? { key, title: activity.dealTitle, subtitle: activity.dealSubtitle, count: 0, rows: [] }
        : { key, title: dateFormatter.format(activity.date).toUpperCase(), subtitle: null, count: 0, rows: [] };
      groups.set(key, group);
    }
    group.count += 1;
    group.rows.push(activity);
  }

  return Array.from(groups.values());
}

function ActivityTypeBadge({ code, label }: { code: string; label: string }) {
  const style = ACTIVITY_TYPE_STYLE[code] ?? DEFAULT_ACTIVITY_TYPE_STYLE;
  const Icon = style.icon;
  return (
    <span
      className={[
        'inline-flex items-center gap-nl-4xs rounded-pill py-nl-4xs px-nl-2xs text-tag',
        style.bgClass,
        style.textClass,
      ].join(' ')}
    >
      <Icon size={13} strokeWidth={1.8} />
      {label}
    </span>
  );
}

const GRID_TEMPLATE_COLUMNS = '110px minmax(0,1.6fr) minmax(0,1.1fr) 150px 110px';

export function ActivitiesTable({
  activities,
  groupByDeal,
}: {
  activities: ActivityRowData[];
  groupByDeal: boolean;
}) {
  if (activities.length === 0) {
    return <p className="text-body text-text-secondary">Nessuna attività trovata.</p>;
  }

  const groups = groupActivities(activities, groupByDeal);

  return (
    <div className="overflow-hidden rounded-card border border-border-subtle bg-surface-1">
      <div
        className="grid items-center gap-nl-md bg-surface-2 px-nl-lg py-nl-sm"
        style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
      >
        <span className="text-label uppercase tracking-label text-text-muted">Tipo</span>
        <span className="text-label uppercase tracking-label text-text-muted">Descrizione</span>
        <span className="text-label uppercase tracking-label text-text-muted">Trattativa</span>
        <span className="text-label uppercase tracking-label text-text-muted">Svolta da</span>
        <span className="text-label uppercase tracking-label text-text-muted">Data</span>
      </div>

      {groups.map((group) => (
        <div key={group.key}>
          <div className="flex items-baseline justify-between border-t border-border-subtle bg-surface-2/50 px-nl-lg py-nl-2xs">
            <span className="text-label uppercase tracking-label text-text-secondary">
              {group.title}
              {group.subtitle && (
                <span className="ml-nl-2xs normal-case tracking-normal text-text-muted">
                  {group.subtitle}
                </span>
              )}
            </span>
            <span className="text-tag text-text-muted">
              {group.count} attività
            </span>
          </div>

          {group.rows.map((row) => (
            <div
              key={row.activityId}
              className="grid items-center gap-nl-md border-t border-border-subtle px-nl-lg py-nl-sm text-body text-text-primary hover:bg-surface-2"
              style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
            >
              <span>
                <ActivityTypeBadge code={row.activityTypeCode} label={row.activityTypeLabel} />
              </span>

              <span className="truncate" title={row.description}>
                {row.description}
              </span>

              <span className="flex flex-col truncate">
                <span className="truncate font-medium text-text-primary">{row.dealTitle}</span>
                <span className="truncate text-tag text-text-muted">{row.dealSubtitle}</span>
              </span>

              <span className="flex items-center gap-nl-2xs">
                <span className="flex size-[24px] shrink-0 items-center justify-center rounded-full border border-border bg-surface-3 text-tag font-semibold text-text-primary">
                  {row.userInitials}
                </span>
                <span className="truncate">{row.userName}</span>
              </span>

              <span className="flex flex-col items-end text-right">
                <span>{dateFormatter.format(row.date)}</span>
                <span className="text-tag text-text-muted">{timeFormatter.format(row.date)}</span>
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
