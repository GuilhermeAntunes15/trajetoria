"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { SubmitButton } from "@/components/common/SubmitButton";

type ConfirmDialogProps = {
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields?: Record<string, string>;
};

export function ConfirmDialog({
  triggerLabel,
  title,
  description,
  confirmLabel,
  action,
  hiddenFields,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title} description={description}>
        <form action={action} className="flex justify-end gap-2">
          {Object.entries(hiddenFields ?? {}).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <SubmitButton variant="danger" size="sm" pendingLabel="Confirmando...">
            {confirmLabel}
          </SubmitButton>
        </form>
      </Dialog>
    </>
  );
}
