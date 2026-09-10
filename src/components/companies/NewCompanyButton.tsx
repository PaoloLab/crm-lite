'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal } from '@/components/ui';
import { CompanyForm } from './CompanyForm';

// Possiede lo stato di apertura del modale (vedi requisiti: nessun context
// globale, ogni pagina/bottone gestisce il proprio). Al successo chiude il
// modale e fa router.refresh() invece di router.push('/companies') (già
// siamo su quella pagina, quindi la navigazione di CompanyForm sarebbe un
// no-op e non riprenderebbe i dati aggiornati dal Server Component).
export function NewCompanyButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Nuova azienda</Button>

      <Modal
        open={open}
        onClose={handleClose}
        title="Nuova azienda"
        footer={
          <Button variant="secondary" type="button" onClick={handleClose}>
            Annulla
          </Button>
        }
      >
        <CompanyForm
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </>
  );
}
