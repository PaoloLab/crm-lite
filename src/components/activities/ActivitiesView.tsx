'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { ActivitiesTable, type ActivityRowData } from './ActivitiesTable';
import type { ActivityFormDealOption, ActivityFormTypeOption } from './ActivityForm';

type SortOrder = 'recent' | 'oldest';
const TYPE_FILTER_ALL = 'ALL';
const DEAL_FILTER_ALL = 'ALL';

// Client Component che possiede tutto lo stato dei filtri: i dati arrivano
// già pronti (e già ordinati per data desc) da app/(dashboard)/activities/page.tsx
// (Server Component), nessuna nuova query qui — stesso principio già usato da
// DealsView per lo stato di vista/aggiornamento ottimistico.
export function ActivitiesView({
  activities,
  deals,
  activityTypes,
}: {
  activities: ActivityRowData[];
  deals: ActivityFormDealOption[];
  activityTypes: ActivityFormTypeOption[];
}) {
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>(TYPE_FILTER_ALL);
  const [dealFilter, setDealFilter] = useState<string>(DEAL_FILTER_ALL);
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');
  const [groupByDeal, setGroupByDeal] = useState(false);

  const filteredActivities = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    const filtered = activities.filter((activity) => {
      if (typeFilter !== TYPE_FILTER_ALL && activity.activityTypeCode !== typeFilter) return false;
      if (dealFilter !== DEAL_FILTER_ALL && String(activity.dealId) !== dealFilter) return false;
      if (normalizedSearch && !activity.description.toLowerCase().includes(normalizedSearch)) {
        return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) =>
      sortOrder === 'recent' ? b.date.getTime() - a.date.getTime() : a.date.getTime() - b.date.getTime()
    );
  }, [activities, searchText, typeFilter, dealFilter, sortOrder]);

  return (
    <div className="flex h-full flex-col gap-nl-lg">
      {/* Barra filtri fissa: non scorre, solo l'elenco sotto ha il proprio
          scroll interno. */}
      <div className="flex flex-wrap items-center justify-between gap-nl-sm">
        <div className="flex flex-wrap items-center gap-nl-sm">
          <div className="w-[260px]">
            <Input
              variant="search"
              icon={<Search size={15} strokeWidth={1.8} />}
              placeholder="Cerca nelle attività"
              aria-label="Cerca nelle attività"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>

          <div className="flex gap-nl-4xs">
            <Button
              type="button"
              variant={typeFilter === TYPE_FILTER_ALL ? 'primary' : 'secondary'}
              onClick={() => setTypeFilter(TYPE_FILTER_ALL)}
            >
              Tutte
            </Button>
            {activityTypes.map((type) => (
              <Button
                key={type.activityTypeId}
                type="button"
                variant={typeFilter === type.code ? 'primary' : 'secondary'}
                onClick={() => setTypeFilter(type.code)}
              >
                {type.label}
              </Button>
            ))}
          </div>

          <div className="w-[240px]">
            <Select
              aria-label="Filtra per trattativa"
              value={dealFilter}
              onChange={setDealFilter}
              options={[
                { value: DEAL_FILTER_ALL, label: 'Tutte le trattative' },
                ...deals.map((deal) => ({
                  value: String(deal.dealId),
                  label: (
                    <>
                      {deal.title} <span className="text-text-muted">— {deal.subtitle}</span>
                    </>
                  ),
                })),
              ]}
            />
          </div>
        </div>

        <div className="flex items-center gap-nl-sm">
          <div className="flex gap-nl-4xs">
            <Button
              type="button"
              variant={sortOrder === 'recent' ? 'primary' : 'secondary'}
              onClick={() => setSortOrder('recent')}
            >
              Recenti
            </Button>
            <Button
              type="button"
              variant={sortOrder === 'oldest' ? 'primary' : 'secondary'}
              onClick={() => setSortOrder('oldest')}
            >
              Meno recenti
            </Button>
          </div>

          <Button
            type="button"
            variant={groupByDeal ? 'primary' : 'secondary'}
            onClick={() => setGroupByDeal((prev) => !prev)}
            aria-pressed={groupByDeal}
          >
            Trattativa
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <ActivitiesTable activities={filteredActivities} groupByDeal={groupByDeal} />
      </div>
    </div>
  );
}
