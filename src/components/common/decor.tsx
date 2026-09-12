import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Peças da linguagem visual "caderno de projetos", compartilhadas pela landing
 * pública e pelo app. Tudo é CSS/SVG inline: nenhuma imagem externa, nenhuma
 * dependência nova. As animações ficam no CSS e respeitam
 * `prefers-reduced-motion`.
 */

export function delayStyle(ms: number): CSSProperties {
  return { "--lp-delay": `${ms}ms` } as CSSProperties;
}

export function rotateStyle(deg: number): CSSProperties {
  return { "--lp-rot": `${deg}deg` } as CSSProperties;
}

export function Kicker({
  children,
  className,
  tone = "ink",
}: {
  children: ReactNode;
  className?: string;
  tone?: "ink" | "paper";
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-[0.7rem] font-bold tracking-[0.14em] uppercase",
        tone === "ink" ? "border-ink bg-lp-paper text-ink" : "border-lp-paper/60 text-lp-paper",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Sublinhado desenhado à mão, usado sob títulos de seção. */
export function Squiggle({
  className,
  color = "var(--color-lp-tangerine)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 180 14"
      className={cn("h-2.5 w-36", className)}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2 9C22 2 34 12 54 8s32-8 52-4 30 10 50 4"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Numeração vazada (01, 02…) usada como marca d'água das seções. */
export function OutlineNumber({
  value,
  color = "var(--color-ink)",
  className,
}: {
  value: number;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn("lp-num font-display leading-none font-bold", className)}
      style={{ "--lp-num-color": color } as CSSProperties}
      aria-hidden="true"
    >
      {String(value).padStart(2, "0")}
    </span>
  );
}

/**
 * Trilha do projeto até a validação. É leitura de estado, não placar: não há
 * pontos, nem comparação com outras pessoas.
 */
export function ProgressTrack({
  value,
  color = "var(--color-brand)",
  className,
  label,
}: {
  value: number;
  color?: string;
  className?: string;
  label?: string;
}) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div
      className={cn("lp-track h-3", className)}
      role="img"
      aria-label={label ?? `Progresso: ${percent}%`}
      style={{ "--lp-track-color": color } as CSSProperties}
    >
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}
