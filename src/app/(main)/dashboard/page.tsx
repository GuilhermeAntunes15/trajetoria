import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, CalendarDays, FolderOpen, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionTitle } from "@/components/common/SectionTitle";
import { rotateStyle } from "@/components/common/decor";
import { ProjectCard, type ProjectCardData } from "@/components/project/ProjectCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { STATUS_LABELS } from "@/lib/constants";
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
  icon: LucideIcon;
};

/**
 * Cartões de conquista: o que a pessoa já reuniu, em blocos de cor.
 * São contagens do próprio portfólio — não há placar, ranking nem comparação
 * com outras pessoas em lugar nenhum da tela.
 */
const ACHIEVEMENTS = [
  { color: "var(--color-lp-mint)", Icon: FolderOpen, rot: -1.5 },
  { color: "var(--color-lp-sun)", Icon: BadgeCheck, rot: 1 },
  { color: "var(--color-lp-sky)", Icon: CalendarDays, rot: -1 },
  { color: "var(--color-lp-paper)", Icon: Trophy, rot: 1.5 },
];

const YEAR_COLORS = [
  "var(--color-lp-sun)",
  "var(--color-lp-sky)",
  "var(--color-lp-mint)",
  "var(--color-lp-tangerine)",
];

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

  const currentPhase = recentProjects[0] ? STATUS_LABELS[recentProjects[0].status] : null;

  const timeline: TimelineEntry[] = [
    ...timelineProjects.map((project) => ({
      key: `p-${project.slug}`,
      year: project.year,
      date: project.projectDate,
      label: project.title,
      detail: "Projeto",
      href: `/projects/${project.slug}`,
      icon: FolderOpen,
    })),
    ...eventEntries.map((entry) => ({
      key: `e-${entry.event.id}`,
      year: entry.event.startDate.getFullYear(),
      date: entry.event.startDate,
      label: entry.event.name,
      detail: "Evento",
      href: `/events/${entry.event.slug}`,
      icon: CalendarDays,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const years = [...new Set(timeline.map((entry) => entry.year))].sort((a, b) => b - a);

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <h1 className="font-display text-[2rem] leading-[1.05] font-bold text-ink sm:text-5xl">
            {dashboard.greeting(firstName(viewer.name))}
          </h1>
          <p
            className="lp-sticker lp-sticker-flat inline-flex items-center gap-2 bg-lp-sun px-3 py-1.5 text-sm font-bold text-ink"
            style={rotateStyle(-2)}
          >
            <span className="text-[0.68rem] font-bold tracking-[0.12em] text-ink/70 uppercase">
              {dashboard.currentPhaseLabel}
            </span>
            {currentPhase ?? dashboard.noPhaseYet}
          </p>
        </div>
        <ButtonLink href="/projects/new" size="sm">
          {dashboard.newProject}
        </ButtonLink>
      </header>

      <section className="space-y-4" aria-labelledby="dash-achievements">
        <h2 id="dash-achievements" className="sr-only">
          {dashboard.achievementsTitle}
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {counters.map((counter, index) => {
            const style = ACHIEVEMENTS[index]!;
            const { Icon } = style;

            return (
              <li key={counter.label}>
                <div
                  className="lp-sticker lp-sticker-flat lp-lift-soft flex h-full flex-col p-4 sm:p-5"
                  style={{ ...rotateStyle(style.rot), backgroundColor: style.color }}
                >
                  <Icon size={26} strokeWidth={2.25} className="text-ink" aria-hidden="true" />
                  <p className="mt-3 font-display text-4xl leading-none font-bold text-ink sm:text-5xl">
                    {counter.value}
                  </p>
                  <p className="mt-2 text-xs leading-tight font-semibold text-ink/70 sm:text-sm">
                    {counter.label}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <SectionTitle>{dashboard.keepBuilding}</SectionTitle>
          <p className="text-sm text-muted">{dashboard.keepBuildingHint}</p>
        </div>
        {cards.length === 0 ? (
          <EmptyState
            title={empty.portfolio.title}
            text={empty.portfolio.text}
            actionLabel={empty.portfolio.action}
            actionHref="/projects/new"
            illustration="notebook"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((project) => (
              <ProjectCard key={project.slug} project={project} showProgress />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <SectionTitle>{dashboard.trajectory}</SectionTitle>
          <p className="text-sm text-muted">{dashboard.trajectoryHint}</p>
        </div>
        {timeline.length === 0 ? (
          <EmptyState
            title={empty.trajectory.title}
            text={empty.trajectory.text}
            illustration="map"
          />
        ) : (
          <div className="relative">
            {/* Linha tracejada do caderno: liga os anos de cima a baixo. */}
            <span
              aria-hidden
              className="absolute top-6 bottom-6 left-6 border-l-2 border-dashed border-ink/25"
            />
            <ol className="space-y-8">
              {years.map((year, index) => (
                <li key={year} className="relative pl-[4.5rem]">
                  <p
                    className="absolute top-0 left-0 grid size-12 place-items-center rounded-full border-2 border-ink font-display text-sm font-bold text-ink shadow-[3px_3px_0_var(--color-ink)]"
                    style={{ backgroundColor: YEAR_COLORS[index % YEAR_COLORS.length] }}
                  >
                    {year}
                  </p>
                  <ul className="space-y-3 pt-1">
                    {timeline
                      .filter((entry) => entry.year === year)
                      .map((entry, position) => {
                        const Icon = entry.icon;

                        return (
                          <li key={entry.key} className="relative">
                            {/* O circulo do ano ja marca o primeiro ponto da trilha. */}
                            {position > 0 ? (
                              <span
                                aria-hidden
                                className="absolute top-5 -left-[3.375rem] size-3 rounded-full border-2 border-ink bg-surface"
                              />
                            ) : null}
                            <div className="lp-sticker lp-sticker-soft lp-lift-soft rounded-[12px] bg-surface p-3.5">
                              <p className="flex items-center gap-2">
                                <Icon
                                  size={16}
                                  strokeWidth={2.25}
                                  className="shrink-0 text-brand"
                                  aria-hidden="true"
                                />
                                <Link
                                  href={entry.href}
                                  className="font-display text-base leading-tight font-bold text-ink transition-colors hover:text-brand"
                                >
                                  {entry.label}
                                </Link>
                              </p>
                              <p className="mt-1 pl-6 text-xs text-muted">
                                {entry.detail} · {formatDate(entry.date)}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>
    </div>
  );
}
