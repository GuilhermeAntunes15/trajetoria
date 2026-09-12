import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  text?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

export function EmptyState({ title, text, actionLabel, actionHref, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-dashed border-line bg-surface px-5 py-8 text-center",
        className,
      )}
    >
      <p className="text-sm font-medium text-ink">{title}</p>
      {text ? <p className="mx-auto mt-1 max-w-md text-sm text-muted">{text}</p> : null}
      {actionLabel && actionHref ? (
        <ButtonLink href={actionHref} size="sm" className="mt-4">
          {actionLabel}
        </ButtonLink>
      ) : null}
    </div>
  );
}
