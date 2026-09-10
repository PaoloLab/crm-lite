'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/authorization';

// name/surname obbligatori come da schema.prisma. companyId è nullable (non
// solo optional): il form deve poter mandare esplicitamente "nessuna
// azienda" (select con opzione vuota) e non solo omettere il campo.
const contactSchema = z.object({
  name: z.string().trim().min(1, 'Il nome è obbligatorio.'),
  surname: z.string().trim().min(1, 'Il cognome è obbligatorio.'),
  companyId: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() !== '' ? Number(value) : null),
    z.number().int().positive().nullable()
  ),
});

export type ContactFormFields = 'name' | 'surname' | 'companyId';

export type ContactActionState = {
  success: boolean;
  error?: {
    fieldErrors?: Partial<Record<ContactFormFields, string[]>>;
    formError?: string;
  };
};

const FOREIGN_KEY_CONSTRAINT_ERROR_CODE = 'P2003';

function parseContactForm(formData: FormData) {
  return contactSchema.safeParse({
    name: formData.get('name'),
    surname: formData.get('surname'),
    companyId: formData.get('companyId'),
  });
}

export async function createContact(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  await requireAuth();

  const parsed = parseContactForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: { fieldErrors: parsed.error.flatten().fieldErrors },
    };
  }

  await prisma.contact.create({ data: parsed.data });

  revalidatePath('/contacts');
  return { success: true };
}

export async function updateContact(
  contactId: number,
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  await requireAuth();

  const parsed = parseContactForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: { fieldErrors: parsed.error.flatten().fieldErrors },
    };
  }

  await prisma.contact.update({ where: { contactId }, data: parsed.data });

  revalidatePath('/contacts');
  return { success: true };
}

export type DeleteContactResult = { success: boolean; error?: string };

export async function deleteContact(contactId: number): Promise<DeleteContactResult> {
  await requireAuth();

  try {
    await prisma.contact.delete({ where: { contactId } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === FOREIGN_KEY_CONSTRAINT_ERROR_CODE
    ) {
      return {
        success: false,
        error: 'Impossibile eliminare: il contatto ha ancora trattative collegate.',
      };
    }
    throw error;
  }

  revalidatePath('/contacts');
  return { success: true };
}
