'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  TrendingUp,
  Clock,
  BarChart3,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Voci dedotte dalle icone nello screenshot (deciso, vedi riepilogo):
// building -> Aziende, users -> Contatti, trending-up -> Trattative/Pipeline,
// clock -> Attività, bar-chart -> Report. Le pagine di /contacts, /deals,
// /activities, /reports non esistono ancora: il click porta a un 404 di
// Next.js finché non verranno costruite.
const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/companies', label: 'Aziende', icon: Building2 },
  { href: '/contacts', label: 'Contatti', icon: Users },
  { href: '/deals', label: 'Trattative', icon: TrendingUp },
  { href: '/activities', label: 'Attività', icon: Clock },
  { href: '/reports', label: 'Report', icon: BarChart3 },
];

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLink({ href, label, icon: Icon }: NavItem) {
  const pathname = usePathname();
  const isActive = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      title={label}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'relative flex size-[44px] items-center justify-center rounded-control transition-colors',
        isActive
          ? 'bg-primary-subtle text-primary-soft'
          : 'text-text-muted hover:bg-surface-1 hover:text-text-secondary',
      ].join(' ')}
    >
      {isActive && (
        <span
          aria-hidden="true"
          className="absolute left-0 h-[20px] w-[3px] rounded-bar bg-primary"
        />
      )}
      <Icon size={19} strokeWidth={1.8} />
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="flex w-[76px] shrink-0 flex-col items-center gap-nl-3xs border-r border-border-subtle bg-background-deep py-nl-xl">
      <Link
        href="/dashboard"
        aria-label="Northline CRM"
        className="mb-nl-2xl flex size-[38px] items-center justify-center rounded-panel bg-[image:var(--gradient-logo)] font-display text-lg font-semibold text-white"
      >
        C
      </Link>

      <nav className="flex flex-col items-center gap-nl-3xs">
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.href} {...item} />
        ))}
      </nav>

      <div className="flex-1" />

      {/* Impostazioni/Esci: solo icone segnaposto in questo step, nessuna
          pagina/azione ancora collegata (vedi riepilogo). */}
      <button
        type="button"
        title="Impostazioni"
        className="flex size-[44px] items-center justify-center rounded-control text-text-muted hover:bg-surface-1 hover:text-text-secondary"
      >
        <Settings size={19} strokeWidth={1.8} />
      </button>
      <button
        type="button"
        title="Esci"
        className="mb-nl-2xs flex size-[44px] items-center justify-center rounded-control text-text-muted hover:bg-surface-1 hover:text-danger"
      >
        <LogOut size={19} strokeWidth={1.8} />
      </button>
    </aside>
  );
}
