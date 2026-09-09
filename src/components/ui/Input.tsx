import type { InputHTMLAttributes, ReactNode } from 'react';

export type InputVariant = 'default' | 'login' | 'search';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** default: bg surface-2, padding 9px 12px. login: bg surface-1, padding 11px 13px. search: bg surface-1, padding 9px 14px (topbar). */
  variant?: InputVariant;
  /** Variante "valore" con font mono, per campi numerici/monetari. */
  mono?: boolean;
  /** Icona opzionale a sinistra (es. lucide Search, size 15, opacity .7 — usata dal campo ricerca topbar). */
  icon?: ReactNode;
}

const VARIANT_BG_Y_CLASSES: Record<InputVariant, string> = {
  default: 'bg-surface-2 py-nl-control-y',
  login: 'bg-surface-1 py-nl-control-y-login',
  search: 'bg-surface-1 py-nl-control-y',
};

// Padding orizzontale destro: sempre quello "nativo" della variante.
const VARIANT_PADDING_RIGHT: Record<InputVariant, string> = {
  default: 'pr-nl-sm',
  login: 'pr-nl-control-x-login',
  search: 'pr-nl-md',
};

// Padding orizzontale sinistro: quello nativo della variante, a meno che
// non ci sia un'icona (in quel caso serve più spazio per non sovrapporla al testo).
const VARIANT_PADDING_LEFT: Record<InputVariant, string> = {
  default: 'pl-nl-sm',
  login: 'pl-nl-control-x-login',
  search: 'pl-nl-md',
};

const VARIANT_ICON_LEFT: Record<InputVariant, string> = {
  default: 'left-nl-sm',
  login: 'left-nl-control-x-login',
  search: 'left-nl-md',
};

export function Input({
  label,
  variant = 'default',
  mono = false,
  icon,
  className,
  ...rest
}: InputProps) {
  const input = (
    <div className="relative w-full">
      {icon && (
        <span
          className={[
            'pointer-events-none absolute top-1/2 -translate-y-1/2 text-text-muted opacity-70',
            VARIANT_ICON_LEFT[variant],
          ].join(' ')}
        >
          {icon}
        </span>
      )}
      <input
        className={[
          'w-full rounded-control border border-border text-text-primary text-ui placeholder:text-text-muted',
          // Focus non specificato nel documento: outline visibile con il
          // token primary, scelta di design (vedi riepilogo).
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          mono ? 'font-mono' : 'font-sans',
          VARIANT_BG_Y_CLASSES[variant],
          VARIANT_PADDING_RIGHT[variant],
          // 38px: non un valore del documento, solo spazio calcolato per non
          // sovrapporre testo e icona (icona a 14px + 15px di larghezza + gap).
          icon ? 'pl-[38px]' : VARIANT_PADDING_LEFT[variant],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />
    </div>
  );

  if (!label) {
    return input;
  }

  // Associazione label/input tramite nesting (nessun id generato): tiene
  // Input renderizzabile anche come Server Component, senza useId().
  return (
    <label className="flex flex-col">
      <span className="mb-nl-3xs text-label uppercase tracking-label text-text-muted">{label}</span>
      {input}
    </label>
  );
}
