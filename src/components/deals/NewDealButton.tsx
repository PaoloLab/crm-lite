'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, type ButtonVariant } from '@/components/ui';
import { DealForm, type DealFormContactOption, type DealFormStateOption } from './DealForm';

// Usato sia dal bottone principale in alto a destra (TopbarAction, stato di
// default "nuovo") sia dal bottone "+ Aggiungi trattativa" in fondo a ogni
// colonna Kanban (stato di default = quello della colonna): stesso modale,
// stessa Server Action, cambia solo defaultDealStateId/label/variant. Stesso
// pattern di router.refresh() al successo già usato da NewContactButton.
export function NewDealButton({
  contacts,
  dealStates,
  defaultDealStateId,
  label = '+ Nuova trattativa',
  buttonVariant = 'primary',
  buttonClassName,
}: {
  contacts: DealFormContactOption[];
  dealStates: DealFormStateOption[];
  defaultDealStateId: number;
  label?: string;
  buttonVariant?: ButtonVariant;
  buttonClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <Button variant={buttonVariant} className={buttonClassName} onClick={() => setOpen(true)}>
        {label}
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        title="Nuova trattativa"
        footer={
          <Button variant="secondary" type="button" onClick={handleClose}>
            Annulla
          </Button>
        }
      >
        <DealForm
          contacts={contacts}
          dealStates={dealStates}
          defaultDealStateId={defaultDealStateId}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </>
  );
}
