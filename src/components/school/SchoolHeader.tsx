import { MapPin } from "lucide-react";
import { archive as archiveCopy } from "@/lib/copy";

export type SchoolHeaderData = {
  name: string;
  city: string | null;
  state: string | null;
  description: string | null;
};

export type SchoolStats = { projects: number; events: number; students: number };

export function SchoolHeader({ school, stats }: { school: SchoolHeaderData; stats: SchoolStats }) {
  const place = [school.city, school.state].filter(Boolean).join(" · ");

  const counters = [
    { label: archiveCopy.counters.projects, value: stats.projects },
    { label: archiveCopy.counters.events, value: stats.events },
    { label: archiveCopy.counters.students, value: stats.students },
  ];

  return (
    <header className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">
          {archiveCopy.title}
        </p>
        <h1 className="font-display text-2xl leading-tight font-semibold text-ink sm:text-3xl">
          {school.name}
        </h1>
        {place ? (
          <p className="inline-flex items-center gap-1.5 text-sm text-muted">
            <MapPin size={16} strokeWidth={1.75} />
            {place}
          </p>
        ) : null}
        {school.description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted">{school.description}</p>
        ) : null}
      </div>

      <dl className="grid grid-cols-3 gap-2 sm:gap-3">
        {counters.map((counter) => (
          <div
            key={counter.label}
            className="rounded-[var(--radius-card)] border border-line bg-surface px-3 py-3 sm:px-4"
          >
            <dt className="text-xs text-muted">{counter.label}</dt>
            <dd className="text-xl font-semibold text-ink">{counter.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
