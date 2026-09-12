import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionTitle } from "@/components/common/SectionTitle";
import { EventCard } from "@/components/event/EventCard";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardBody } from "@/components/ui/Card";
import { empty, teacher as teacherCopy } from "@/lib/copy";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { listVisibleProjects } from "@/server/services/project.service";

export const metadata: Metadata = { title: "Painel do professor" };
export const dynamic = "force-dynamic";

export default async function TeacherPage() {
  const viewer = await requireRole(["TEACHER", "ADMIN"], "/teacher");
  const year = new Date().getFullYear();

  const [
    waiting,
    approvedThisYear,
    activeStudents,
    eventsThisYear,
    queue,
    recentProjects,
    classrooms,
    events,
  ] = await Promise.all([
    prisma.project.count({ where: { schoolId: viewer.schoolId, status: "SUBMITTED" } }),
    prisma.project.count({ where: { schoolId: viewer.schoolId, status: "APPROVED", year } }),
    prisma.user.count({ where: { schoolId: viewer.schoolId, role: "STUDENT", isActive: true } }),
    prisma.event.count({
      where: {
        schoolId: viewer.schoolId,
        startDate: { gte: new Date(`${year}-01-01T00:00:00.000Z`) },
      },
    }),
    prisma.project.findMany({
      where: { schoolId: viewer.schoolId, status: "SUBMITTED" },
      orderBy: [{ submittedAt: "asc" }],
      take: 10,
      select: {
        id: true,
        slug: true,
        title: true,
        submittedAt: true,
        advisorId: true,
        members: { select: { user: { select: { name: true } } } },
        eventEntries: { select: { event: { select: { name: true } } } },
      },
    }),
    listVisibleProjects(viewer, { where: { schoolId: viewer.schoolId }, take: 3 }),
    prisma.classroom.findMany({
      where: { schoolId: viewer.schoolId },
      orderBy: [{ year: "desc" }, { name: "asc" }],
      take: 6,
      select: { id: true, name: true, year: true, _count: { select: { students: true } } },
    }),
    prisma.event.findMany({
      where: { schoolId: viewer.schoolId },
      orderBy: { startDate: "desc" },
      take: 4,
      select: {
        slug: true,
        name: true,
        description: true,
        type: true,
        startDate: true,
        endDate: true,
        location: true,
        _count: { select: { entries: true } },
      },
    }),
  ]);

  const sortedQueue = [...queue].sort((a, b) => {
    const aMine = a.advisorId === viewer.id ? 0 : 1;
    const bMine = b.advisorId === viewer.id ? 0 : 1;
    return aMine - bMine;
  });

  const counters = [
    { label: "Aguardando você", value: waiting },
    { label: `Projetos aprovados em ${year}`, value: approvedThisYear },
    { label: "Alunos ativos", value: activeStudents },
    { label: `Eventos em ${year}`, value: eventsThisYear },
  ];

  return (
    <div className="space-y-10">
      <PageHeader title={teacherCopy.title} description={teacherCopy.subtitle} />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {counters.map((counter) => (
          <Card key={counter.label}>
            <CardBody className="py-4">
              <p className="text-2xl font-semibold text-ink">{counter.value}</p>
              <p className="mt-0.5 text-xs text-muted">{counter.label}</p>
            </CardBody>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <SectionTitle>{teacherCopy.queueTitle}</SectionTitle>
        {sortedQueue.length === 0 ? (
          <EmptyState title={empty.teacherQueue.title} text={empty.teacherQueue.text} />
        ) : (
          <ul className="space-y-2">
            {sortedQueue.map((project) => (
              <li
                key={project.id}
                className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="text-sm font-medium text-ink hover:text-brand"
                    >
                      {project.title}
                    </Link>
                    {project.advisorId === viewer.id ? (
                      <Badge tone="brand">{teacherCopy.yoursFirst}</Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted">
                    {project.members.map((member) => member.user.name).join(", ")}
                  </p>
                  <p className="text-xs text-muted">
                    {[
                      project.eventEntries[0]?.event.name,
                      project.submittedAt ? `Enviado em ${formatDate(project.submittedAt)}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <ButtonLink href={`/projects/${project.slug}`} size="sm" variant="secondary">
                  {teacherCopy.reviewAction}
                </ButtonLink>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <SectionTitle>{teacherCopy.recentTitle}</SectionTitle>
        {recentProjects.length === 0 ? (
          <EmptyState title={empty.projects.title} text={empty.projects.text} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <SectionTitle>{teacherCopy.classesTitle}</SectionTitle>
          <Link href="/teacher/classes" className="text-sm text-brand hover:text-brand-hover">
            {teacherCopy.seeAll}
          </Link>
        </div>
        {classrooms.length === 0 ? (
          <EmptyState title={teacherCopy.classesEmpty.title} text={teacherCopy.classesEmpty.text} />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {classrooms.map((classroom) => (
              <li
                key={classroom.id}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-4"
              >
                <span className="text-sm font-medium text-ink">{classroom.name}</span>
                <span className="text-xs text-muted">
                  {classroom.year} ·{" "}
                  {classroom._count.students === 1
                    ? "1 estudante"
                    : `${classroom._count.students} estudantes`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <SectionTitle>{teacherCopy.eventsTitle}</SectionTitle>
          <Link href="/teacher/events" className="text-sm text-brand hover:text-brand-hover">
            {teacherCopy.seeAll}
          </Link>
        </div>
        {events.length === 0 ? (
          <EmptyState title={empty.events.title} text={empty.events.text} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {events.map((event) => (
              <EventCard
                key={event.slug}
                event={{
                  slug: event.slug,
                  name: event.name,
                  description: event.description,
                  type: event.type,
                  startDate: event.startDate,
                  endDate: event.endDate,
                  location: event.location,
                  projectCount: event._count.entries,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
