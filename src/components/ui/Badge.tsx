import type { ReactNode } from 'react';

export type BadgeVariant = 'delta-positive' | 'delta-negative' | 'tag' | 'accent';

export interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  'delta-positive': 'bg-success-bg text-success py-nl-5xs px-nl-badge-x text-label',
  'delta-negative': 'bg-danger-bg text-danger py-nl-5xs px-nl-badge-x text-label',
  tag: 'bg-surface-3 text-text-muted py-nl-4xs px-nl-2xs text-tag',
  // Badge "statico" (nessun significato positivo/negativo, es. "media" su
  // MetricCard "Valore medio trattativa"): stessa coppia di token già usata
  // per lo stato attivo della Sidebar (bg-primary-subtle/text-primary-soft).
  accent: 'bg-primary-subtle text-primary-soft py-nl-4xs px-nl-2xs text-tag',
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-pill font-mono leading-none',
        VARIANT_CLASSES[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
