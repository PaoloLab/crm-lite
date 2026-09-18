import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
] as const;

const PRESIGNED_URL_EXPIRES_SECONDS = 300;

// Nota: in questo progetto R2_ACCOUNT_ID contiene già l'endpoint R2 completo
// (es. "https://<account-id>.r2.cloudflarestorage.com"), non il solo account
// id come il nome della variabile suggerirebbe — verificato in .env. Va quindi
// usato direttamente come endpoint, senza ricostruirlo concatenando l'URL.
//
// Esportato (non solo uso interno) perché anche attachments/actions.ts deve
// parlare con R2 (HeadObjectCommand per verificare l'upload): meglio riusare
// questa configurazione già corretta che duplicarla in un secondo client.
export const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ACCOUNT_ID as string,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});

interface PresignedUpload {
  uploadUrl: string;
  storageKey: string;
}

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot === -1 ? "" : fileName.slice(lastDot);
}

/**
 * Genera un URL firmato per l'upload diretto browser -> bucket R2 (pattern
 * presigned URL: il server Next.js non fa mai da tramite per il trasferimento
 * del file, evita i limiti di payload/timeout delle funzioni serverless).
 *
 * Valida mimeType/fileSize PRIMA di generare l'URL (lanciando un errore
 * descrittivo se non passano), ma la validazione reale e vincolante è quella
 * firmata dentro l'URL stesso: ContentType e ContentLength fanno parte del
 * PutObjectCommand firmato, quindi R2 rifiuta un upload con tipo o dimensione
 * diversi da quelli dichiarati qui, anche se il client aggirasse il controllo
 * lato browser.
 *
 * Lo storageKey è un UUID (mai il nome file originale, che va salvato a parte
 * solo per visualizzazione/download) con l'estensione originale preservata.
 */
export async function createPresignedUploadUrl(
  fileName: string,
  mimeType: string,
  fileSize: number
): Promise<PresignedUpload> {
  if (
    !(ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType)
  ) {
    throw new Error(`Tipo di file non consentito: ${mimeType}.`);
  }

  if (fileSize > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `Il file supera la dimensione massima consentita di ${
        MAX_FILE_SIZE_BYTES / (1024 * 1024)
      }MB.`
    );
  }

  const storageKey = `${randomUUID()}${getFileExtension(fileName)}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME as string,
    Key: storageKey,
    ContentType: mimeType,
    ContentLength: fileSize,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: PRESIGNED_URL_EXPIRES_SECONDS,
  });

  return { uploadUrl, storageKey };
}

/**
 * Genera un URL firmato per il download diretto browser <- bucket R2 (stesso
 * pattern presigned URL dell'upload, stessa scadenza di 300 secondi: nessun
 * motivo per differenziarla, un link di download non ha bisogno di vivere più
 * a lungo di uno di upload). A differenza di createPresignedUploadUrl non c'è
 * nulla da validare qui: lo storageKey arriva da una Server Action che ha già
 * verificato che l'Attachment esista e sia visibile all'utente corrente.
 */
export async function createPresignedDownloadUrl(storageKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME as string,
    Key: storageKey,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: PRESIGNED_URL_EXPIRES_SECONDS,
  });
}
