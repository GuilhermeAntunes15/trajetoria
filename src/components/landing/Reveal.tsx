"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Marca o container como visível quando ele entra na viewport.
 * Filhos com a classe `.lp-item` sobem suavemente e `.lp-grow` preenche a barra
 * de progresso. Toda a animação vive no CSS e é desligada por
 * `prefers-reduced-motion`. Sem JS, o <noscript> da landing neutraliza o estado
 * inicial, então o conteúdo nunca fica invisível.
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"pending" | "visible">("pending");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setState("visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState("visible");
          observer.disconnect();
        }
      },
      // threshold 0 + margem inferior negativa: dispara assim que o topo do
      // bloco cruza 88% da viewport, inclusive para blocos muito altos.
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-reveal={state} className={cn(className)}>
      {children}
    </div>
  );
}
