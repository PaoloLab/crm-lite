'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal } from '@/components/ui';
import {
  ActivityForm,
  type ActivityFormDealOption,
  type ActivityFormTypeOption,
} from './ActivityForm';

// Stesso pattern di NewDealButton/NewContactButton: trigger iniettato via
// TopbarAction, stesso router.refresh() al successo.
export function NewActivityButton({
  deals,
  activityTypes,
  defaultDealId,
}: {
  deals: ActivityFormDealOption[];
  activityTypes: ActivityFormTypeOption[];
  defaultDealId?: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        + Nuova attività
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        title="Nuova attività"
        footer={
          <Button variant="secondary" type="button" onClick={handleClose}>
            Annulla
          </Button>
        }
      >
        <p className="-mt-nl-sm mb-nl-md text-body text-text-secondary">
          Registra una chiamata, una email o un meeting su una trattativa.
        </p>
        <ActivityForm
          deals={deals}
          activityTypes={activityTypes}
          defaultDealId={defaultDealId}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </>
  );
}
