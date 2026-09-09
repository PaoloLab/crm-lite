'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

// Piccolo wrapper client: <Button> è un <button>, quindi non può stare
// annidato dentro un <Link> (<a><button>...</button></a> non è HTML valido).
// La navigazione avviene quindi via useRouter().push, non un href diretto.
export function NewCompanyButton() {
  const router = useRouter();
  return <Button onClick={() => router.push('/companies/new')}>+ Nuova azienda</Button>;
}
