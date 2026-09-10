'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Contact } from '@prisma/client';
import { Button, Input } from '@/components/ui';
import {
  createContact,
  updateContact,
  type ContactActionState,
} from '@/app/(dashboard)/contacts/actions';

const initialState: ContactActionState = { success: false };

// Nessun componente Select in components/ui/ (solo Input/Button/Badge/Dot/
// Checkbox/Table/Modal/Card ad oggi): select nativo con le stesse classi di
// Input (variante default) invece di HTML/CSS grezzo non tematizzato — caso
// d'uso singolo, non promosso a componente base come già fatto per altri
// dettagli one-off (vedi AGENTS.md).
const SELECT_CLASSES =
  'w-full rounded-control border border-border bg-surface-2 py-nl-control-y pl-nl-sm pr-nl-sm text-ui text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed';

export function ContactForm({
  defaultValues,
  companies,
  onSuccess,
}: {
  defaultValues?: Contact;
  companies: { companyId: number; name: string }[];
  /** Se assente, comportamento invariato: redirect a /contacts dopo il successo. */
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const action = defaultValues ? updateContact.bind(null, defaultValues.contactId) : createContact;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/contacts');
      }
    }
  }, [state.success, onSuccess, router]);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-nl-md">
      <div className="flex flex-col gap-nl-3xs">
        <Input
          label="Nome"
          id="name"
          name="name"
          defaultValue={defaultValues?.name}
          required
        />
        {state.error?.fieldErrors?.name?.map((message) => (
          <p key={message} role="alert" className="text-sm text-danger">
            {message}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-nl-3xs">
        <Input
          label="Cognome"
          id="surname"
          name="surname"
          defaultValue={defaultValues?.surname}
          required
        />
        {state.error?.fieldErrors?.surname?.map((message) => (
          <p key={message} role="alert" className="text-sm text-danger">
            {message}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-nl-3xs">
        <label className="flex flex-col">
          <span className="mb-nl-3xs text-label uppercase tracking-label text-text-muted">
            Azienda
          </span>
          <select
            id="companyId"
            name="companyId"
            defaultValue={defaultValues?.companyId ? String(defaultValues.companyId) : ''}
            className={SELECT_CLASSES}
          >
            <option value="">Nessuna azienda</option>
            {companies.map((company) => (
              <option key={company.companyId} value={company.companyId}>
                {company.name}
              </option>
            ))}
          </select>
        </label>
        {state.error?.fieldErrors?.companyId?.map((message) => (
          <p key={message} role="alert" className="text-sm text-danger">
            {message}
          </p>
        ))}
      </div>

      {state.error?.formError && (
        <p role="alert" className="text-sm text-danger">
          {state.error.formError}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? 'Salvataggio...' : defaultValues ? 'Salva modifiche' : 'Crea contatto'}
      </Button>
    </form>
  );
}
