import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import type { EventType } from "@prisma/client";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { calendarParts, formatDateRange } from "@/lib/format";
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

/**
 * Cada tipo de evento tem sua cor. É a mesma faixa na listagem e na página do
 * evento, então dá para reconhecer o hackathon de longe — mas o nome do tipo
 * continua escrito, porque cor sozinha não é informação.
 */
export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  HACKATHON: "var(--color-lp-tangerine)",
  SCIENCE_FAIR: "var(--color-lp-mint)",
  CULTURAL_SHOW: "var(--color-lp-sun)",
  INTEGRATED_PROJECT: "var(--color-lp-sky)",
  COMPETITION: "var(--color-brand)",
  OLYMPIAD: "var(--color-brand)",
  OTHER: "var(--color-lp-paper)",
};

/** Verde cheio pede texto claro; os demais blocos são claros e pedem tinta. */
export const EVENT_TYPE_INK: Record<EventType, string> = {
  HACKATHON: "text-ink",
  SCIENCE_FAIR: "text-ink",
  CULTURAL_SHOW: "text-ink",
  INTEGRATED_PROJECT: "text-ink",
  COMPETITION: "text-white",
  OLYMPIAD: "text-white",
  OTHER: "text-ink",
};

export function EventCard({ event, className }: { event: EventCardData; className?: string }) {
  const color = EVENT_TYPE_COLORS[event.type];
  const onColor = EVENT_TYPE_INK[event.type];
  const { day, month } = calendarParts(event.startDate);

  return (
    <article
      className={cn(
        "lp-sticker lp-sticker-flat lp-lift-soft flex h-full flex-col overflow-hidden bg-surface",
        className,
      )}
    >
      <div className="h-2.5 border-b-2 border-ink" style={{ backgroundColor: color }} aria-hidden />

      <div className="flex flex-1 gap-4 p-4 sm:p-5">
        <div
          className={cn(
            "grid h-16 w-14 shrink-0 place-items-center rounded-[10px] border-2 border-ink",
            onColor,
          )}
          style={{ backgroundColor: color }}
          aria-hidden
        >
          <span className="text-center leading-none">
            <span className="block font-display text-2xl font-bold">{day}</span>
            <span className="mt-0.5 block text-[0.62rem] font-bold tracking-[0.1em]">{month}</span>
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-bold",
                onColor,
              )}
              style={{ backgroundColor: color }}
            >
              {EVENT_TYPE_LABELS[event.type]}
            </span>
            {typeof event.projectCount === "number" ? (
              <span className="text-xs text-muted">
                {event.projectCount === 1 ? "1 projeto" : `${event.projectCount} projetos`}
              </span>
            ) : null}
          </div>

          <h3 className="mt-2.5 font-display text-lg leading-snug font-bold text-ink">
            <Link href={`/events/${event.slug}`} className="transition-colors hover:text-brand">
              {event.name}
            </Link>
          </h3>
          {event.description ? (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
              {event.description}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} strokeWidth={2} aria-hidden="true" />
              {formatDateRange(event.startDate, event.endDate)}
            </span>
            {event.location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} strokeWidth={2} aria-hidden="true" />
                {event.location}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
