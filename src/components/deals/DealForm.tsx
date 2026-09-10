'use client';

import { useActionState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';
import { createDeal, type DealActionState } from '@/app/(dashboard)/deals/actions';

const initialState: DealActionState = { success: false };

// Stesso pattern di ContactForm: nessun componente Select in components/ui/,
// select nativo con le classi della variante default di Input (caso d'uso
// singolo, non promosso a componente base — vedi AGENTS.md).
const SELECT_CLASSES =
  'w-full rounded-control border border-border bg-surface-2 py-nl-control-y pl-nl-sm pr-nl-sm text-ui text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed';

export interface DealFormContactOption {
  contactId: number;
  name: string;
  surname: string;
}

export interface DealFormStateOption {
  dealStateId: number;
  label: string;
}

export function DealForm({
  contacts,
  dealStates,
  defaultDealStateId,
  onSuccess,
}: {
  contacts: DealFormContactOption[];
  dealStates: DealFormStateOption[];
  /** Stato preselezionato nel select (es. "nuovo" dal bottone principale, o
   * lo stato della colonna Kanban da cui è stato aperto il modale). Il
   * select resta comunque editabile: l'utente può sempre cambiarlo. */
  defaultDealStateId: number;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState(createDeal, initialState);

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-nl-md">
      <div className="flex flex-col gap-nl-3xs">
        <Input label="Titolo" id="title" name="title" required />
        {state.error?.fieldErrors?.title?.map((message) => (
          <p key={message} role="alert" className="text-sm text-danger">
            {message}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-nl-3xs">
        <Input
          label="Valore (€)"
          id="value"
          name="value"
          type="number"
          step="0.01"
          min="0"
          mono
          required
        />
        {state.error?.fieldErrors?.value?.map((message) => (
          <p key={message} role="alert" className="text-sm text-danger">
            {message}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-nl-3xs">
        <label className="flex flex-col">
          <span className="mb-nl-3xs text-label uppercase tracking-label text-text-muted">
            Contatto
          </span>
          <select
            id="contactId"
            name="contactId"
            defaultValue=""
            className={SELECT_CLASSES}
            required
          >
            <option value="" disabled>
              Seleziona un contatto
            </option>
            {contacts.map((contact) => (
              <option key={contact.contactId} value={contact.contactId}>
                {contact.surname} {contact.name}
              </option>
            ))}
          </select>
        </label>
        {state.error?.fieldErrors?.contactId?.map((message) => (
          <p key={message} role="alert" className="text-sm text-danger">
            {message}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-nl-3xs">
        <label className="flex flex-col">
          <span className="mb-nl-3xs text-label uppercase tracking-label text-text-muted">
            Stato
          </span>
          <select
            id="dealStateId"
            name="dealStateId"
            defaultValue={String(defaultDealStateId)}
            className={SELECT_CLASSES}
          >
            {dealStates.map((dealState) => (
              <option key={dealState.dealStateId} value={dealState.dealStateId}>
                {dealState.label}
              </option>
            ))}
          </select>
        </label>
        {state.error?.fieldErrors?.dealStateId?.map((message) => (
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
        {pending ? 'Salvataggio...' : 'Crea trattativa'}
      </Button>
    </form>
  );
}
