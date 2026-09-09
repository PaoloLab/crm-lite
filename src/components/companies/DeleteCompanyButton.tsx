'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteCompany } from '@/app/(dashboard)/companies/actions';

export function DeleteCompanyButton({
  companyId,
  companyName,
  variant = 'text',
}: {
  companyId: number;
  companyName: string;
  /** 'text': bottone testuale (usato finora). 'icon': solo icona cestino, per righe di Table. */
  variant?: 'text' | 'icon';
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    const confirmed = confirm(
      `Eliminare l'azienda "${companyName}"? L'operazione non è reversibile.`
    );
    if (!confirmed) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deleteCompany(companyId);
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
          aria-label={`Elimina ${companyName}`}
          title={`Elimina ${companyName}`}
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
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </>
  );
}
