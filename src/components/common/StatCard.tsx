import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const PADDINGS = {
  compact: "px-4 py-3",
  regular: "p-4",
} as const;

type StatCardProps = {
  label: string;
  value: number;
  /** Ícone opcional no topo do cartão, dentro da bolha contornada. */
  icon?: LucideIcon;
  /** Cor de fundo da bolha do ícone. */
  tint?: string;
  href?: string;
  action?: string;
  /** Acompanha o padding dos demais cartões da mesma tela. */
  padding?: keyof typeof PADDINGS;
  className?: string;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tint,
  href,
  action,
  padding = "compact",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "lp-sticker lp-sticker-soft flex h-full flex-col bg-surface",
        PADDINGS[padding],
        className,
      )}
    >
      {Icon ? (
        <span
          className="grid size-9 place-items-center rounded-full border-2 border-ink text-ink"
          style={tint ? { backgroundColor: tint } : undefined}
          aria-hidden
        >
          <Icon size={17} strokeWidth={2.25} />
        </span>
      ) : null}
      <p className={cn("font-display text-3xl leading-none font-bold text-ink", Icon && "mt-3")}>
        {value}
      </p>
      <p className="mt-1.5 text-xs leading-tight text-muted">{label}</p>
      {href && action ? (
        <Link
          href={href}
          className="mt-3 inline-block text-sm font-semibold text-brand hover:text-brand-hover"
        >
          {action}
        </Link>
      ) : null}
    </div>
  );
}
