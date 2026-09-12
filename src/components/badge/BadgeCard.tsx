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
        "flex items-start gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-4",
        className,
      )}
    >
      <span className="mt-0.5 shrink-0 text-brand">
        <Icon size={20} strokeWidth={1.75} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{badge.name}</p>
        {badge.description ? <p className="text-sm text-muted">{badge.description}</p> : null}
        {badge.note ? <p className="mt-1 text-sm text-ink">{badge.note}</p> : null}
        {badge.issuedAt ? (
          <p className="mt-0.5 text-xs text-muted">
            {[formatDate(badge.issuedAt), badge.issuedByName].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>

      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
