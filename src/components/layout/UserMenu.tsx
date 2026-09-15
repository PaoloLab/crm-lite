'use client';

import { useEffect, useRef, useState } from 'react';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import { logoutAction } from '@/lib/session-actions';

export interface UserMenuUser {
  name: string;
  surname: string;
  username: string;
}

function initials(user: UserMenuUser): string {
  return `${user.name[0] ?? ''}${user.surname[0] ?? ''}`.toUpperCase();
}

/**
 * Dropdown avatar (spec: design-system.md, "Menu utente"). "Il mio profilo" e
 * "Preferenze" sono voci segnaposto (nessuna route/azione ancora, come
 * richiesto) — solo "Esci" è funzionante, via logoutAction().
 */
export function UserMenu({ user }: { user: UserMenuUser }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex size-[34px] items-center justify-center rounded-full border border-border bg-surface-3 text-xs font-semibold text-text-primary"
      >
        {initials(user)}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[44px] z-40 w-[196px] rounded-panel border border-border bg-surface-1 p-1.5 shadow-menu"
        >
          <div className="border-b border-border-subtle px-2.5 py-2">
            <p className="truncate text-body font-semibold text-text-primary">
              {user.name} {user.surname}
            </p>
            <p className="truncate text-label text-text-muted">{user.username}</p>
          </div>

          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-nl-2xs rounded-tooltip px-2.5 py-2 text-left text-body text-text-secondary hover:bg-surface-2"
          >
            <UserIcon size={14} strokeWidth={1.8} />
            Il mio profilo
          </button>

          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-nl-2xs rounded-tooltip px-2.5 py-2 text-left text-body text-text-secondary hover:bg-surface-2"
          >
            <Settings size={14} strokeWidth={1.8} />
            Preferenze
          </button>

          <form action={logoutAction}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-nl-2xs rounded-tooltip px-2.5 py-2 text-left text-body text-danger hover:bg-surface-2"
            >
              <LogOut size={14} strokeWidth={1.8} />
              Esci
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
