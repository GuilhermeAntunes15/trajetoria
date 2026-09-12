import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProjectCardData } from "@/components/project/ProjectCard";
import { canViewProject, type ProjectCtx, type Viewer } from "@/lib/permissions";

export const projectCardSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  status: true,
  visibility: true,
  year: true,
  area: true,
  schoolId: true,
  createdById: true,
  advisorId: true,
  allowFork: true,
  updatedAt: true,
  members: { select: { userId: true } },
  eventEntries: { select: { event: { select: { name: true } } } },
} satisfies Prisma.ProjectSelect;

type ProjectCardRow = Prisma.ProjectGetPayload<{ select: typeof projectCardSelect }>;

export function projectVisibilityWhere(viewer: Viewer): Prisma.ProjectWhereInput {
  const publicClause: Prisma.ProjectWhereInput = { status: "APPROVED", visibility: "PUBLIC" };

  if (!viewer) return publicClause;

  if (viewer.role === "TEACHER" || viewer.role === "ADMIN") {
    return { OR: [publicClause, { schoolId: viewer.schoolId }] };
  }

  return {
    OR: [
      publicClause,
      { schoolId: viewer.schoolId, status: "APPROVED", visibility: "SCHOOL" },
      { members: { some: { userId: viewer.id } } },
    ],
  };
}

export function toProjectCtx(row: ProjectCardRow): ProjectCtx {
  return {
    id: row.id,
    schoolId: row.schoolId,
    createdById: row.createdById,
    advisorId: row.advisorId,
    status: row.status,
    visibility: row.visibility,
    allowFork: row.allowFork,
    memberIds: row.members.map((member) => member.userId),
  };
}

export function toProjectCardData(row: ProjectCardRow): ProjectCardData {
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    status: row.status,
    visibility: row.visibility,
    year: row.year,
    area: row.area,
    memberCount: row.members.length,
    eventName: row.eventEntries[0]?.event.name ?? null,
  };
}

function statusWhere(includeArchived: boolean): Prisma.ProjectWhereInput {
  return includeArchived ? {} : { status: { not: "ARCHIVED" } };
}

export async function listVisibleProjects(
  viewer: Viewer,
  options: {
    take?: number;
    skip?: number;
    where?: Prisma.ProjectWhereInput;
    includeArchived?: boolean;
  } = {},
): Promise<ProjectCardData[]> {
  const rows = await prisma.project.findMany({
    where: {
      AND: [
        statusWhere(options.includeArchived ?? false),
        projectVisibilityWhere(viewer),
        options.where ?? {},
      ],
    },
    orderBy: [{ projectDate: "desc" }, { createdAt: "desc" }],
    take: options.take ?? 24,
    skip: options.skip ?? 0,
    select: projectCardSelect,
  });

  return rows
    .filter((row) => canViewProject(viewer, toProjectCtx(row)))
    .map(toProjectCardData);
}

export async function countVisibleProjects(
  viewer: Viewer,
  options: { where?: Prisma.ProjectWhereInput; includeArchived?: boolean } = {},
): Promise<number> {
  return prisma.project.count({
    where: {
      AND: [
        statusWhere(options.includeArchived ?? false),
        projectVisibilityWhere(viewer),
        options.where ?? {},
      ],
    },
  });
}

const projectCtxSelect = {
  id: true,
  slug: true,
  schoolId: true,
  createdById: true,
  advisorId: true,
  status: true,
  visibility: true,
  allowFork: true,
  members: { select: { userId: true } },
} satisfies Prisma.ProjectSelect;

export type ProjectCtxRow = ProjectCtx & { slug: string };

function rowToCtx(row: Prisma.ProjectGetPayload<{ select: typeof projectCtxSelect }>): ProjectCtxRow {
  return {
    id: row.id,
    slug: row.slug,
    schoolId: row.schoolId,
    createdById: row.createdById,
    advisorId: row.advisorId,
    status: row.status,
    visibility: row.visibility,
    allowFork: row.allowFork,
    memberIds: row.members.map((member) => member.userId),
  };
}

export async function getProjectCtxBySlug(slug: string): Promise<ProjectCtxRow | null> {
  const row = await prisma.project.findUnique({ where: { slug }, select: projectCtxSelect });
  return row ? rowToCtx(row) : null;
}

export async function getProjectCtxById(id: string): Promise<ProjectCtxRow | null> {
  const row = await prisma.project.findUnique({ where: { id }, select: projectCtxSelect });
  return row ? rowToCtx(row) : null;
}
