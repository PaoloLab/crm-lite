'use server';

import { Prisma, type Attachment } from '@prisma/client';
import { HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth, ownRowsWhere } from '@/lib/authorization';
import type { SafeUser } from '@/lib/session';
import { createPresignedDownloadUrl, createPresignedUploadUrl, s3Client } from '@/lib/storage';

const UNIQUE_CONSTRAINT_ERROR_CODE = 'P2002';
const FOREIGN_KEY_CONSTRAINT_ERROR_CODE = 'P2003';
const RECORD_NOT_FOUND_ERROR_CODE = 'P2025';

const requestUploadUrlSchema = z.object({
  fileName: z.string().trim().min(1, 'Il nome del file è obbligatorio.'),
  mimeType: z.string().trim().min(1, 'Il tipo di file è obbligatorio.'),
  fileSize: z.number().int().positive('La dimensione del file non è valida.'),
  dealId: z.number().int().positive('Trattativa non valida.'),
});

const confirmUploadSchema = z.object({
  storageKey: z.string().trim().min(1, 'storageKey mancante.'),
  fileName: z.string().trim().min(1, 'Il nome del file è obbligatorio.'),
  mimeType: z.string().trim().min(1, 'Il tipo di file è obbligatorio.'),
  fileSize: z.number().int().positive('La dimensione del file non è valida.'),
  dealId: z.number().int().positive('Trattativa non valida.'),
});

/**
 * Verifica che la Deal esista e sia visibile all'utente corrente, non solo
 * che l'id sia sintatticamente valido. Stesso filtro per ruolo già usato
 * dalle altre Server Action su Deal (ownRowsWhere: un non-admin vede/tocca
 * solo le proprie, vedi updateDealState in deals/actions.ts) — un allegato
 * non deve poter essere agganciato a una trattativa altrui.
 * Ritorna un messaggio di errore utente se il controllo fallisce, altrimenti
 * null.
 */
async function verifyDealAccessible(
  user: SafeUser,
  dealId: number
): Promise<string | null> {
  const deal = await prisma.deal.findFirst({
    where: { dealId, ...ownRowsWhere(user) },
    select: { dealId: true },
  });
  return deal ? null : 'Trattativa non trovata.';
}

export type RequestUploadUrlResult =
  | { success: true; uploadUrl: string; storageKey: string }
  | { success: false; error: string };

/**
 * Primo passo del pattern presigned URL: verifica che l'utente sia loggato e
 * che la Deal indicata esista e gli sia visibile, poi genera un URL firmato
 * per l'upload diretto browser -> bucket R2 (il file non transita mai da
 * questo server). Non scrive nulla in Attachment: il record viene creato
 * solo da confirmUpload, dopo che il file è realmente su R2.
 *
 * Attachment si collega solo a Deal (contactId in schema.prisma resta
 * nullable ma non è usato da nessuna Server Action, vedi nota in AGENTS.md).
 */
export async function requestUploadUrl(
  fileName: string,
  mimeType: string,
  fileSize: number,
  dealId: number
): Promise<RequestUploadUrlResult> {
  const user = await requireAuth();

  const parsed = requestUploadUrlSchema.safeParse({
    fileName,
    mimeType,
    fileSize,
    dealId,
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Dati non validi.',
    };
  }

  const targetError = await verifyDealAccessible(user, parsed.data.dealId);
  if (targetError) {
    return { success: false, error: targetError };
  }

  try {
    const { uploadUrl, storageKey } = await createPresignedUploadUrl(
      parsed.data.fileName,
      parsed.data.mimeType,
      parsed.data.fileSize
    );
    return { success: true, uploadUrl, storageKey };
  } catch (error) {
    // createPresignedUploadUrl lancia Error già descrittivi per l'utente
    // (whitelist mime/dimensione massima, vedi src/lib/storage.ts): vanno
    // solo propagati come { success, error }, non lasciati come eccezione
    // non gestita, coerente con lo stile del resto del progetto.
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Errore durante la generazione dell'URL di upload.",
    };
  }
}

export type ConfirmUploadResult =
  | { success: true; attachment: Attachment }
  | { success: false; error: string };

/**
 * Secondo passo del pattern presigned URL: il client chiama questa azione
 * dopo aver caricato il file su R2 con l'URL ottenuto da requestUploadUrl.
 * Non ci si fida della sola parola del client che l'upload sia andato a buon
 * fine: si verifica con HeadObjectCommand che l'oggetto esista davvero nel
 * bucket e che ContentLength/ContentType riportati da R2 corrispondano
 * esattamente (nessuna tolleranza su piccole discrepanze) a quanto
 * dichiarato. Solo se la verifica passa viene creato il record Attachment,
 * con contactId sempre null (Attachment si collega solo a Deal).
 */
export async function confirmUpload(
  storageKey: string,
  fileName: string,
  mimeType: string,
  fileSize: number,
  dealId: number
): Promise<ConfirmUploadResult> {
  const user = await requireAuth();

  const parsed = confirmUploadSchema.safeParse({
    storageKey,
    fileName,
    mimeType,
    fileSize,
    dealId,
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Dati non validi.',
    };
  }

  // Ripetuta anche qui, non solo in requestUploadUrl: sono due Server Action
  // indipendenti e un client potrebbe chiamare confirmUpload direttamente
  // (con qualunque dealId) senza mai passare da requestUploadUrl.
  const targetError = await verifyDealAccessible(user, parsed.data.dealId);
  if (targetError) {
    return { success: false, error: targetError };
  }

  let head;
  try {
    head = await s3Client.send(
      new HeadObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME as string,
        Key: parsed.data.storageKey,
      })
    );
  } catch {
    return {
      success: false,
      error: 'Il file non risulta caricato sullo storage.',
    };
  }

  if (
    head.ContentLength !== parsed.data.fileSize ||
    head.ContentType !== parsed.data.mimeType
  ) {
    return {
      success: false,
      error: 'Il file caricato non corrisponde ai dati dichiarati.',
    };
  }

  try {
    const attachment = await prisma.attachment.create({
      data: {
        storageKey: parsed.data.storageKey,
        fileName: parsed.data.fileName,
        mimeType: parsed.data.mimeType,
        fileSize: parsed.data.fileSize,
        dealId: parsed.data.dealId,
        contactId: null,
        uploadedByUserId: user.userId,
      },
    });
    return { success: true, attachment };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Non dovrebbe succedere essendo storageKey un UUID generato
      // server-side (collisione praticamente impossibile), ma tradotto
      // comunque per coerenza con lo stile del resto del progetto (mai un
      // throw per un vincolo noto, anche se estremamente improbabile).
      if (error.code === UNIQUE_CONSTRAINT_ERROR_CODE) {
        return {
          success: false,
          error: 'Questo file risulta già registrato.',
        };
      }
      // Race condition attesa: la Deal potrebbe essere stata eliminata tra
      // la verifica sopra e questa create (stesso principio già visto in
      // createActivity/createDeal).
      if (error.code === FOREIGN_KEY_CONSTRAINT_ERROR_CODE) {
        return {
          success: false,
          error: 'La trattativa selezionata non è più valida.',
        };
      }
    }
    throw error;
  }
}

/**
 * Recupera un Attachment per id e verifica che sia utilizzabile dall'utente
 * corrente: deve esistere, avere un dealId valorizzato (vedi nota sotto) ed
 * essere agganciato a una Deal visibile all'utente (stessa ownership di
 * requestUploadUrl/confirmUpload). Fattorizzato qui perché sia
 * deleteAttachment sia getDownloadUrl ripetevano esattamente questa stessa
 * sequenza di controlli prima di operare sul file.
 *
 * Attachment si collega solo a Deal (contactId è sempre null, dealId è
 * sempre valorizzato — vedi confirmUpload); dealId resta comunque Int? a
 * schema. Se per qualunque motivo si trovasse un Attachment senza dealId
 * (stato che le Server Action esistenti non possono produrre), si nega per
 * sicurezza invece di assumere una visibilità che non si può verificare —
 * nessun ownRowsWhere possibile senza una Deal a cui ancorarlo.
 */
async function loadAccessibleAttachment(
  user: SafeUser,
  attachmentId: number
): Promise<{ ok: true; storageKey: string } | { ok: false; error: string }> {
  const attachment = await prisma.attachment.findUnique({
    where: { attachmentId },
    select: { dealId: true, storageKey: true },
  });
  if (!attachment || attachment.dealId === null) {
    return { ok: false, error: 'Allegato non trovato.' };
  }

  const targetError = await verifyDealAccessible(user, attachment.dealId);
  if (targetError) {
    return { ok: false, error: targetError };
  }

  return { ok: true, storageKey: attachment.storageKey };
}

const attachmentIdSchema = z.object({
  attachmentId: z.number().int().positive('Allegato non valido.'),
});

export type DeleteAttachmentResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Cancella un Attachment sia da R2 sia dal DB. Ordine intenzionale: prima R2
 * (DeleteObjectCommand), poi la riga in Attachment — mai il contrario. Se la
 * cancellazione da R2 fallisce si ritorna un errore senza toccare il DB, così
 * la riga resta come "fonte di verità" di un file che esiste ancora ed è
 * possibile ritentare; l'ordine opposto rischierebbe di lasciare un file
 * orfano su R2 senza più alcun riferimento in Attachment da cui ripulirlo.
 */
export async function deleteAttachment(
  attachmentId: number
): Promise<DeleteAttachmentResult> {
  const user = await requireAuth();

  const parsed = attachmentIdSchema.safeParse({ attachmentId });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Dati non validi.',
    };
  }

  const loaded = await loadAccessibleAttachment(user, parsed.data.attachmentId);
  if (!loaded.ok) {
    return { success: false, error: loaded.error };
  }

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME as string,
        Key: loaded.storageKey,
      })
    );
  } catch {
    return {
      success: false,
      error: 'Impossibile eliminare il file dallo storage. Riprova.',
    };
  }

  try {
    await prisma.attachment.delete({
      where: { attachmentId: parsed.data.attachmentId },
    });
  } catch (error) {
    // Race condition attesa (es. doppio click, due tab): un'altra richiesta
    // potrebbe aver già cancellato questa riga tra la findUnique sopra e
    // questa delete. Il file su R2 è comunque già stato rimosso: l'obiettivo
    // finale (nessun file, nessuna riga) è raggiunto, non è un errore da
    // segnalare all'utente — stesso principio già usato in logout()
    // (src/lib/session.ts) per un P2025 su Session.
    const alreadyDeleted =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === RECORD_NOT_FOUND_ERROR_CODE;
    if (!alreadyDeleted) {
      throw error;
    }
  }

  return { success: true };
}

export type GetDownloadUrlResult =
  | { success: true; downloadUrl: string }
  | { success: false; error: string };

/**
 * Genera un URL firmato di sola lettura per un Attachment esistente. Stessa
 * verifica di ownership di deleteAttachment/requestUploadUrl/confirmUpload
 * (loadAccessibleAttachment): un non-admin può scaricare solo un allegato
 * agganciato a una propria Deal.
 */
export async function getDownloadUrl(
  attachmentId: number
): Promise<GetDownloadUrlResult> {
  const user = await requireAuth();

  const parsed = attachmentIdSchema.safeParse({ attachmentId });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Dati non validi.',
    };
  }

  const loaded = await loadAccessibleAttachment(user, parsed.data.attachmentId);
  if (!loaded.ok) {
    return { success: false, error: loaded.error };
  }

  const downloadUrl = await createPresignedDownloadUrl(loaded.storageKey);
  return { success: true, downloadUrl };
}
