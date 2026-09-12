"use client";

import { useId, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { ACCEPT_BY_KIND, type UploadKind } from "@/lib/upload";
import { cn } from "@/lib/utils";

export type UploadedFile = {
  url: string;
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

type FileUploadProps = {
  kind: UploadKind;
  label: string;
  hint?: string;
  value: string | null;
  onChange: (value: string | null, meta?: UploadedFile) => void;
  name?: string;
  className?: string;
};

export function FileUpload({
  kind,
  label,
  hint,
  value,
  onChange,
  name,
  className,
}: FileUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setPending(true);

    const body = new FormData();
    body.append("file", file);
    body.append("kind", kind);

    try {
      const response = await fetch("/api/upload", { method: "POST", body });
      const payload = (await response.json()) as Partial<UploadedFile> & { error?: string };

      if (!response.ok || !payload.url) {
        setError(payload.error ?? "Não foi possível enviar o arquivo.");
        return;
      }

      onChange(payload.url, payload as UploadedFile);
    } catch {
      setError("Não foi possível enviar o arquivo.");
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function clear() {
    setError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={inputId}>{label}</Label>

      {value && kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="Pré-visualização do arquivo enviado"
          className="h-32 w-full rounded-[var(--radius-card)] border border-line object-cover sm:w-56"
        />
      ) : null}

      {value && kind === "document" ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-brand hover:text-brand-hover"
        >
          <FileText size={16} strokeWidth={1.75} />
          Ver arquivo enviado
        </a>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT_BY_KIND[kind]}
          disabled={pending}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
          className="block w-full max-w-xs text-sm text-muted file:mr-3 file:rounded-[var(--radius-control)] file:border file:border-line file:bg-surface file:px-3 file:py-1.5 file:text-sm file:text-ink hover:file:bg-canvas"
        />
        {value ? (
          <Button variant="ghost" size="sm" onClick={clear}>
            <X size={16} strokeWidth={1.75} />
            Remover
          </Button>
        ) : null}
      </div>

      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}

      {pending ? (
        <p className="inline-flex items-center gap-1.5 text-xs text-muted">
          <Upload size={14} strokeWidth={1.75} />
          Enviando arquivo...
        </p>
      ) : null}

      {hint && !pending ? <p className="text-xs text-muted">{hint}</p> : null}

      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
