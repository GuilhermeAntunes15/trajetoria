"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { errors } from "@/lib/copy";

export default function MainError({
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
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6">
      <h1 className="font-display text-xl font-semibold text-ink">{errors.generic}</h1>
      <p className="mt-2 text-sm text-muted">Nada foi perdido. Você pode tentar carregar de novo.</p>
      <Button className="mt-5" size="sm" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
