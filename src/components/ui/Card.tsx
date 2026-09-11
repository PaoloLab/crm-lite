import type { ReactNode } from 'react';
import { Badge } from './Badge';
import type { DotColor } from './Dot';

export interface MetricCardProps {
  label: string;
  value: string;
  /** Badge di trend (+12%, -4%, ...). Omesso quando non c'è un periodo di confronto reale — vedi `headerRight`. */
  delta?: {
    direction: 'positive' | 'negative';
    label: string;
  };
  /**
   * Contenuto libero in alto a destra, accanto a `label`: sostituisce
   * `delta` quando il "badge" non è un trend colorato ma un'informazione
   * statica (es. badge "media", testo "1 vinta su 9"). Ha priorità su `delta`.
   */
  headerRight?: ReactNode;
  /**
   * Valori relativi delle 7 barre dello sparkline, dal più vecchio al più
   * recente. L'ultima barra è quella "corrente" e viene renderizzata in
   * colore pieno, le precedenti in tono attenuato. Omesso quando la card
   * non ha uno storico da mostrare (vedi `progress` per l'alternativa).
   */
  sparkline?: [number, number, number, number, number, number, number];
  /** Barra di progresso orizzontale 0-100, alternativa allo sparkline per metriche a percentuale (es. tasso di chiusura). */
  progress?: number;
  /** Sottotitolo sotto il value (es. "su 9 trattative"). */
  sublabel?: string;
}

export function MetricCard({
  label,
  value,
  delta,
  headerRight,
  sparkline,
  progress,
  sublabel,
}: MetricCardProps) {
  const max = sparkline ? Math.max(...sparkline, 1) : 0;
  const topRight =
    headerRight ??
    (delta && (
      <Badge variant={delta.direction === 'positive' ? 'delta-positive' : 'delta-negative'}>
        {delta.label}
      </Badge>
    ));

  return (
    <div className="flex flex-col gap-nl-sm rounded-card border border-border-subtle bg-surface-1 px-nl-xl py-nl-lg">
      <div className="flex items-center justify-between gap-nl-2xs">
        <span className="text-xs text-text-muted">{label}</span>
        {topRight}
      </div>

      <div className="flex flex-col gap-nl-4xs">
        <span className="font-display text-metric font-medium text-text-primary">{value}</span>
        {sublabel && <span className="text-xs text-text-muted">{sublabel}</span>}
      </div>

      {sparkline && (
        <div className="flex h-nl-4xl items-end gap-nl-4xs" aria-hidden="true">
          {sparkline.map((sample, index) => {
            const isCurrent = index === sparkline.length - 1;
            const heightPercent = Math.max((sample / max) * 100, 8);

            return (
              <span
                key={index}
                className={[
                  'flex-1 rounded-t-bar',
                  // Nessun token "dim" nel documento per le barre non correnti:
                  // opacità ridotta derivata dal colore pieno (bg-primary/35),
                  // come suggerito — vedi riepilogo.
                  isCurrent ? 'bg-primary' : 'bg-primary/35',
                ].join(' ')}
                style={{ height: `${heightPercent}%` }}
              />
            );
          })}
        </div>
      )}

      {progress !== undefined && (
        <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-3" aria-hidden="true">
          <div
            className="h-full rounded-pill bg-primary"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export interface DealCardProps {
  title: string;
  value: string;
  stageColor: DotColor;
  stageLabel: string;
  contact?: string;
  tag?: string;
}

const STAGE_BORDER_CLASSES: Record<DotColor, string> = {
  muted: 'border-l-text-muted',
  primary: 'border-l-primary',
  warning: 'border-l-warning',
  success: 'border-l-success',
  danger: 'border-l-danger',
};

export function DealCard({ title, value, stageColor, stageLabel, contact, tag }: DealCardProps) {
  return (
    <div
      className={[
        'flex flex-col gap-nl-4xs rounded-control border border-border-subtle bg-surface-2',
        'border-l-[3px] px-nl-control-x-login py-nl-sm',
        // Hover non specificato dal documento come colore, solo come
        // movimento/bordo: transform + bordo più chiaro (border), 120ms.
        'transition-[transform,border-color] duration-[120ms] hover:-translate-y-0.5 hover:border-border',
        STAGE_BORDER_CLASSES[stageColor],
      ].join(' ')}
    >
      <span className="text-body text-text-primary">{title}</span>
      <span className="font-mono text-body text-text-primary">{value}</span>
      <div className="flex items-center justify-between gap-nl-2xs">
        <span className="text-xs text-text-secondary">
          {stageLabel}
          {contact ? ` · ${contact}` : null}
        </span>
        {tag && <Badge variant="tag">{tag}</Badge>}
      </div>
    </div>
  );
}
