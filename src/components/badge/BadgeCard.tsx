import { badgeIcon } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export type BadgeCardData = {
  name: string;
  description: string | null;
  icon: string;
  note?: string | null;
  issuedAt?: Date | null;
  issuedByName?: string | null;
};

/**
 * Peça de coleção: ícone em bloco de cor, contorno preto, sombra dura.
 * A cor sai do nome da badge — é estável, e não indica raridade nem valor.
 * Não existe ranking, ponto ou contagem comparativa em lugar nenhum.
 */
const TINTS = [
  "var(--color-lp-sun)",
  "var(--color-lp-mint)",
  "var(--color-lp-sky)",
  "var(--color-lp-tangerine)",
  "var(--color-lp-paper)",
];

function tintFor(name: string): string {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 9973;
  }
  return TINTS[hash % TINTS.length]!;
}

export function BadgeCard({
  badge,
  actions,
  className,
}: {
  badge: BadgeCardData;
  actions?: React.ReactNode;
  className?: string;
}) {
  const Icon = badgeIcon(badge.icon);

  return (
    <div
      className={cn(
        "lp-sticker lp-sticker-flat lp-lift-soft flex h-full items-start gap-4 bg-surface p-4 sm:p-5",
        className,
      )}
    >
      <span
        className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-ink text-ink"
        style={{ backgroundColor: tintFor(badge.name) }}
        aria-hidden
      >
        <Icon size={22} strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-display text-base leading-tight font-bold text-ink">{badge.name}</p>
        {badge.description ? (
          <p className="mt-1 text-sm leading-relaxed text-muted">{badge.description}</p>
        ) : null}
        {badge.note ? <p className="mt-1.5 text-sm text-ink">{badge.note}</p> : null}
        {badge.issuedAt ? (
          <p className="mt-1.5 text-xs text-muted">
            {[formatDate(badge.issuedAt), badge.issuedByName].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>

      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
