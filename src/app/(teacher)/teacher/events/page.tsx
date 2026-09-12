import type { Metadata } from "next";
import Link from "next/link";
import { deleteEvent } from "@/actions/event.actions";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { empty, events as eventsCopy } from "@/lib/copy";
import { formatDateRange } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Eventos da escola" };
export const dynamic = "force-dynamic";

export default async function TeacherEventsPage() {
  const viewer = await requireRole(["TEACHER", "ADMIN"], "/teacher/events");

  const events = await prisma.event.findMany({
    where: { schoolId: viewer.schoolId },
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      slug: true,
      name: true,
      type: true,
      startDate: true,
      endDate: true,
      location: true,
      _count: { select: { entries: true } },
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title={eventsCopy.manageTitle}
        description={eventsCopy.manageSubtitle}
        actions={
          <ButtonLink href="/teacher/events/new" size="sm">
            {eventsCopy.newEvent}
          </ButtonLink>
        }
      />

      {events.length === 0 ? (
        <EmptyState title={empty.events.title} text={empty.events.text} />
      ) : (
        <ul className="space-y-2">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/events/${event.slug}`}
                    className="text-sm font-medium text-ink hover:text-brand"
                  >
                    {event.name}
                  </Link>
                  <Badge tone="info">{EVENT_TYPE_LABELS[event.type]}</Badge>
                </div>
                <p className="text-xs text-muted">
                  {[
                    formatDateRange(event.startDate, event.endDate),
                    event.location,
                    event._count.entries === 1
                      ? "1 projeto"
                      : `${event._count.entries} projetos`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <ButtonLink href={`/teacher/events/${event.id}`} size="sm" variant="secondary">
                  {eventsCopy.editEvent}
                </ButtonLink>
                {viewer.role === "ADMIN" && event._count.entries === 0 ? (
                  <ConfirmDialog
                    triggerLabel={eventsCopy.deleteAction}
                    title={eventsCopy.deleteAction}
                    description={eventsCopy.deleteConfirm}
                    confirmLabel={eventsCopy.deleteAction}
                    action={deleteEvent}
                    hiddenFields={{ eventId: event.id }}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
