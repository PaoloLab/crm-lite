'use client';

import { useState, useTransition } from 'react';
import { deleteCompany } from '@/app/companies/actions';

export function DeleteCompanyButton({
  companyId,
  companyName,
}: {
  companyId: number;
  companyName: string;
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
      <button type="button" onClick={handleDelete} disabled={isPending}>
        {isPending ? 'Eliminazione...' : 'Elimina'}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </>
  );
}
