'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** font-display 26px/500. Se assente, il modale non ha aria-labelledby. */
  title?: string;
  children: ReactNode;
  /** Slot per i bottoni azione (es. Annulla + submit). Opzionale. */
  footer?: ReactNode;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const container = containerRef.current;
    container?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !container) return;

      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-nl-md backdrop-blur-[2px]"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className="w-full max-w-[min(480px,90vw)] rounded-modal border border-border-subtle bg-surface-1 p-nl-3xl shadow-modal"
      >
        {title && (
          <h2 id={titleId} className="mb-nl-md font-display text-[26px] font-medium text-text-primary">
            {title}
          </h2>
        )}

        {children}

        {footer && <div className="mt-nl-lg flex justify-end gap-nl-2xs">{footer}</div>}
      </div>
    </div>
  );
}
