import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { IssueCertificateDialog } from "@/components/certificate/IssueCertificateDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionTitle } from "@/components/common/SectionTitle";
import { EVENT_TYPE_COLORS, EVENT_TYPE_INK } from "@/components/event/EventCard";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { archive as archiveCopy, empty, events as eventsCopy } from "@/lib/copy";
import { formatDateRange } from "@/lib/format";
import { cn } from "@/lib/utils";
import { canManageEvent, canViewProject } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/session";
import {
  projectCardSelect,
  toProjectCardData,
  toProjectCtx,
} from "@/server/services/project.service";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug }, select: { name: true } });
  return { title: event?.name ?? "Evento" };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const viewer = await getViewer();

  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      startDate: true,
      endDate: true,
      location: true,
      coverImageUrl: true,
      schoolId: true,
      school: { select: { name: true } },
      entries: {
        orderBy: [{ isHighlight: "desc" }, { createdAt: "asc" }],
        select: {
          isHighlight: true,
          award: true,
          project: { select: projectCardSelect },
        },
      },
    },
  });

  if (!event) notFound();

  const permissionViewer = viewer
    ? { id: viewer.id, role: viewer.role, schoolId: viewer.schoolId }
    : null;

  const visibleEntries = event.entries.filter((entry) =>
    canViewProject(permissionViewer, toProjectCtx(entry.project)),
  );

  const studentIds = new Set<string>();
  for (const entry of visibleEntries) {
    for (const member of entry.project.members) studentIds.add(member.userId);
  }

  const highlights = visibleEntries.filter((entry) => entry.isHighlight);
  const others = visibleEntries.filter((entry) => !entry.isHighlight);
  const canManage = canManageEvent(permissionViewer, event.schoolId);

  const typeColor = EVENT_TYPE_COLORS[event.type];
  const typeInk = EVENT_TYPE_INK[event.type];

  const participants = canManage
    ? await prisma.user.findMany({
        where: {
          schoolId: event.schoolId,
          role: "STUDENT",
          isActive: true,
          projectMemberships: {
            some: { project: { eventEntries: { some: { eventId: event.id } } } },
          },
        },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      })
    : [];

  return (
    <div className="space-y-10">
      {/* Capa do evento: faixa na cor do tipo, como nos cartões da listagem. */}
      <header className="lp-sticker overflow-hidden bg-surface">
        <div
          className="h-3 border-b-2 border-ink"
          style={{ backgroundColor: typeColor }}
          aria-hidden
        />

        {event.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.coverImageUrl}
            alt={`Capa do evento ${event.name}`}
            className="aspect-[16/6] w-full border-b-2 border-ink object-cover"
          />
        ) : null}

        <div className="space-y-4 p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-3">
              <p
                className={cn(
                  "inline-flex rounded-full border-2 border-ink px-3 py-1 text-xs font-bold",
                  typeInk,
                )}
                style={{ backgroundColor: typeColor }}
              >
                {EVENT_TYPE_LABELS[event.type]}
              </p>
              <h1 className="font-display text-[1.875rem] leading-[1.05] font-bold text-ink sm:text-[2.5rem]">
                {event.name}
              </h1>
              {event.description ? (
                <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                  {event.description}
                </p>
              ) : null}
            </div>

            {canManage ? (
              <div className="flex flex-wrap items-center gap-2">
                <ButtonLink href={`/teacher/events/${event.id}`} size="sm" variant="secondary">
                  {eventsCopy.editEvent}
                </ButtonLink>
                <IssueCertificateDialog
                  students={participants}
                  eventId={event.id}
                  defaultTitle={event.name}
                />
              </div>
            ) : null}
          </div>

          <ul className="flex flex-wrap items-center gap-2">
            <li className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-lp-paper px-3 py-1 text-xs font-bold text-ink">
              <CalendarDays size={14} strokeWidth={2.25} aria-hidden="true" />
              {formatDateRange(event.startDate, event.endDate)}
            </li>
            {event.location ? (
              <li className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-lp-paper px-3 py-1 text-xs font-bold text-ink">
                <MapPin size={14} strokeWidth={2.25} aria-hidden="true" />
                {event.location}
              </li>
            ) : null}
            <li className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-lp-paper px-3 py-1 text-xs font-bold text-ink">
              <Users size={14} strokeWidth={2.25} aria-hidden="true" />
              {eventsCopy.studentCount(studentIds.size)}
            </li>
            <li className="text-xs text-muted">{event.school.name}</li>
          </ul>
        </div>
      </header>

      {highlights.length > 0 ? (
        <section className="space-y-6">
          <SectionTitle variant="display">{eventsCopy.highlightsTitle}</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2">
            {highlights.map((entry) => (
              <div key={entry.project.id} className="space-y-2">
                <ProjectCard
                  project={toProjectCardData(entry.project)}
                  ribbon={archiveCopy.featuredTag}
                />
                {entry.award ? (
                  <p className="pl-1 text-xs font-semibold text-muted">{entry.award}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <SectionTitle variant="display">{eventsCopy.participantsTitle}</SectionTitle>
        {visibleEntries.length === 0 ? (
          <EmptyState
            title={empty.eventProjects.title}
            text={empty.eventProjects.text}
            illustration="notebook"
          />
        ) : others.length === 0 ? null : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((entry) => (
              <ProjectCard key={entry.project.id} project={toProjectCardData(entry.project)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
