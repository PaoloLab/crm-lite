'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal } from '@/components/ui';
import { ContactForm } from './ContactForm';

// Stesso pattern di NewCompanyButton: stato del modale locale al bottone,
// router.refresh() (non push) al successo perché siamo già su /contacts.
export function NewContactButton({
  companies,
}: {
  companies: { companyId: number; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Nuovo contatto</Button>

      <Modal
        open={open}
        onClose={handleClose}
        title="Nuovo contatto"
        footer={
          <Button variant="secondary" type="button" onClick={handleClose}>
            Annulla
          </Button>
        }
      >
        <ContactForm
          companies={companies}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </>
  );
}
