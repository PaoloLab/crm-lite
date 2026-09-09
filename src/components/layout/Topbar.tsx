'use client';

import { Bell, Search } from 'lucide-react';
import { Dot, Input } from '@/components/ui';
import { useTopbarAction } from './TopbarAction';

export function Topbar() {
  const action = useTopbarAction();

  return (
    <header className="flex h-[64px] shrink-0 items-center justify-between gap-nl-md border-b border-border-subtle bg-background px-nl-3xl">
      <div className="max-w-[420px] flex-1">
        <Input
          variant="search"
          icon={<Search size={15} strokeWidth={1.8} />}
          placeholder="Cerca..."
          aria-label="Cerca"
        />
      </div>

      <div className="flex items-center gap-nl-md">
        {action}

        <button
          type="button"
          aria-label="Notifiche"
          className="relative flex size-[36px] items-center justify-center rounded-control text-text-secondary hover:bg-surface-1"
        >
          <Bell size={18} strokeWidth={1.8} />
          <span className="absolute right-1.5 top-1.5 rounded-full border-[1.5px] border-background">
            <Dot color="danger" />
          </span>
        </button>

        {/* Avatar con iniziali statiche: la sessione reale non è ancora
            collegata a questo shell, vedi riepilogo. */}
        <span className="flex size-[34px] items-center justify-center rounded-full border border-border bg-surface-3 text-xs font-semibold text-text-primary">
          MR
        </span>
      </div>
    </header>
  );
}
