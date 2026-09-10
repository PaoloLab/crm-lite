import type { DotColor } from '@/components/ui';

// I 4 DealState seedati (NEW/nuovo, PROPOSAL/proposta, WON/vinto, LOST/perso
// — vedi prisma/seed.ts) si allineano quasi 1:1 ai colori di stage già
// commentati in components/ui/Dot.tsx (muted="Nuovo lead", warning=
// "Proposta inviata", success="Vinto"). LOST non ha un colore dedicato nel
// documento design-system.md: uso danger (registro "negativo"), stesso
// criterio semantico già usato altrove nel progetto per errori/eliminazioni.
// Chiave: DealState.code (stabile, maiuscolo), stesso campo già usato in
// companies/page.tsx (dealState.code === 'WON') per distinguere gli stati.
export const DEAL_STATE_COLOR: Record<string, DotColor> = {
  NEW: 'muted',
  PROPOSAL: 'warning',
  WON: 'success',
  LOST: 'danger',
};

export const DEFAULT_DEAL_STATE_COLOR: DotColor = 'muted';
