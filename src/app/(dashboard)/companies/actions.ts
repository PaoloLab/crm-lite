'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/authorization';

// Vincoli allineati a prisma/schema.prisma: name, address e piva sono tutti
// obbligatori lì (piva è anche @unique), a differenza di quanto ipotizzato
// nella richiesta originale (address/piva opzionali). Vedi AGENTS.md.
const companySchema = z.object({
  name: z.string().trim().min(1, 'Il nome è obbligatorio.'),
  address: z.string().trim().min(1, "L'indirizzo è obbligatorio."),
  piva: z.string().trim().min(1, 'La partita IVA è obbligatoria.'),
});

export type CompanyFormFields = 'name' | 'address' | 'piva';

export type CompanyActionState = {
  success: boolean;
  error?: {
    fieldErrors?: Partial<Record<CompanyFormFields, string[]>>;
    formError?: string;
  };
};

const UNIQUE_CONSTRAINT_ERROR_CODE = 'P2002';
const FOREIGN_KEY_CONSTRAINT_ERROR_CODE = 'P2003';

function parseCompanyForm(formData: FormData) {
  return companySchema.safeParse({
    name: formData.get('name'),
    address: formData.get('address'),
    piva: formData.get('piva'),
  });
}

export async function createCompany(
  _prevState: CompanyActionState,
  formData: FormData
): Promise<CompanyActionState> {
  await requireAuth();

  const parsed = parseCompanyForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: { fieldErrors: parsed.error.flatten().fieldErrors },
    };
  }

  try {
    await prisma.company.create({ data: parsed.data });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_ERROR_CODE
    ) {
      return {
        success: false,
        error: { formError: "Esiste già un'azienda con questa partita IVA." },
      };
    }
    throw error;
  }

  revalidatePath('/companies');
  return { success: true };
}

export async function updateCompany(
  companyId: number,
  _prevState: CompanyActionState,
  formData: FormData
): Promise<CompanyActionState> {
  await requireAuth();

  const parsed = parseCompanyForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: { fieldErrors: parsed.error.flatten().fieldErrors },
    };
  }

  try {
    await prisma.company.update({ where: { companyId }, data: parsed.data });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_ERROR_CODE
    ) {
      return {
        success: false,
        error: { formError: "Esiste già un'azienda con questa partita IVA." },
      };
    }
    throw error;
  }

  revalidatePath('/companies');
  return { success: true };
}

export type DeleteCompanyResult = { success: boolean; error?: string };

export async function deleteCompany(companyId: number): Promise<DeleteCompanyResult> {
  await requireAuth();

  try {
    await prisma.company.delete({ where: { companyId } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === FOREIGN_KEY_CONSTRAINT_ERROR_CODE
    ) {
      return {
        success: false,
        error: "Impossibile eliminare: l'azienda ha ancora contatti collegati.",
      };
    }
    throw error;
  }

  revalidatePath('/companies');
  return { success: true };
}
