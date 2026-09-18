import { FileText, Image as ImageIcon, type LucideIcon } from 'lucide-react';

// Whitelist reale (vedi src/lib/storage.ts): solo PDF/PNG/JPEG, nessun altro
// tipo. Chiave: Attachment.mimeType (lo stesso valore usato per la
// validazione lato server, stabile). Stesso criterio icona+colore semantico
// già usato in activityTypeStyle.ts/dealStateColors.ts.
export interface AttachmentTypeStyle {
  icon: LucideIcon;
  bgClass: string;
  textClass: string;
}

export const ATTACHMENT_TYPE_STYLE: Record<string, AttachmentTypeStyle> = {
  'application/pdf': { icon: FileText, bgClass: 'bg-danger-bg', textClass: 'text-danger' },
  'image/png': { icon: ImageIcon, bgClass: 'bg-primary-subtle', textClass: 'text-primary-soft' },
  'image/jpeg': { icon: ImageIcon, bgClass: 'bg-primary-subtle', textClass: 'text-primary-soft' },
};

export const DEFAULT_ATTACHMENT_TYPE_STYLE: AttachmentTypeStyle = {
  icon: FileText,
  bgClass: 'bg-surface-3',
  textClass: 'text-text-muted',
};
