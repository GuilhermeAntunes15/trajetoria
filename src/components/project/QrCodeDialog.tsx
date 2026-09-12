"use client";

import { useState } from "react";
import { Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { qr as qrCopy } from "@/lib/copy";

type QrCodeDialogProps = {
  slug: string;
  title: string;
  schoolName: string;
  shareUrl: string;
  restricted?: boolean;
};

export function QrCodeDialog({ slug, title, schoolName, shareUrl, restricted }: QrCodeDialogProps) {
  const [open, setOpen] = useState(false);
  const src = `/api/projects/${slug}/qr`;

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <QrCode size={16} strokeWidth={1.75} />
        {qrCopy.action}
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={qrCopy.title}
        description={qrCopy.description}
      >
        <div className="space-y-4">
          <div className="flex justify-center rounded-[var(--radius-card)] border border-line bg-canvas p-4">
            {open ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={qrCopy.imageAlt(title)} width={224} height={224} className="size-56" />
            ) : null}
          </div>

          <div className="space-y-1 text-center">
            <p className="text-sm font-medium text-ink">{title}</p>
            <p className="text-sm text-muted">{schoolName}</p>
            <p className="break-all text-xs text-muted">{shareUrl}</p>
          </div>

          {restricted ? <p className="text-xs text-muted">{qrCopy.restrictedNote}</p> : null}

          <div className="flex justify-end">
            <a
              href={`${src}?download=1`}
              download={`qr-${slug}.png`}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-brand bg-brand px-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
            >
              <Download size={16} strokeWidth={1.75} />
              {qrCopy.download}
            </a>
          </div>
        </div>
      </Dialog>
    </>
  );
}
