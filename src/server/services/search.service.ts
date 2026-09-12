import { Prisma } from "@prisma/client";
import type { ProjectCardData } from "@/components/project/ProjectCard";
import { canViewProfile } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { likePattern } from "@/lib/search-text";
import type { Viewer } from "@/lib/session";
import {
  projectCardSelect,
  projectVisibilityWhere,
  toProjectCardData,
} from "@/server/services/project.service";

export type SearchViewer = { id: string; role: Viewer["role"]; schoolId: string } | null;

export type ArchiveFilters = {
  q?: string;
  year?: number | null;
  area?: string | null;
  event?: string | null;
  skill?: string | null;
};

export type ArchiveFacets = {
  years: number[];
  areas: { area: string; count: number }[];
  events: { slug: string; name: string }[];
  skills: { slug: string; name: string }[];
};

const MATCH_LIMIT = 500;

async function matchIds(
  table: string,
  columns: string[],
  query: string,
  scope: Prisma.Sql = Prisma.sql`TRUE`,
): Promise<string[]> {
  const pattern = likePattern(query);
  const predicate = Prisma.join(
    columns.map(
      (column) =>
        Prisma.sql`unaccent(lower("${Prisma.raw(column)}")) LIKE unaccent(lower(${pattern}))`,
    ),
    " OR ",
  );

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "${Prisma.raw(table)}"
    WHERE ${scope} AND (${predicate})
    LIMIT ${MATCH_LIMIT}
  `;

  return rows.map((row) => row.id);
}

export async function archiveProjectWhere(
  viewer: SearchViewer,
  schoolId: string,
  filters: ArchiveFilters = {},
): Promise<Prisma.ProjectWhereInput> {
  const sameSchool = viewer?.schoolId === schoolId;

  return {
    schoolId,
    status: "APPROVED",
    visibility: sameSchool ? { in: ["SCHOOL", "PUBLIC"] } : "PUBLIC",
    ...(filters.q
      ? {
          id: {
            in: await matchIds(
              "Project",
              ["title", "summary"],
              filters.q,
              Prisma.sql`"schoolId" = ${schoolId}`,
            ),
          },
        }
      : {}),
    ...(filters.year ? { year: filters.year } : {}),
    ...(filters.area ? { area: filters.area } : {}),
    ...(filters.event ? { eventEntries: { some: { event: { slug: filters.event } } } } : {}),
    ...(filters.skill ? { skills: { some: { skill: { slug: filters.skill } } } } : {}),
  };
}

export async function listArchiveProjects(
  viewer: SearchViewer,
  schoolId: string,
  filters: ArchiveFilters,
  options: { take: number; skip: number },
): Promise<{ projects: ProjectCardData[]; total: number }> {
  const where = await archiveProjectWhere(viewer, schoolId, filters);

  const [rows, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: [{ projectDate: "desc" }, { createdAt: "desc" }],
      take: options.take,
      skip: options.skip,
      select: projectCardSelect,
    }),
    prisma.project.count({ where }),
  ]);

  return { projects: rows.map(toProjectCardData), total };
}

export async function listArchiveFeatured(
  viewer: SearchViewer,
  schoolId: string,
  take = 3,
): Promise<ProjectCardData[]> {
  const rows = await prisma.project.findMany({
    where: { ...(await archiveProjectWhere(viewer, schoolId)), isFeatured: true },
    orderBy: [{ projectDate: "desc" }],
    take,
    select: projectCardSelect,
  });

  return rows.map(toProjectCardData);
}

export async function getArchiveFacets(
  viewer: SearchViewer,
  schoolId: string,
): Promise<ArchiveFacets> {
  const baseWhere = await archiveProjectWhere(viewer, schoolId);

  const [years, areas, events, skills] = await Promise.all([
    prisma.project.groupBy({ by: ["year"], where: baseWhere, orderBy: { year: "desc" } }),
    prisma.project.groupBy({
      by: ["area"],
      where: { ...baseWhere, area: { not: null } },
      _count: { _all: true },
    }),
    prisma.event.findMany({
      where: { schoolId },
      orderBy: { startDate: "desc" },
      select: { slug: true, name: true },
    }),
    prisma.skill.findMany({
      where: { schoolId, projectSkills: { some: { project: baseWhere } } },
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  return {
    years: years.map((row) => row.year),
    areas: areas
      .filter((row): row is typeof row & { area: string } => row.area !== null)
      .map((row) => ({ area: row.area, count: row._count._all }))
      .sort((a, b) => b.count - a.count),
    events,
    skills,
  };
}

export async function countArchiveStats(
  viewer: SearchViewer,
  schoolId: string,
): Promise<{ projects: number; events: number; students: number }> {
  const baseWhere = await archiveProjectWhere(viewer, schoolId);

  const [projects, events, students] = await Promise.all([
    prisma.project.count({ where: baseWhere }),
    prisma.event.count({
      where:
        viewer?.schoolId === schoolId
          ? { schoolId }
          : {
              schoolId,
              entries: { some: { project: { status: "APPROVED", visibility: "PUBLIC" } } },
            },
    }),
    prisma.user.count({ where: { schoolId, role: "STUDENT", isActive: true } }),
  ]);

  return { projects, events, students };
}

export type SearchResults = {
  projects: ProjectCardData[];
  students: {
    username: string;
    name: string;
    avatarUrl: string | null;
    course: string | null;
    classroom: string | null;
  }[];
  skills: { slug: string; name: string; projectCount: number }[];
  events: { slug: string; name: string; startDate: Date }[];
};

export async function searchEverything(
  viewer: SearchViewer,
  query: string,
): Promise<SearchResults> {
  const [projectIds, studentIds, skillIds, eventIds] = await Promise.all([
    matchIds("Project", ["title", "summary"], query),
    matchIds("User", ["name", "username"], query),
    viewer
      ? matchIds("Skill", ["name"], query, Prisma.sql`"schoolId" = ${viewer.schoolId}`)
      : Promise.resolve([]),
    matchIds("Event", ["name"], query),
  ]);

  const [projectRows, studentRows, skillRows, eventRows] = await Promise.all([
    prisma.project.findMany({
      where: {
        AND: [
          { status: { not: "ARCHIVED" } },
          projectVisibilityWhere(viewer),
          { id: { in: projectIds } },
        ],
      },
      orderBy: [{ projectDate: "desc" }],
      take: 10,
      select: projectCardSelect,
    }),
    prisma.user.findMany({
      where: {
        role: "STUDENT",
        isActive: true,
        AND: [
          { id: { in: studentIds } },
          viewer
            ? { OR: [{ schoolId: viewer.schoolId }, { profileVisibility: "PUBLIC" }] }
            : { profileVisibility: "PUBLIC" },
        ],
      },
      orderBy: { name: "asc" },
      take: 10,
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        schoolId: true,
        profileVisibility: true,
        studentProfile: { select: { course: true, classroom: { select: { name: true } } } },
      },
    }),
    viewer
      ? prisma.skill.findMany({
          where: { schoolId: viewer.schoolId, id: { in: skillIds } },
          orderBy: { name: "asc" },
          take: 10,
          select: {
            slug: true,
            name: true,
            _count: { select: { projectSkills: true } },
          },
        })
      : Promise.resolve([]),
    prisma.event.findMany({
      where: {
        id: { in: eventIds },
        ...(viewer
          ? { schoolId: viewer.schoolId }
          : { entries: { some: { project: { status: "APPROVED", visibility: "PUBLIC" } } } }),
      },
      orderBy: { startDate: "desc" },
      take: 10,
      select: { slug: true, name: true, startDate: true },
    }),
  ]);

  return {
    projects: projectRows.map(toProjectCardData),
    students: studentRows
      .filter((student) =>
        canViewProfile(viewer, {
          id: student.id,
          schoolId: student.schoolId,
          profileVisibility: student.profileVisibility,
        }),
      )
      .map((student) => ({
        username: student.username,
        name: student.name,
        avatarUrl: student.avatarUrl,
        course: student.studentProfile?.course ?? null,
        classroom: student.studentProfile?.classroom?.name ?? null,
      })),
    skills: skillRows.map((skill) => ({
      slug: skill.slug,
      name: skill.name,
      projectCount: skill._count.projectSkills,
    })),
    events: eventRows,
  };
}
