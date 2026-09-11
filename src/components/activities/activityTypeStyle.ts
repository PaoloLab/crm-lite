import { Phone, Mail, Users, type LucideIcon } from 'lucide-react';

// I 3 ActivityType seedati (CALL/Chiamata, EMAIL/Email, MEETING/Meeting —
// vedi prisma/seed.ts) mappati a icona + colore. Nessun token colore dedicato
// nel design system per "tipo attività": riuso i 3 token semantici già
// esistenti (primary/warning/success), stesso criterio già usato in
// dealStateColors.ts per DealState. Chiave: ActivityType.code (stabile).
export interface ActivityTypeStyle {
  icon: LucideIcon;
  bgClass: string;
  textClass: string;
}

export const ACTIVITY_TYPE_STYLE: Record<string, ActivityTypeStyle> = {
  CALL: { icon: Phone, bgClass: 'bg-primary-subtle', textClass: 'text-primary-soft' },
  EMAIL: { icon: Mail, bgClass: 'bg-warning-bg', textClass: 'text-warning' },
  MEETING: { icon: Users, bgClass: 'bg-success-bg', textClass: 'text-success' },
};

export const DEFAULT_ACTIVITY_TYPE_STYLE: ActivityTypeStyle = {
  icon: Phone,
  bgClass: 'bg-surface-3',
  textClass: 'text-text-muted',
};
