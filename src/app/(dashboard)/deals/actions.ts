'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/authorization';

// contactId e dealStateId sono entrambi obbligatori come da schema.prisma
// (Deal.contactId/dealStateId non sono nullable, a differenza di
// Contact.companyId). userId NON fa parte dello schema di validazione: non è
// un campo del form, va preso da requireAuth() dentro la Server Action (vedi
// sotto), mai dal client.
const dealSchema = z.object({
  title: z.string().trim().min(1, 'Il titolo è obbligatorio.'),
  value: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() !== '' ? Number(value) : value),
    z.number('Il valore deve essere un numero.').positive('Il valore deve essere maggiore di zero.')
  ),
  contactId: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() !== '' ? Number(value) : value),
    z.number('Seleziona un contatto.').int().positive('Seleziona un contatto.')
  ),
  dealStateId: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() !== '' ? Number(value) : value),
    z.number('Seleziona uno stato.').int().positive('Seleziona uno stato.')
  ),
});

export type DealFormFields = 'title' | 'value' | 'contactId' | 'dealStateId';

export type DealActionState = {
  success: boolean;
  error?: {
    fieldErrors?: Partial<Record<DealFormFields, string[]>>;
    formError?: string;
  };
};

const FOREIGN_KEY_CONSTRAINT_ERROR_CODE = 'P2003';

export async function createDeal(
  _prevState: DealActionState,
  formData: FormData
): Promise<DealActionState> {
  const user = await requireAuth();

  const parsed = dealSchema.safeParse({
    title: formData.get('title'),
    value: formData.get('value'),
    contactId: formData.get('contactId'),
    dealStateId: formData.get('dealStateId'),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: { fieldErrors: parsed.error.flatten().fieldErrors },
    };
  }

  try {
    await prisma.deal.create({
      data: {
        title: parsed.data.title,
        value: parsed.data.value,
        contactId: parsed.data.contactId,
        dealStateId: parsed.data.dealStateId,
        userId: user.userId,
      },
    });
  } catch (error) {
    // Il contatto/stato selezionato nel form potrebbe non essere più valido
    // (es. cancellato tra il caricamento della pagina e il submit): stesso
    // pattern di traduzione errori Prisma noti già usato in company/contact
    // actions.ts, nessun throw per un vincolo atteso.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === FOREIGN_KEY_CONSTRAINT_ERROR_CODE
    ) {
      return {
        success: false,
        error: { formError: 'Il contatto o lo stato selezionato non è più valido.' },
      };
    }
    throw error;
  }

  revalidatePath('/deals');
  return { success: true };
}
