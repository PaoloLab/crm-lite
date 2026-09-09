import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** width:100%, padding 12px, font 14px/600 (variante login). */
  fullWidth?: boolean;
  /**
   * Icona opzionale a sinistra. Il componente non forza la dimensione:
   * passare l'icona già dimensionata secondo la convenzione lucide-react
   * del progetto (size 15-19, strokeWidth 1.8 — vedi AGENTS.md).
   */
  icon?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  // Hover non specificato nel documento per il bottone secondario: scelta
  // di design (vedi riepilogo) — leggero fondo surface-2 + testo che
  // schiarisce a text-primary, usando solo token già esistenti.
  secondary:
    'bg-transparent text-text-secondary border border-border hover:bg-surface-2 hover:text-text-primary',
};

export function Button({
  variant = 'primary',
  fullWidth = false,
  icon,
  className,
  children,
  ...rest
}: ButtonProps) {
  const sizeClasses = fullWidth ? 'w-full p-nl-sm text-ui-lg' : 'py-nl-control-y px-nl-lg text-ui';

  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-nl-2xs rounded-control font-sans font-semibold transition-colors',
        // Focus non specificato nel documento: outline visibile con il
        // token primary, scelta di design (vedi riepilogo).
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        sizeClasses,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
