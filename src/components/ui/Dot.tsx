export type DotColor = 'muted' | 'primary' | 'warning' | 'success' | 'danger';

export interface DotProps {
  /**
   * Colore come nome di token, non hex/CSS libero: garantisce che il
   * pallino usi sempre uno dei colori di stato del design system.
   */
  color: DotColor;
  className?: string;
  'aria-label'?: string;
}

const COLOR_CLASSES: Record<DotColor, string> = {
  muted: 'bg-text-muted', // stage "Nuovo lead"
  primary: 'bg-primary', // stage "Qualificato"
  warning: 'bg-warning', // stage "Proposta inviata"
  success: 'bg-success', // stage "Vinto"
  danger: 'bg-danger', // "trattativa calda"
};

export function Dot({ color, className, ...rest }: DotProps) {
  return (
    <span
      className={[
        'inline-block shrink-0 rounded-full w-nl-badge-x h-nl-badge-x',
        COLOR_CLASSES[color],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  );
}
