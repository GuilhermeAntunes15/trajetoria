import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionTitle } from "@/components/common/SectionTitle";
import { ProjectCard, type ProjectCardData } from "@/components/project/ProjectCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardBody } from "@/components/ui/Card";
import { dashboard, empty } from "@/lib/copy";
import { firstName, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireOnboarded } from "@/lib/session";

export const metadata: Metadata = { title: "Início" };
export const dynamic = "force-dynamic";

type TimelineEntry = {
  key: string;
  year: number;
  date: Date;
  label: string;
  detail: string;
  href: string;
};

export default async function DashboardPage() {
  const viewer = await requireOnboarded("/dashboard");

  if (viewer.role === "TEACHER") redirect("/teacher");
  if (viewer.role === "ADMIN") redirect("/admin");

  const memberships = await prisma.projectMember.findMany({
    where: { userId: viewer.id },
    select: { projectId: true },
  });
  const projectIds = memberships.map((membership) => membership.projectId);

  const [verifiedSkills, eventEntries, badgeCount, recentProjects, timelineProjects] =
    await Promise.all([
      prisma.projectSkill.count({
        where: { projectId: { in: projectIds }, validatedByTeacher: true },
      }),
      prisma.eventProject.findMany({
        where: { projectId: { in: projectIds } },
        distinct: ["eventId"],
        select: { event: { select: { id: true, name: true, slug: true, startDate: true } } },
      }),
      prisma.userBadge.count({ where: { userId: viewer.id } }),
      prisma.project.findMany({
        where: { id: { in: projectIds } },
        orderBy: { updatedAt: "desc" },
        take: 3,
        select: {
          slug: true,
          title: true,
          summary: true,
          status: true,
          visibility: true,
          year: true,
          area: true,
          _count: { select: { members: true } },
          eventEntries: { select: { event: { select: { name: true } } } },
        },
      }),
      prisma.project.findMany({
        where: { id: { in: projectIds } },
        orderBy: { projectDate: "desc" },
        select: { slug: true, title: true, year: true, projectDate: true, status: true },
      }),
    ]);

  const counters = [
    { label: dashboard.countersLabels.projects, value: projectIds.length },
    { label: dashboard.countersLabels.verifiedSkills, value: verifiedSkills },
    { label: dashboard.countersLabels.events, value: eventEntries.length },
    { label: dashboard.countersLabels.badges, value: badgeCount },
  ];

  const cards: ProjectCardData[] = recentProjects.map((project) => ({
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    status: project.status,
    visibility: project.visibility,
    year: project.year,
    area: project.area,
    memberCount: project._count.members,
    eventName: project.eventEntries[0]?.event.name ?? null,
  }));

  const timeline: TimelineEntry[] = [
    ...timelineProjects.map((project) => ({
      key: `p-${project.slug}`,
      year: project.year,
      date: project.projectDate,
      label: project.title,
      detail: "Projeto",
      href: `/projects/${project.slug}`,
    })),
    ...eventEntries.map((entry) => ({
      key: `e-${entry.event.id}`,
      year: entry.event.startDate.getFullYear(),
      date: entry.event.startDate,
      label: entry.event.name,
      detail: "Evento",
      href: `/events/${entry.event.slug}`,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const years = [...new Set(timeline.map((entry) => entry.year))].sort((a, b) => b - a);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          {dashboard.greeting(firstName(viewer.name))}
        </h1>
        <ButtonLink href="/projects/new" size="sm">
          {dashboard.newProject}
        </ButtonLink>
      </div>

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
        <SectionTitle>{dashboard.keepBuilding}</SectionTitle>
        {cards.length === 0 ? (
          <EmptyState
            title={empty.portfolio.title}
            text={empty.portfolio.text}
            actionLabel={empty.portfolio.action}
            actionHref="/projects/new"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionTitle>{dashboard.trajectory}</SectionTitle>
        {timeline.length === 0 ? (
          <EmptyState title={empty.trajectory.title} text={empty.trajectory.text} />
        ) : (
          <div className="space-y-6">
            {years.map((year) => (
              <div key={year} className="grid gap-3 sm:grid-cols-[5rem_1fr]">
                <p className="font-display text-lg font-semibold text-brand">{year}</p>
                <ul className="space-y-2 border-l border-line pl-4">
                  {timeline
                    .filter((entry) => entry.year === year)
                    .map((entry) => (
                      <li key={entry.key} className="text-sm">
                        <Link href={entry.href} className="font-medium text-ink hover:text-brand">
                          {entry.label}
                        </Link>
                        <span className="text-muted"> — {entry.detail}</span>
                        <span className="block text-xs text-muted">{formatDate(entry.date)}</span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
