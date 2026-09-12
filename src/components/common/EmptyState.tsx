import { Illustration, type IllustrationName } from "@/components/common/Illustration";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  text?: string;
  actionLabel?: string;
  actionHref?: string;
  /** Desenho de apoio. O texto continua dizendo tudo sozinho. */
  illustration?: IllustrationName;
  className?: string;
};

export function EmptyState({
  title,
  text,
  actionLabel,
  actionHref,
  illustration,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[var(--radius-sticker)] border-2 border-dashed border-ink/20 bg-surface px-5 py-9 text-center",
        className,
      )}
    >
      {illustration ? (
        <Illustration name={illustration} className="mb-4 h-24 w-auto sm:h-28" />
      ) : null}
      <p className="font-display text-lg leading-tight font-bold text-ink">{title}</p>
      {text ? <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">{text}</p> : null}
      {actionLabel && actionHref ? (
        <ButtonLink href={actionHref} size="sm" className="mt-5">
          {actionLabel}
        </ButtonLink>
      ) : null}
    </div>
  );
}
