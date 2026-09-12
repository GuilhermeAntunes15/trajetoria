import { CalendarDays, FolderOpen, MapPin, Users } from "lucide-react";
import { Kicker, rotateStyle } from "@/components/common/decor";
import { archive as archiveCopy } from "@/lib/copy";

export type SchoolHeaderData = {
  name: string;
  city: string | null;
  state: string | null;
  description: string | null;
};

export type SchoolStats = { projects: number; events: number; students: number };

const COUNTER_STYLES = [
  { color: "var(--color-lp-mint)", Icon: FolderOpen, rot: -1.5 },
  { color: "var(--color-lp-sky)", Icon: CalendarDays, rot: 1 },
  { color: "var(--color-lp-sun)", Icon: Users, rot: -1 },
];

/** Capa do acervo: bloco de papel com trama de pontos, como a abertura da landing. */
export function SchoolHeader({ school, stats }: { school: SchoolHeaderData; stats: SchoolStats }) {
  const place = [school.city, school.state].filter(Boolean).join(" · ");

  const counters = [
    { label: archiveCopy.counters.projects, value: stats.projects },
    { label: archiveCopy.counters.events, value: stats.events },
    { label: archiveCopy.counters.students, value: stats.students },
  ];

  return (
    <header className="relative overflow-hidden rounded-[var(--radius-sticker)] border-2 border-ink bg-lp-paper shadow-[5px_5px_0_var(--color-ink)]">
      <div className="lp-dots pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative space-y-5 p-5 sm:p-8">
        <div className="space-y-3">
          <Kicker>{archiveCopy.title}</Kicker>
          <h1 className="font-display text-[1.75rem] leading-[1.05] font-bold text-ink sm:text-4xl">
            {school.name}
          </h1>
          {place ? (
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-muted">
              <MapPin size={16} strokeWidth={2} aria-hidden="true" />
              {place}
            </p>
          ) : null}
          {school.description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              {school.description}
            </p>
          ) : null}
        </div>

        <dl className="grid max-w-xl grid-cols-3 gap-2.5 sm:gap-4">
          {counters.map((counter, index) => {
            const style = COUNTER_STYLES[index]!;
            const { Icon } = style;

            return (
              <div
                key={counter.label}
                className="lp-sticker lp-sticker-flat flex flex-col px-3 py-3 sm:px-4"
                style={{ ...rotateStyle(style.rot), backgroundColor: style.color }}
              >
                <Icon size={18} strokeWidth={2.25} className="text-ink" aria-hidden="true" />
                <dt className="order-3 mt-1 text-[0.7rem] leading-tight font-semibold text-ink/70">
                  {counter.label}
                </dt>
                <dd className="order-2 mt-1.5 font-display text-2xl leading-none font-bold text-ink sm:text-3xl">
                  {counter.value}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </header>
  );
}
