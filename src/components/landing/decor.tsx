import Link from "next/link";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Peças visuais exclusivas da landing pública.
 * Tudo é SVG inline/local: nenhuma imagem externa, nenhuma dependência nova.
 */

type LandingButtonTone = "ink" | "sun" | "paper" | "outline";

const buttonTones: Record<LandingButtonTone, string> = {
  ink: "bg-ink text-lp-paper",
  sun: "bg-lp-sun text-ink",
  paper: "bg-lp-paper text-ink",
  outline: "bg-transparent text-ink",
};

export function LandingButton({
  tone = "ink",
  size = "lg",
  className,
  ...props
}: ComponentProps<typeof Link> & { tone?: LandingButtonTone; size?: "md" | "lg" }) {
  return (
    <Link
      className={cn(
        "lp-focus inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink font-semibold",
        "shadow-[4px_4px_0_var(--color-ink)]",
        "motion-safe:transition-all motion-safe:duration-200",
        "hover:shadow-[6px_7px_0_var(--color-ink)] motion-safe:hover:-translate-y-0.5",
        "active:shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0",
        size === "lg" ? "min-h-14 px-7 py-3.5 text-base sm:px-9 sm:text-lg" : "min-h-11 px-5 text-sm",
        buttonTones[tone],
        className,
      )}
      {...props}
    />
  );
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

export function VerifiedSeal({ label, className }: { label: string; className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-2 border-brand bg-brand px-3 py-1 text-xs font-semibold text-white",
        className,
      )}
    >
      <BadgeCheck size={15} strokeWidth={2.25} aria-hidden="true" />
      {label}
    </p>
  );
}

/** Sublinhado desenhado à mão, usado sob títulos de seção. */
export function Squiggle({ className, color = "var(--color-lp-tangerine)" }: { className?: string; color?: string }) {
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

/** Seta curva de caderno, aponta de um bloco para outro. */
export function ArrowDoodle({ className, color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg
      viewBox="0 0 96 84"
      className={cn("h-16 w-16", className)}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M8 6c34 2 58 20 62 48"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="1 10"
      />
      <path
        d="M56 48l14 12 12-15"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Capa reduzida do projeto de enchentes (mesma linguagem dos SVGs do acervo). */
export function FloodCover({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 120"
      className={cn("h-full w-full", className)}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="360" height="120" fill="var(--color-lp-sky)" />
      <path
        d="M0 84c30-10 60 8 90 0s60-12 90-2 60 14 90 4 60-12 90-4v38H0z"
        fill="var(--color-info)"
        opacity="0.35"
      />
      <path
        d="M0 92c30-10 60 8 90 0s60-12 90-2 60 14 90 4 60-12 90-4"
        stroke="var(--color-info)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="44" y="30" width="10" height="58" rx="5" fill="var(--color-brand)" />
      <rect x="30" y="16" width="38" height="26" rx="8" fill="var(--color-brand)" />
      <circle cx="49" cy="29" r="6" fill="var(--color-lp-paper)" />
      <polyline
        points="150,74 186,54 222,64 258,36 294,48 320,24"
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="320" cy="24" r="8" fill="var(--color-accent)" />
    </svg>
  );
}

export function delayStyle(ms: number): CSSProperties {
  return { "--lp-delay": `${ms}ms` } as CSSProperties;
}

export function rotateStyle(deg: number): CSSProperties {
  return { "--lp-rot": `${deg}deg` } as CSSProperties;
}
