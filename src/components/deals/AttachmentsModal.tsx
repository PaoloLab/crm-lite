'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Loader2, Trash2 } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import {
  confirmUpload,
  deleteAttachment,
  getDownloadUrl,
  requestUploadUrl,
} from '@/app/(dashboard)/attachments/actions';
import { ATTACHMENT_TYPE_STYLE, DEFAULT_ATTACHMENT_TYPE_STYLE } from './attachmentTypeStyle';
import type { AttachmentRowData } from './DealsTable';

// Whitelist reale duplicata qui (non importata da src/lib/storage.ts, che è
// server-only — "use client" non può importare codice che tocca l'SDK
// AWS/env var): usata solo per l'attributo HTML `accept`, un filtro lato
// browser comodo per l'utente ma non un controllo di sicurezza (quello vero
// resta server-side in requestUploadUrl/createPresignedUploadUrl).
const ACCEPTED_MIME_TYPES = 'application/pdf,image/png,image/jpeg';

const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentsModal({
  dealId,
  dealTitle,
  dealSubtitle,
  attachments,
  currentUserName,
  onClose,
}: {
  dealId: number;
  dealTitle: string;
  /** Azienda collegata alla Deal, o nome del contatto se non c'è azienda — stesso fallback già usato in DealsTable per la colonna "Azienda". */
  dealSubtitle: string;
  attachments: AttachmentRowData[];
  currentUserName: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stato locale = fonte di verità mentre il modale resta aperto: upload e
  // delete aggiornano subito questa lista (nessuna attesa del round-trip di
  // router.refresh(), che qui serve solo per tenere allineato il resto della
  // pagina, in particolare il badge sulla riga Deal dietro al modale — vedi
  // riepilogo). Inizializzato una sola volta dalla prop: a differenza di
  // DealsView (che deve re-sincronizzarsi perché resta montato a lungo e
  // riceve aggiornamenti da azioni esterne alla vista), qui il modale è
  // aperto per una sessione breve e propria, nessun re-sync necessario.
  const [rows, setRows] = useState(attachments);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleAddClick() {
    setError(null);
    fileInputRef.current?.click();
  }

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Permette di riselezionare subito lo stesso file (es. dopo un errore):
    // senza reset l'evento "change" non si ripeterebbe per un file identico.
    event.target.value = '';
    if (!file) return;

    setError(null);
    setIsUploading(true);

    const requested = await requestUploadUrl(file.name, file.type, file.size, dealId);
    if (!requested.success) {
      setError(requested.error);
      setIsUploading(false);
      return;
    }

    let putResponse: Response;
    try {
      putResponse = await fetch(requested.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
    } catch {
      setError('Errore di rete durante il caricamento del file. Riprova.');
      setIsUploading(false);
      return;
    }
    if (!putResponse.ok) {
      setError('Caricamento del file fallito. Riprova.');
      setIsUploading(false);
      return;
    }

    const confirmed = await confirmUpload(
      requested.storageKey,
      file.name,
      file.type,
      file.size,
      dealId
    );
    if (!confirmed.success) {
      setError(confirmed.error);
      setIsUploading(false);
      return;
    }

    setRows((previous) => [
      {
        attachmentId: confirmed.attachment.attachmentId,
        fileName: confirmed.attachment.fileName,
        fileSize: confirmed.attachment.fileSize,
        mimeType: confirmed.attachment.mimeType,
        dateCreated: confirmed.attachment.dateCreated,
        uploadedByName: currentUserName,
      },
      ...previous,
    ]);
    setIsUploading(false);
    router.refresh();
  }

  async function handleDelete(attachmentId: number, fileName: string) {
    // Stesso pattern di conferma nativa già usato da DeleteCompanyButton/
    // DeleteContactButton, non un componente di conferma diverso.
    const confirmed = confirm(`Eliminare l'allegato "${fileName}"? L'operazione non è reversibile.`);
    if (!confirmed) return;

    setError(null);
    setPendingDeleteId(attachmentId);
    const result = await deleteAttachment(attachmentId);
    setPendingDeleteId(null);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setRows((previous) => previous.filter((row) => row.attachmentId !== attachmentId));
    router.refresh();
  }

  async function handleDownload(attachmentId: number) {
    setError(null);
    const result = await getDownloadUrl(attachmentId);
    if (!result.success) {
      setError(result.error);
      return;
    }
    window.open(result.downloadUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <Modal open onClose={onClose} title="Allegati" size="lg">
      <div className="flex flex-col gap-nl-md">
        <p className="text-body text-text-secondary">
          {dealTitle} · {dealSubtitle}
        </p>

        {error && (
          <p
            role="alert"
            className="rounded-control border border-danger-border bg-danger-bg px-nl-sm py-nl-xs text-body text-danger-text"
          >
            {error}
          </p>
        )}

        <div className="flex max-h-[360px] flex-col gap-nl-2xs overflow-y-auto">
          {rows.length === 0 ? (
            <p className="text-body text-text-muted">Nessun allegato caricato.</p>
          ) : (
            rows.map((row) => {
              const style = ATTACHMENT_TYPE_STYLE[row.mimeType] ?? DEFAULT_ATTACHMENT_TYPE_STYLE;
              const Icon = style.icon;
              const isDeletingRow = pendingDeleteId === row.attachmentId;

              return (
                <div
                  key={row.attachmentId}
                  className="flex items-center gap-nl-sm rounded-control border border-border-subtle bg-surface-2 px-nl-sm py-nl-xs"
                >
                  <span
                    className={[
                      'flex size-[32px] shrink-0 items-center justify-center rounded-control',
                      style.bgClass,
                    ].join(' ')}
                  >
                    <Icon size={16} strokeWidth={1.8} className={style.textClass} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-body text-text-primary">
                    {row.fileName}
                  </span>
                  <span className="w-[64px] shrink-0 text-right font-mono text-tag text-text-muted">
                    {formatFileSize(row.fileSize)}
                  </span>
                  <span className="w-[120px] shrink-0 truncate text-tag text-text-muted">
                    {row.uploadedByName}
                  </span>
                  <span className="w-[80px] shrink-0 text-tag text-text-muted">
                    {dateFormatter.format(row.dateCreated)}
                  </span>
                  <span className="flex shrink-0 items-center gap-nl-4xs">
                    <button
                      type="button"
                      onClick={() => handleDownload(row.attachmentId)}
                      aria-label={`Scarica ${row.fileName}`}
                      title="Scarica"
                      className="flex size-[28px] items-center justify-center rounded-icon text-text-secondary hover:bg-surface-3 hover:text-text-primary"
                    >
                      <Download size={15} strokeWidth={1.8} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(row.attachmentId, row.fileName)}
                      disabled={isDeletingRow}
                      aria-label={`Elimina ${row.fileName}`}
                      title="Elimina"
                      className="flex size-[28px] items-center justify-center rounded-icon text-text-secondary hover:bg-surface-3 hover:text-danger disabled:opacity-50"
                    >
                      {isDeletingRow ? (
                        <Loader2 size={15} strokeWidth={1.8} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} strokeWidth={1.8} />
                      )}
                    </button>
                  </span>
                </div>
              );
            })
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_MIME_TYPES}
          onChange={handleFileSelected}
          className="hidden"
        />

        {/* Footer non affidato alla prop `footer` di Modal (che allinea tutto
            a destra, pensata per "Annulla + submit" affiancati): qui il
            mockup vuole "+ Aggiungi allegato" a sinistra e "Chiudi" a destra,
            estremi opposti. Un unico div w-full con justify-between dentro
            children, invece di introdurre in Modal un secondo layout di
            footer per un solo caso d'uso. */}
        <div className="mt-nl-lg flex w-full items-center justify-between">
          <Button variant="secondary" type="button" onClick={handleAddClick} disabled={isUploading}>
            {isUploading ? (
              <span className="flex items-center gap-nl-2xs">
                <Loader2 size={15} strokeWidth={1.8} className="animate-spin" />
                Caricamento...
              </span>
            ) : (
              '+ Aggiungi allegato'
            )}
          </Button>
          <Button variant="secondary" type="button" onClick={onClose}>
            Chiudi
          </Button>
        </div>
      </div>
    </Modal>
  );
}
