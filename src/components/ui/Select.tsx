'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  'aria-label'?: string;
  className?: string;
}

// Listbox custom: sostituisce il <select> nativo (stile OS, non tematizzabile)
// mantenendo lo stesso ruolo di trigger+popup già usato da UserMenu
// (radius-panel/shadow-menu). Massimo 10 opzioni visibili senza scroll:
// altezza riga ~36px (px-2.5 py-2 + text-body) * 10 = 360px.
const MAX_VISIBLE_HEIGHT = 360;

export function Select({ options, value, onChange, placeholder, className, ...rest }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const ariaLabel = rest['aria-label'];
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const activeItem = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    activeItem?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  // Calcola l'indice iniziale al momento dell'apertura (non in un effect
  // sincronizzato su `open`, per evitare un setState in cascata subito dopo
  // il render che ha aperto il popup).
  function openDropdown() {
    const currentIndex = options.findIndex((option) => option.value === value);
    setActiveIndex(currentIndex >= 0 ? currentIndex : 0);
    setOpen(true);
  }

  function selectOption(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        openDropdown();
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, options.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectOption(activeIndex);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openDropdown())}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={[
          'flex w-full items-center justify-between gap-nl-2xs rounded-control border border-border bg-surface-2 py-nl-control-y pl-nl-sm pr-nl-sm text-ui text-text-primary',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className={['truncate', selected ? 'text-text-primary' : 'text-text-muted'].join(' ')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={15}
          strokeWidth={1.8}
          className={['shrink-0 text-text-muted transition-transform', open ? 'rotate-180' : ''].join(' ')}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel}
          className="absolute left-0 top-[calc(100%+4px)] z-40 min-w-full w-max max-w-[360px] overflow-y-auto rounded-panel border border-border bg-surface-1 p-1.5 shadow-menu"
          style={{ maxHeight: MAX_VISIBLE_HEIGHT }}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(index)}
                className={[
                  'flex cursor-pointer items-center justify-between gap-nl-2xs rounded-tooltip px-2.5 py-2 text-body',
                  isSelected ? 'text-text-primary' : 'text-text-secondary',
                  index === activeIndex ? 'bg-surface-2' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check size={14} strokeWidth={1.8} className="shrink-0 text-primary" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
