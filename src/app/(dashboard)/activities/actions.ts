'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAdmin } from '@/lib/authorization';

// userId NON fa parte dello schema di validazione: non è un campo del form,
// va preso da requireAuth() dentro la Server Action (stesso principio già
// usato in deals/actions.ts per createDeal). date/time sono due campi separati
// nel form (come da mockup) e vengono combinati in un unico Date qui.
const activitySchema = z.object({
  dealId: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() !== '' ? Number(value) : value),
    z.number('Seleziona una trattativa.').int().positive('Seleziona una trattativa.')
  ),
  activityTypeId: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() !== '' ? Number(value) : value),
    z.number('Seleziona un tipo.').int().positive('Seleziona un tipo.')
  ),
  description: z.string().trim().min(1, 'La descrizione è obbligatoria.'),
  date: z.string().min(1, 'La data è obbligatoria.'),
  time: z.string().min(1, "L'ora è obbligatoria."),
});

export type ActivityFormFields = 'dealId' | 'activityTypeId' | 'description' | 'date' | 'time';

export type ActivityActionState = {
  success: boolean;
  error?: {
    fieldErrors?: Partial<Record<ActivityFormFields, string[]>>;
    formError?: string;
  };
};

const FOREIGN_KEY_CONSTRAINT_ERROR_CODE = 'P2003';

export async function createActivity(
  _prevState: ActivityActionState,
  formData: FormData
): Promise<ActivityActionState> {
  const user = await requireAuth();

  const parsed = activitySchema.safeParse({
    dealId: formData.get('dealId'),
    activityTypeId: formData.get('activityTypeId'),
    description: formData.get('description'),
    date: formData.get('date'),
    time: formData.get('time'),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: { fieldErrors: parsed.error.flatten().fieldErrors },
    };
  }

  // <input type="date">/<input type="time"> mandano sempre stringhe
  // "YYYY-MM-DD"/"HH:mm": combinate qui in un unico Date locale, non c'è un
  // campo separato in schema.prisma (Activity.date è un DateTime unico).
  const combinedDate = new Date(`${parsed.data.date}T${parsed.data.time}`);
  if (Number.isNaN(combinedDate.getTime())) {
    return {
      success: false,
      error: { fieldErrors: { date: ['Data o ora non valida.'] } },
    };
  }

  // Il dropdown trattativa in ActivitiesPage mostra già solo le deal proprie
  // per un non-admin (vedi ownRowsWhere in activities/page.tsx), ma la UI da
  // sola non basta: senza questo controllo un non-admin potrebbe comunque
  // loggare un'attività su una dealId altrui chiamando l'azione direttamente
  // con un dealId non presente nella sua UI. Un solo query aggiuntivo, solo
  // per i non-admin (l'admin salta il controllo, nessun costo extra per lui).
  if (!isAdmin(user)) {
    const deal = await prisma.deal.findUnique({
      where: { dealId: parsed.data.dealId },
      select: { userId: true },
    });
    if (!deal || deal.userId !== user.userId) {
      return {
        success: false,
        error: { formError: 'La trattativa selezionata non è più valida.' },
      };
    }
  }

  try {
    await prisma.activity.create({
      data: {
        description: parsed.data.description,
        date: combinedDate,
        dealId: parsed.data.dealId,
        activityTypeId: parsed.data.activityTypeId,
        userId: user.userId,
      },
    });
  } catch (error) {
    // La trattativa/il tipo selezionato nel form potrebbe non essere più
    // valido (es. cancellato tra il caricamento della pagina e il submit):
    // stesso pattern di traduzione errori Prisma noti già usato in
    // company/contact/deal actions.ts, nessun throw per un vincolo atteso.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === FOREIGN_KEY_CONSTRAINT_ERROR_CODE
    ) {
      return {
        success: false,
        error: { formError: 'La trattativa o il tipo selezionato non è più valido.' },
      };
    }
    throw error;
  }

  revalidatePath('/activities');
  return { success: true };
}
