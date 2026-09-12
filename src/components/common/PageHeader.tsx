import { Kicker, Squiggle } from "@/components/common/decor";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** Etiqueta curta acima do título, no formato adesivo da marca. */
  eyebrow?: string;
  /**
   * Cor do rabisco sob o título. `null` (padrão) não desenha rabisco nenhum —
   * é o que as telas de gestão usam para ficarem sóbrias.
   */
  accent?: string | null;
  className?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  accent = null,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-2">
        {eyebrow ? <Kicker>{eyebrow}</Kicker> : null}
        <h1 className="font-display text-[1.75rem] leading-[1.1] font-bold text-ink sm:text-4xl">
          {title}
        </h1>
        {accent ? <Squiggle className="w-28" color={accent} /> : null}
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
