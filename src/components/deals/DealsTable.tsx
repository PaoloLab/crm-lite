'use client';

import { useState } from 'react';
import { Paperclip } from 'lucide-react';
import { Dot, Table, type TableColumn } from '@/components/ui';
import { DEAL_STATE_COLOR, DEFAULT_DEAL_STATE_COLOR } from './dealStateColors';
import { AttachmentsModal } from './AttachmentsModal';
// Nota discrepanza richiesta: i 3 ActivityType.code seedati sono
// "CALL"/"EMAIL"/"MEETING" (prisma/seed.ts), non "chiamata"/"email"/"meeting"
// (le label italiane sono invece "Chiamata"/"Email"/"Meeting"). Riuso la
// mappatura icona+colore già esistente in ActivitiesTable — stesso criterio
// chiamata→primary+Phone / email→warning+Mail / meeting→success+Users
// richiesto, solo con le chiavi reali — invece di duplicarla qui.
import {
  ACTIVITY_TYPE_STYLE,
  DEFAULT_ACTIVITY_TYPE_STYLE,
} from '@/components/activities/activityTypeStyle';

export interface DealActivityRowData {
  activityId: number;
  description: string;
  date: Date;
  activityTypeCode: string;
  activityTypeLabel: string;
  userName: string;
  userInitials: string;
}

export interface AttachmentRowData {
  attachmentId: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  dateCreated: Date;
  uploadedByName: string;
}

export interface DealRowData {
  dealId: number;
  title: string;
  value: number;
  dealStateId: number;
  dealStateCode: string;
  dealStateLabel: string;
  contactName: string;
  companyName: string | null;
  dateLastModified: Date;
  /** Ordinate per data DESC dal chiamante (page.tsx), la più recente in cima. */
  activities: DealActivityRowData[];
  /** Ordinati per data DESC dal chiamante (page.tsx), il più recente in cima. */
  attachments: AttachmentRowData[];
}

// Stessa forma di DealsKanbanState (DealsKanban.tsx): duplicata qui invece di
// importata per evitare un import circolare (DealsKanban importa già
// DealRowData da questo file) — caso d'uso singolo, stesso criterio già usato
// altrove nel progetto per piccole forme di prop one-off (vedi AGENTS.md).
export interface DealStageOption {
  dealStateId: number;
  code: string;
  label: string;
}

const currencyFormatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

// Formato "08 set 2026 · ore 10:30" per le attività della riga espansa: stessi
// due Intl.DateTimeFormat già usati in ActivitiesTable (day/month short/year +
// ore:minuti), ma uniti in un'unica stringa con " · ore " invece che su due
// righe separate — qui lo spazio orizzontale nella riga attività lo consente.
const activityDateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const activityTimeFormatter = new Intl.DateTimeFormat('it-IT', {
  hour: '2-digit',
  minute: '2-digit',
});

function formatActivityDateTime(date: Date): string {
  return `${activityDateFormatter.format(date)} · ore ${activityTimeFormatter.format(date)}`;
}

function renderExpandedDeal(row: DealRowData) {
  return (
    <div className="col-span-4 flex flex-col gap-nl-lg">
      <span className="text-label uppercase tracking-label text-text-muted">
        Attività collegate · ordine cronologico
      </span>

      {row.activities.length === 0 ? (
        <span className="text-body text-text-muted">
          Nessuna attività registrata su questa trattativa.
        </span>
      ) : (
        <div className="flex flex-col gap-nl-lg">
          {row.activities.map((activity) => {
            const style = ACTIVITY_TYPE_STYLE[activity.activityTypeCode] ?? DEFAULT_ACTIVITY_TYPE_STYLE;
            const Icon = style.icon;
            return (
              <div key={activity.activityId} className="flex flex-col gap-nl-2xs">
                <span className="flex items-center gap-nl-2xs text-body">
                  <Icon size={15} strokeWidth={1.8} className={style.textClass} />
                  <span className={['font-medium', style.textClass].join(' ')}>
                    {activity.activityTypeLabel}
                  </span>
                  <span className="text-tag text-text-muted">
                    {formatActivityDateTime(activity.date)}
                  </span>
                </span>

                <span className="text-body text-text-secondary">{activity.description}</span>

                <span className="flex items-center gap-nl-2xs">
                  <span className="flex size-[24px] shrink-0 items-center justify-center rounded-full border border-border bg-surface-3 text-tag font-semibold text-text-primary">
                    {activity.userInitials}
                  </span>
                  <span className="text-tag text-text-muted">{activity.userName}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Stesso stile del select nativo di DealForm (nessun componente Select in
// components/ui/), ma più compatto (padding ridotto) per stare dentro una
// cella di tabella.
const STAGE_SELECT_CLASSES =
  'rounded-control border border-border bg-surface-2 py-nl-4xs pl-nl-2xs pr-nl-2xs text-body text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export function DealsTable({
  deals,
  dealStates,
  onDealStateChange,
  currentUserName,
}: {
  deals: DealRowData[];
  /** Tutti i DealState disponibili, ordinate per sequence dal chiamante (page.tsx). */
  dealStates: DealStageOption[];
  onDealStateChange: (dealId: number, dealStateId: number) => void;
  /** Nome+cognome dell'utente corrente: usato da AttachmentsModal per attribuire subito in UI un allegato appena caricato, senza attendere router.refresh(). */
  currentUserName: string;
}) {
  // Un solo modale condiviso da tutte le righe (non uno per riga): la Deal
  // "attiva" si cerca in deals per id ad ogni render, così se router.refresh()
  // porta dati aggiornati mentre il modale è aperto (vedi AttachmentsModal)
  // anche dealTitle/dealSubtitle restano coerenti con la riga vera.
  const [attachmentsDealId, setAttachmentsDealId] = useState<number | null>(null);
  const attachmentsDeal = deals.find((deal) => deal.dealId === attachmentsDealId) ?? null;

  const columns: TableColumn<DealRowData>[] = [
    {
      // Non elencata esplicitamente tra le colonne richieste, ma senza titolo
      // le righe di uno stesso contatto/azienda sarebbero indistinguibili
      // (unica altra colonna univoca sarebbe "Azioni", non ancora
      // implementata in questo step — vedi sotto). Aggiunta segnalata.
      key: 'title',
      label: 'Trattativa',
      width: '200px',
    },
    {
      key: 'companyName',
      label: 'Azienda',
      render: (row) => (
        <span className={row.companyName ? undefined : 'text-text-muted'}>
          {row.companyName ?? row.contactName}
        </span>
      ),
    },
    {
      key: 'dealStateLabel',
      label: 'Stage',
      width: '160px',
      render: (row) => {
        // Colore derivato da dealStates (prop, sempre aggiornata) via
        // dealStateId, non da row.dealStateCode: dopo un cambio stato
        // ottimistico row.dealStateCode resterebbe quello vecchio, il colore
        // no.
        const code = dealStates.find((state) => state.dealStateId === row.dealStateId)?.code;
        return (
          <span className="flex items-center gap-nl-2xs">
            <Dot color={DEAL_STATE_COLOR[code ?? ''] ?? DEFAULT_DEAL_STATE_COLOR} />
            <select
              value={row.dealStateId}
              onChange={(event) => onDealStateChange(row.dealId, Number(event.target.value))}
              className={STAGE_SELECT_CLASSES}
              aria-label={`Stato di ${row.title}`}
            >
              {dealStates.map((state) => (
                <option key={state.dealStateId} value={state.dealStateId}>
                  {state.label}
                </option>
              ))}
            </select>
          </span>
        );
      },
    },
    {
      key: 'value',
      label: 'Valore',
      width: '120px',
      render: (row) => <span className="font-mono">{currencyFormatter.format(row.value)}</span>,
    },
    { key: 'contactName', label: 'Contatto', width: '160px' },
    {
      key: 'dateLastModified',
      label: 'Aggiornato',
      width: '110px',
      render: (row) => dateFormatter.format(row.dateLastModified),
    },
    {
      // Nessuna modifica/eliminazione trattativa richiesta in questo step
      // (solo creazione): stesso pattern "non wired in questo step" già usato
      // altrove nel progetto (vedi AGENTS.md, sezione AppShell) per il resto
      // della colonna. L'unica azione cablata è la graffetta Allegati.
      key: 'dealId',
      label: 'Azioni',
      width: '90px',
      render: (row) => {
        const count = row.attachments.length;
        return (
          <button
            type="button"
            onClick={() => setAttachmentsDealId(row.dealId)}
            aria-label={count > 0 ? `Allegati di ${row.title} (${count})` : `Allegati di ${row.title}`}
            title="Allegati"
            // Badge numerico reso in linea accanto all'icona, non sovrapposto
            // al suo angolo come nel mockup: le celle di Table sono avvolte
            // in uno <span className="truncate"> (overflow-hidden), che
            // taglierebbe un badge posizionato con offset negativi fuori dal
            // riquadro dell'icona. Vedi riepilogo.
            className="flex items-center gap-nl-4xs rounded-icon px-nl-4xs py-nl-4xs text-text-secondary hover:bg-surface-3 hover:text-text-primary"
          >
            <Paperclip size={15} strokeWidth={1.8} />
            {count > 0 && (
              <span className="flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-primary px-[3px] font-mono text-[10px] leading-none text-white">
                {count}
              </span>
            )}
          </button>
        );
      },
    },
  ];

  if (deals.length === 0) {
    return <p className="text-body text-text-secondary">Nessuna trattativa registrata.</p>;
  }

  return (
    <>
      <Table
        columns={columns}
        rows={deals}
        rowKey={(row) => row.dealId}
        renderExpanded={renderExpandedDeal}
      />

      {attachmentsDeal && (
        <AttachmentsModal
          dealId={attachmentsDeal.dealId}
          dealTitle={attachmentsDeal.title}
          dealSubtitle={attachmentsDeal.companyName ?? attachmentsDeal.contactName}
          attachments={attachmentsDeal.attachments}
          currentUserName={currentUserName}
          onClose={() => setAttachmentsDealId(null)}
        />
      )}
    </>
  );
}
