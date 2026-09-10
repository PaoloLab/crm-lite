import type { InputHTMLAttributes, ReactNode } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
}

// Stile "checked" via CSS puro (peer-checked), non componente non
// specificato dal documento — nessuno stato/handler React necessario, resta
// renderizzabile da Server Component come gli altri componenti base.
export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  const box = (
    <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
      <input
        type="checkbox"
        className={[
          'peer size-4 shrink-0 appearance-none rounded-checkbox border border-border bg-surface-2',
          'checked:border-primary checked:bg-primary',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />
      <Check
        size={12}
        strokeWidth={3}
        className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100"
      />
    </span>
  );

  if (!label) {
    return box;
  }

  return (
    <label className="inline-flex items-center gap-nl-2xs text-body text-text-secondary">
      {box}
      {label}
    </label>
  );
}
