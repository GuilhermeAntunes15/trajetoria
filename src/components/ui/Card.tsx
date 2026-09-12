import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * `plain` é o cartão de trabalho: borda fina, sombra quase inexistente.
 * É o que formulários, tabelas e painéis de gestão continuam usando.
 * `sticker` é o adesivo do caderno, para as peças que a pessoa quer olhar:
 * capa de projeto, conquista, certificado.
 */
export type CardVariant = "plain" | "sticker";

type CardProps = HTMLAttributes<HTMLDivElement> & { variant?: CardVariant };

export function Card({ variant = "plain", className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        variant === "sticker"
          ? "lp-sticker bg-surface"
          : "rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-line px-4 py-3 sm:px-5", className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 py-4 sm:px-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("border-t border-line px-4 py-3 sm:px-5", className)} {...props} />
  );
}
