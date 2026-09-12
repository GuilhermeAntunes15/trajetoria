import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

/**
 * `soft` é o chip discreto de sempre (metadado, contagem, rótulo auxiliar).
 * `ink` é o adesivo do caderno — contorno preto e bloco de cor cheio —,
 * reservado para o estado que a pessoa precisa ler primeiro.
 */
export type BadgeVariant = "soft" | "ink";

const softTones: Record<BadgeTone, string> = {
  neutral: "border-line bg-canvas text-muted",
  brand: "border-brand/30 bg-brand/10 text-brand",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
  info: "border-info/30 bg-info/10 text-info",
};

const inkTones: Record<BadgeTone, string> = {
  neutral: "bg-lp-paper",
  brand: "bg-lp-mint",
  success: "bg-lp-mint",
  warning: "bg-lp-sun",
  danger: "bg-lp-tangerine",
  info: "bg-lp-sky",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  variant?: BadgeVariant;
};

export function Badge({ tone = "neutral", variant = "soft", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full text-xs",
        variant === "ink"
          ? cn("border-2 border-ink px-2.5 py-0.5 font-bold text-ink", inkTones[tone])
          : cn("border px-2.5 py-0.5 font-medium", softTones[tone]),
        className,
      )}
      {...props}
    />
  );
}
