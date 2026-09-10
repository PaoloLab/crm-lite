'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteContact } from '@/app/(dashboard)/contacts/actions';

export function DeleteContactButton({
  contactId,
  contactName,
  variant = 'text',
}: {
  contactId: number;
  contactName: string;
  /** 'text': bottone testuale. 'icon': solo icona cestino, per righe di Table. */
  variant?: 'text' | 'icon';
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    const confirmed = confirm(
      `Eliminare il contatto "${contactName}"? L'operazione non è reversibile.`
    );
    if (!confirmed) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deleteContact(contactId);
      if (!result.success) {
        setError(result.error ?? "Errore durante l'eliminazione.");
      }
    });
  }

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          aria-label={`Elimina ${contactName}`}
          title={`Elimina ${contactName}`}
          className="flex size-[30px] items-center justify-center rounded-icon text-text-secondary hover:bg-surface-3 hover:text-danger disabled:opacity-50"
        >
          <Trash2 size={15} strokeWidth={1.8} />
        </button>
      ) : (
        <button type="button" onClick={handleDelete} disabled={isPending}>
          {isPending ? 'Eliminazione...' : 'Elimina'}
        </button>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </>
  );
}
