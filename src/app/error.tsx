"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { errors } from "@/lib/copy";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-2xl font-semibold text-ink">{errors.generic}</h1>
      <p className="mt-2 text-sm text-muted">
        Você pode tentar de novo. Se continuar, avise a coordenação da escola.
      </p>
      <Button className="mt-6" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
