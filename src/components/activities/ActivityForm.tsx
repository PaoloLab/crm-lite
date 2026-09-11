'use client';

import { useActionState, useEffect, useState } from 'react';
import { Phone, Mail, Users } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { createActivity, type ActivityActionState } from '@/app/(dashboard)/activities/actions';

const initialState: ActivityActionState = { success: false };

// Stesso pattern di DealForm/ContactForm: nessun componente Select in
// components/ui/, select nativo con le classi della variante default di
// Input (caso d'uso singolo, non promosso a componente base — vedi AGENTS.md).
const SELECT_CLASSES =
  'w-full rounded-control border border-border bg-surface-2 py-nl-control-y pl-nl-sm pr-nl-sm text-ui text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed';

const TEXTAREA_CLASSES =
  'w-full min-h-[88px] rounded-control border border-border bg-surface-2 px-nl-sm py-nl-control-y text-ui text-text-primary placeholder:text-text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed';

export interface ActivityFormDealOption {
  dealId: number;
  title: string;
  /** Azienda del contatto della trattativa, o il nome del contatto se senza azienda (stesso fallback di DealsTable). */
  subtitle: string;
}

export interface ActivityFormTypeOption {
  activityTypeId: number;
  code: string;
  label: string;
}

// Icone fisse per i 3 bottoni tipo (stesso set di activityTypeStyle.ts, ma
// tenute qui separate: il modale non ha bisogno del colore, solo dell'icona
// per il bottone toggle — evita un import di uno stile pensato per la tabella).
const TYPE_ICON: Record<string, typeof Phone> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
};

function todayDateValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowTimeValue(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function ActivityForm({
  deals,
  activityTypes,
  defaultDealId,
  onSuccess,
}: {
  deals: ActivityFormDealOption[];
  /** I 3 ActivityType seedati (Chiamata/Email/Meeting) — nessun tipo dinamico, vedi AGENTS.md. */
  activityTypes: ActivityFormTypeOption[];
  defaultDealId?: number;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState(createActivity, initialState);
  const [selectedTypeId, setSelectedTypeId] = useState(activityTypes[0]?.activityTypeId);

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-nl-md">
      <div className="flex flex-col gap-nl-3xs">
        <label className="flex flex-col">
          <span className="mb-nl-3xs text-label uppercase tracking-label text-text-muted">
            Trattativa
          </span>
          <select
            id="dealId"
            name="dealId"
            defaultValue={defaultDealId ? String(defaultDealId) : ''}
            className={SELECT_CLASSES}
            required
          >
            <option value="" disabled>
              Seleziona una trattativa
            </option>
            {deals.map((deal) => (
              <option key={deal.dealId} value={deal.dealId}>
                {deal.title} — {deal.subtitle}
              </option>
            ))}
          </select>
        </label>
        {state.error?.fieldErrors?.dealId?.map((message) => (
          <p key={message} role="alert" className="text-sm text-danger">
            {message}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-nl-3xs">
        <span className="text-label uppercase tracking-label text-text-muted">Tipo</span>
        <div className="flex gap-nl-2xs">
          {activityTypes.map((type) => {
            const Icon = TYPE_ICON[type.code];
            const isSelected = selectedTypeId === type.activityTypeId;
            return (
              <Button
                key={type.activityTypeId}
                type="button"
                variant={isSelected ? 'primary' : 'secondary'}
                icon={Icon ? <Icon size={15} strokeWidth={1.8} /> : undefined}
                className="flex-1"
                onClick={() => setSelectedTypeId(type.activityTypeId)}
              >
                {type.label}
              </Button>
            );
          })}
        </div>
        <input type="hidden" name="activityTypeId" value={selectedTypeId ?? ''} />
        {state.error?.fieldErrors?.activityTypeId?.map((message) => (
          <p key={message} role="alert" className="text-sm text-danger">
            {message}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-nl-3xs">
        <label className="flex flex-col">
          <span className="mb-nl-3xs text-label uppercase tracking-label text-text-muted">
            Descrizione
          </span>
          <textarea
            id="description"
            name="description"
            placeholder="Cosa è stato detto o deciso"
            className={TEXTAREA_CLASSES}
            required
          />
        </label>
        {state.error?.fieldErrors?.description?.map((message) => (
          <p key={message} role="alert" className="text-sm text-danger">
            {message}
          </p>
        ))}
      </div>

      <div className="flex gap-nl-md">
        <div className="flex flex-1 flex-col gap-nl-3xs">
          <Input
            label="Data"
            id="date"
            name="date"
            type="date"
            defaultValue={todayDateValue()}
            required
          />
          {state.error?.fieldErrors?.date?.map((message) => (
            <p key={message} role="alert" className="text-sm text-danger">
              {message}
            </p>
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-nl-3xs">
          <Input
            label="Ora"
            id="time"
            name="time"
            type="time"
            defaultValue={nowTimeValue()}
            required
          />
          {state.error?.fieldErrors?.time?.map((message) => (
            <p key={message} role="alert" className="text-sm text-danger">
              {message}
            </p>
          ))}
        </div>
      </div>

      {state.error?.formError && (
        <p role="alert" className="text-sm text-danger">
          {state.error.formError}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? 'Salvataggio...' : 'Registra attività'}
      </Button>
    </form>
  );
}
