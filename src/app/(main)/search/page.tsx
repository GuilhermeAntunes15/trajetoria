import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionTitle } from "@/components/common/SectionTitle";
import { SearchInput } from "@/components/layout/SearchInput";
import { ProjectCard } from "@/components/project/ProjectCard";
import { StudentAvatar } from "@/components/project/StudentAvatar";
import { Badge } from "@/components/ui/Badge";
import { empty, search as searchCopy } from "@/lib/copy";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/session";
import { searchEverything } from "@/server/services/search.service";

export const metadata: Metadata = { title: "Busca" };
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const viewer = await getViewer();
  const query = (params.q ?? "").trim().slice(0, 80);

  const permissionViewer = viewer
    ? { id: viewer.id, role: viewer.role, schoolId: viewer.schoolId }
    : null;

  const results =
    query.length >= 2 ? await searchEverything(permissionViewer, query) : null;

  const schoolSlug = viewer
    ? (
        await prisma.school.findUnique({
          where: { id: viewer.schoolId },
          select: { slug: true },
        })
      )?.slug ?? null
    : null;

  const hasResults =
    results !== null &&
    (results.projects.length > 0 ||
      results.students.length > 0 ||
      results.skills.length > 0 ||
      results.events.length > 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Acervo da escola"
        accent="var(--color-lp-sky)"
        title={searchCopy.title}
        description={query.length >= 2 ? searchCopy.resultsFor(query) : searchCopy.hint}
      />

      <SearchInput id="search-page" defaultValue={query} className="max-w-xl" />

      {results === null ? (
        <EmptyState title={empty.search.title} text={empty.search.text} illustration="magnifier" />
      ) : null}

      {results !== null && !hasResults ? (
        <EmptyState
          title={searchCopy.nothingFound(query)}
          text={empty.search.text}
          illustration="magnifier"
        />
      ) : null}

      {results !== null && results.projects.length > 0 ? (
        <section className="space-y-4">
          <SectionTitle>{searchCopy.sections.projects}</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      ) : null}

      {results !== null && results.students.length > 0 ? (
        <section className="space-y-4">
          <SectionTitle>{searchCopy.sections.students}</SectionTitle>
          <ul className="grid gap-2 sm:grid-cols-2">
            {results.students.map((student) => (
              <li key={student.username}>
                <Link
                  href={`/u/${student.username}`}
                  className="lp-sticker lp-sticker-soft lp-lift-soft flex items-center gap-3 bg-surface p-3"
                >
                  <StudentAvatar name={student.name} avatarUrl={student.avatarUrl} size="sm" />
                  <span className="min-w-0">
                    <span className="block font-display text-sm leading-tight font-bold text-ink">
                      {student.name}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {[student.course, student.classroom].filter(Boolean).join(" · ") ||
                        `@${student.username}`}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {results !== null && results.skills.length > 0 && schoolSlug ? (
        <section className="space-y-4">
          <SectionTitle>{searchCopy.sections.skills}</SectionTitle>
          <ul className="flex flex-wrap gap-2">
            {results.skills.map((skill) => (
              <li key={skill.slug}>
                <Link href={`/s/${schoolSlug}?skill=${skill.slug}`}>
                  <Badge tone="neutral">
                    {skill.name}
                    <span className="text-[0.68rem] font-normal opacity-80">
                      {skill.projectCount}
                    </span>
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {results !== null && results.events.length > 0 ? (
        <section className="space-y-4">
          <SectionTitle>{searchCopy.sections.events}</SectionTitle>
          <ul className="space-y-2">
            {results.events.map((event) => (
              <li key={event.slug}>
                <Link
                  href={`/events/${event.slug}`}
                  className="lp-sticker lp-sticker-soft lp-lift-soft flex items-center justify-between gap-3 bg-surface p-3"
                >
                  <span className="font-display text-sm leading-tight font-bold text-ink">
                    {event.name}
                  </span>
                  <span className="text-xs text-muted">{formatDate(event.startDate)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
