import { OutlineNumber } from "@/components/common/decor";
import { cn } from "@/lib/utils";

type SectionTitleProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * `eyebrow` é o rótulo miúdo em caixa alta (padrão, usado nas listagens).
   * `display` é o título de leitura, em Fraunces, para as seções longas de um
   * projeto.
   */
  variant?: "eyebrow" | "display";
  /** Numeração vazada à direita do título — só faz sentido em `display`. */
  number?: number;
  /** Cor do contorno da numeração. */
  accent?: string;
};

export function SectionTitle({
  children,
  className,
  variant = "eyebrow",
  number,
  accent,
}: SectionTitleProps) {
  if (variant === "display") {
    return (
      <div className={cn("flex items-baseline justify-between gap-4 border-b-2 border-ink/10 pb-2", className)}>
        <h2 className="font-display text-xl leading-tight font-bold text-ink sm:text-2xl">
          {children}
        </h2>
        {typeof number === "number" ? (
          <OutlineNumber value={number} color={accent} className="shrink-0 text-2xl sm:text-3xl" />
        ) : null}
      </div>
    );
  }

  return (
    <h2 className={cn("text-xs font-bold tracking-[0.12em] text-muted uppercase", className)}>
      {children}
    </h2>
  );
}
