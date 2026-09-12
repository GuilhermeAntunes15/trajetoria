import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import type { EventType } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { formatDateRange } from "@/lib/format";
import { cn } from "@/lib/utils";

export type EventCardData = {
  slug: string;
  name: string;
  description: string | null;
  type: EventType;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  projectCount?: number;
};

export function EventCard({ event, className }: { event: EventCardData; className?: string }) {
  return (
    <article
      className={cn(
        "rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-[var(--shadow-card)] transition-colors hover:border-brand/40 sm:p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="info">{EVENT_TYPE_LABELS[event.type]}</Badge>
        {typeof event.projectCount === "number" ? (
          <span className="text-xs text-muted">
            {event.projectCount === 1 ? "1 projeto" : `${event.projectCount} projetos`}
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 text-base font-semibold text-ink">
        <Link href={`/events/${event.slug}`} className="transition-colors hover:text-brand">
          {event.name}
        </Link>
      </h3>
      {event.description ? (
        <p className="mt-1 line-clamp-2 text-sm text-muted">{event.description}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={14} strokeWidth={1.75} />
          {formatDateRange(event.startDate, event.endDate)}
        </span>
        {event.location ? (
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} strokeWidth={1.75} />
            {event.location}
          </span>
        ) : null}
      </div>
    </article>
  );
}
