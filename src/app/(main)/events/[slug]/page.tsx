import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { IssueCertificateDialog } from "@/components/certificate/IssueCertificateDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionTitle } from "@/components/common/SectionTitle";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { empty, events as eventsCopy } from "@/lib/copy";
import { formatDateRange } from "@/lib/format";
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

  const sameSchool = viewer?.schoolId === event.schoolId;
  const hasPublicProject = event.entries.some(
    (entry) => entry.project.status === "APPROVED" && entry.project.visibility === "PUBLIC",
  );

  if (!sameSchool && !hasPublicProject) notFound();

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
      <div className="space-y-4">
        {event.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.coverImageUrl}
            alt={`Capa do evento ${event.name}`}
            className="aspect-[16/6] w-full rounded-[var(--radius-card)] border border-line object-cover"
          />
        ) : null}

        <Badge tone="info">{EVENT_TYPE_LABELS[event.type]}</Badge>
        <PageHeader
          title={event.name}
          description={event.description ?? undefined}
          actions={
            canManage ? (
              <>
                <ButtonLink href={`/teacher/events/${event.id}`} size="sm" variant="secondary">
                  {eventsCopy.editEvent}
                </ButtonLink>
                <IssueCertificateDialog
                  students={participants}
                  eventId={event.id}
                  defaultTitle={event.name}
                />
              </>
            ) : null
          }
        />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={16} strokeWidth={1.75} />
            {formatDateRange(event.startDate, event.endDate)}
          </span>
          {event.location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={16} strokeWidth={1.75} />
              {event.location}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Users size={16} strokeWidth={1.75} />
            {eventsCopy.studentCount(studentIds.size)}
          </span>
          <span>{event.school.name}</span>
        </div>
      </div>

      {highlights.length > 0 ? (
        <section className="space-y-4">
          <SectionTitle>{eventsCopy.highlightsTitle}</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((entry) => (
              <div key={entry.project.id} className="space-y-2">
                <ProjectCard project={toProjectCardData(entry.project)} />
                {entry.award ? <p className="text-xs text-muted">{entry.award}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <SectionTitle>{eventsCopy.participantsTitle}</SectionTitle>
        {visibleEntries.length === 0 ? (
          <EmptyState title={empty.projects.title} text={empty.projects.text} />
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
