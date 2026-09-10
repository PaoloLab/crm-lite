'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Company } from '@prisma/client';
import {
  createCompany,
  updateCompany,
  type CompanyActionState,
} from '@/app/(dashboard)/companies/actions';

const initialState: CompanyActionState = { success: false };

export function CompanyForm({
  defaultValues,
  onSuccess,
}: {
  defaultValues?: Company;
  /** Se assente, comportamento invariato: redirect a /companies dopo il successo. */
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const action = defaultValues ? updateCompany.bind(null, defaultValues.companyId) : createCompany;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/companies');
      }
    }
  }, [state.success, onSuccess, router]);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name">Nome</label>
        <input id="name" name="name" defaultValue={defaultValues?.name} required />
        {state.error?.fieldErrors?.name?.map((message) => (
          <p key={message} role="alert" className="text-sm text-red-600">
            {message}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="address">Indirizzo</label>
        <input id="address" name="address" defaultValue={defaultValues?.address} required />
        {state.error?.fieldErrors?.address?.map((message) => (
          <p key={message} role="alert" className="text-sm text-red-600">
            {message}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="piva">Partita IVA</label>
        <input id="piva" name="piva" defaultValue={defaultValues?.piva} required />
        {state.error?.fieldErrors?.piva?.map((message) => (
          <p key={message} role="alert" className="text-sm text-red-600">
            {message}
          </p>
        ))}
      </div>

      {state.error?.formError && (
        <p role="alert" className="text-sm text-red-600">
          {state.error.formError}
        </p>
      )}

      <button type="submit" disabled={pending}>
        {pending ? 'Salvataggio...' : defaultValues ? 'Salva modifiche' : 'Crea azienda'}
      </button>
    </form>
  );
}
