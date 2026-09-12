import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { SectionTitle } from "@/components/common/SectionTitle";
import { EventCard } from "@/components/event/EventCard";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ArchiveFilters } from "@/components/school/ArchiveFilters";
import { SchoolHeader } from "@/components/school/SchoolHeader";
import { AREAS } from "@/lib/constants";
import { archive as archiveCopy, empty } from "@/lib/copy";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/session";
import {
  countArchiveStats,
  getArchiveFacets,
  listArchiveFeatured,
  listArchiveProjects,
} from "@/server/services/search.service";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type SearchParams = {
  q?: string;
  year?: string;
  area?: string;
  event?: string;
  skill?: string;
  page?: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ schoolSlug: string }>;
}): Promise<Metadata> {
  const { schoolSlug } = await params;
  const school = await prisma.school.findUnique({
    where: { slug: schoolSlug },
    select: { name: true },
  });
  return { title: school ? `Acervo — ${school.name}` : archiveCopy.title };
}

function readPage(value: string | undefined): number {
  const page = Number(value ?? "1");
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function SchoolArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ schoolSlug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ schoolSlug }, rawParams] = await Promise.all([params, searchParams]);
  const viewer = await getViewer();

  const school = await prisma.school.findUnique({
    where: { slug: schoolSlug },
    select: { id: true, name: true, city: true, state: true, description: true },
  });

  if (!school) notFound();

  const permissionViewer = viewer
    ? { id: viewer.id, role: viewer.role, schoolId: viewer.schoolId }
    : null;

  const page = readPage(rawParams.page);
  const query = (rawParams.q ?? "").trim().slice(0, 80);
  const yearParam = Number(rawParams.year);
  const year = Number.isInteger(yearParam) && yearParam > 1900 ? yearParam : null;
  const area = AREAS.includes(rawParams.area as (typeof AREAS)[number])
    ? (rawParams.area as string)
    : null;
  const eventSlug = (rawParams.event ?? "").trim().slice(0, 90) || null;
  const skillSlug = (rawParams.skill ?? "").trim().slice(0, 90) || null;

  const filters = { q: query, year, area, event: eventSlug, skill: skillSlug };
  const hasFilters = Boolean(query || year || area || eventSlug || skillSlug);

  const [stats, facets, featured, { projects, total }, events] = await Promise.all([
    countArchiveStats(permissionViewer, school.id),
    getArchiveFacets(permissionViewer, school.id),
    hasFilters || page > 1 ? Promise.resolve([]) : listArchiveFeatured(permissionViewer, school.id),
    listArchiveProjects(permissionViewer, school.id, filters, {
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.event.findMany({
      where:
        viewer?.schoolId === school.id
          ? { schoolId: school.id }
          : {
              schoolId: school.id,
              entries: { some: { project: { status: "APPROVED", visibility: "PUBLIC" } } },
            },
      orderBy: { startDate: "desc" },
      take: 6,
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

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (target: number) => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (year) search.set("year", String(year));
    if (area) search.set("area", area);
    if (eventSlug) search.set("event", eventSlug);
    if (skillSlug) search.set("skill", skillSlug);
    if (target > 1) search.set("page", String(target));
    const queryString = search.toString();
    return queryString ? `/s/${schoolSlug}?${queryString}` : `/s/${schoolSlug}`;
  };

  return (
    <div className="space-y-10">
      <SchoolHeader school={school} stats={stats} />

      <ArchiveFilters
        action={`/s/${schoolSlug}`}
        facets={facets}
        values={{
          q: query,
          year: year ? String(year) : "",
          area: area ?? "",
          event: eventSlug ?? "",
          skill: skillSlug ?? "",
        }}
      />

      {featured.length > 0 ? (
        <section className="space-y-6">
          <SectionTitle variant="display">{archiveCopy.featuredTitle}</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                ribbon={archiveCopy.featuredTag}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <SectionTitle variant="display">{archiveCopy.projectsTitle}</SectionTitle>
        {projects.length === 0 ? (
          <EmptyState
            title={empty.projects.title}
            text={empty.projects.text}
            illustration="magnifier"
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
            <Pagination page={page} pageCount={pageCount} buildHref={buildHref} />
          </>
        )}
      </section>

      <section className="space-y-4">
        <SectionTitle variant="display">{archiveCopy.eventsTitle}</SectionTitle>
        {events.length === 0 ? (
          <EmptyState title={empty.events.title} text={empty.events.text} illustration="map" />
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
