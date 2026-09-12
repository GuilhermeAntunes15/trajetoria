"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Visibility } from "@prisma/client";
import { fork as forkCopy } from "@/lib/copy";
import {
  canCreateProject,
  canDeleteProject,
  canEditProjectContent,
  canForkProject,
  canPublishProject,
  canSubmitProject,
} from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getViewer, type Viewer } from "@/lib/session";
import { generateUniqueSlug } from "@/lib/slug";
import {
  projectCreateSchema,
  projectUpdateSchema,
  projectVisibilitySchema,
} from "@/lib/validation/project.schema";
import {
  getProjectCtxById,
  getProjectCtxBySlug,
  type ProjectCtxRow,
} from "@/server/services/project.service";
import { notify } from "@/server/services/notification.service";

export type ProjectFormState = { error?: string };

function permissionViewer(viewer: Viewer) {
  return { id: viewer.id, role: viewer.role, schoolId: viewer.schoolId };
}

function parseProjectDate(value: string): Date | null {
  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function resolveVisibility(scope: "PRIVATE" | "SCHOOL", makePublic: boolean): Visibility {
  return makePublic ? "PUBLIC" : scope;
}

async function resolveEventId(eventId: string, schoolId: string): Promise<string | null> {
  if (!eventId) return null;
  const event = await prisma.event.findFirst({
    where: { id: eventId, schoolId },
    select: { id: true },
  });
  if (!event) throw new Error("Evento inválido para a sua escola.");
  return event.id;
}

async function resolveParentProject(
  parentProjectId: string,
  viewer: Viewer,
): Promise<ProjectCtxRow | null> {
  if (!parentProjectId) return null;

  const parent = await getProjectCtxById(parentProjectId);
  if (!parent) throw new Error(forkCopy.notAllowed);

  if (!canForkProject(permissionViewer(viewer), parent)) throw new Error(forkCopy.notAllowed);

  return parent;
}

async function resolveAdvisorId(advisorId: string, schoolId: string): Promise<string | null> {
  if (!advisorId) return null;
  const advisor = await prisma.user.findFirst({
    where: { id: advisorId, schoolId, role: "TEACHER", isActive: true },
    select: { id: true },
  });
  if (!advisor) throw new Error("Professor inválido para a sua escola.");
  return advisor.id;
}

export async function createProject(input: unknown): Promise<ProjectFormState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?redirectTo=%2Fprojects%2Fnew");

  if (!canCreateProject(permissionViewer(viewer))) {
    return { error: "Apenas estudantes podem criar projetos." };
  }

  const parsed = projectCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos do formulário." };
  }

  const data = parsed.data;
  const projectDate = parseProjectDate(data.projectDate);
  if (!projectDate) return { error: "Informe uma data válida." };

  let eventId: string | null;
  let advisorId: string | null;
  let parent: ProjectCtxRow | null;
  try {
    eventId = await resolveEventId(data.eventId, viewer.schoolId);
    advisorId = await resolveAdvisorId(data.advisorId, viewer.schoolId);
    parent = await resolveParentProject(data.parentProjectId, viewer);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Revise os campos do formulário." };
  }

  const slug = await generateUniqueSlug(data.title, async (candidate) => {
    const existing = await prisma.project.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return existing !== null;
  });

  await prisma.project.create({
    data: {
      slug,
      title: data.title,
      summary: data.summary,
      description: data.description || null,
      problem: data.problem || null,
      solution: data.solution || null,
      learnings: data.learnings || null,
      area: data.area || null,
      coverImageUrl: data.coverImageUrl || null,
      projectDate,
      year: projectDate.getUTCFullYear(),
      schoolId: viewer.schoolId,
      createdById: viewer.id,
      advisorId,
      parentProjectId: parent?.id ?? null,
      status: "DRAFT",
      visibility: resolveVisibility(data.visibilityScope, data.makePublic),
      allowFork: data.allowFork,
      members: {
        create: {
          userId: viewer.id,
          role: data.ownerRole,
          contribution: data.ownerContribution || null,
          isOwner: true,
        },
      },
      eventEntries: eventId ? { create: { eventId } } : undefined,
    },
  });

  if (parent) revalidatePath(`/projects/${parent.slug}`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect(`/projects/${slug}?saved=1`);
}

export async function updateProject(slug: string, input: unknown): Promise<ProjectFormState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const project = await getProjectCtxBySlug(slug);
  if (!project) return { error: "Projeto não encontrado." };

  if (!canEditProjectContent(permissionViewer(viewer), project)) {
    return { error: "Este projeto não pode ser editado agora." };
  }

  const parsed = projectUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos do formulário." };
  }

  const data = parsed.data;
  const projectDate = parseProjectDate(data.projectDate);
  if (!projectDate) return { error: "Informe uma data válida." };

  let eventId: string | null;
  let advisorId: string | null;
  try {
    eventId = await resolveEventId(data.eventId, project.schoolId);
    advisorId = await resolveAdvisorId(data.advisorId, project.schoolId);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Revise os campos do formulário." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id: project.id },
      data: {
        title: data.title,
        summary: data.summary,
        description: data.description || null,
        problem: data.problem || null,
        solution: data.solution || null,
        learnings: data.learnings || null,
        area: data.area || null,
        coverImageUrl: data.coverImageUrl || null,
        projectDate,
        year: projectDate.getUTCFullYear(),
        advisorId,
        visibility: resolveVisibility(data.visibilityScope, data.makePublic),
        allowFork: data.allowFork,
      },
    });

    await tx.eventProject.deleteMany({ where: { projectId: project.id } });
    if (eventId) {
      await tx.eventProject.create({ data: { projectId: project.id, eventId } });
    }
  });

  revalidatePath(`/projects/${slug}`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect(`/projects/${slug}?saved=1`);
}

export async function submitProject(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const projectId = String(formData.get("projectId") ?? "");
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      problem: true,
      solution: true,
      status: true,
      schoolId: true,
      createdById: true,
      advisorId: true,
      members: { select: { userId: true } },
      _count: { select: { evidences: true } },
    },
  });

  if (!project) throw new Error("Projeto não encontrado.");

  const submitCtx = {
    id: project.id,
    schoolId: project.schoolId,
    createdById: project.createdById,
    memberIds: project.members.map((member) => member.userId),
    status: project.status,
    title: project.title,
    summary: project.summary,
    problem: project.problem,
    solution: project.solution,
    evidenceCount: project._count.evidences,
  };

  if (!canSubmitProject(permissionViewer(viewer), submitCtx)) {
    throw new Error("Este projeto ainda não pode ser enviado para validação.");
  }

  await prisma.project.update({
    where: { id: project.id },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });

  const reviewers = project.advisorId
    ? [project.advisorId]
    : (
        await prisma.user.findMany({
          where: { schoolId: project.schoolId, role: "TEACHER", isActive: true },
          select: { id: true },
        })
      ).map((teacher) => teacher.id);

  await notify(reviewers, {
    type: "PROJECT_SUBMITTED",
    title: "Um projeto foi enviado para validação.",
    body: project.title,
    link: `/projects/${project.slug}`,
    actorId: viewer.id,
  });

  revalidatePath(`/projects/${project.slug}`);
  revalidatePath("/teacher");
  revalidatePath("/dashboard");
}

export async function deleteProject(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const projectId = String(formData.get("projectId") ?? "");
  const project = await getProjectCtxById(projectId);
  if (!project) throw new Error("Projeto não encontrado.");

  const otherMemberCount = project.memberIds.filter((id) => id !== project.createdById).length;

  if (!canDeleteProject(permissionViewer(viewer), { ...project, otherMemberCount })) {
    throw new Error("Este projeto não pode ser excluído.");
  }

  await prisma.project.delete({ where: { id: project.id } });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect("/projects");
}

export async function setProjectVisibility(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const projectId = String(formData.get("projectId") ?? "");
  const project = await getProjectCtxById(projectId);
  if (!project) throw new Error("Projeto não encontrado.");

  if (!canPublishProject(permissionViewer(viewer), project)) {
    throw new Error("Você não pode alterar a visibilidade deste projeto.");
  }

  const parsed = projectVisibilitySchema.safeParse({ visibility: formData.get("visibility") });
  if (!parsed.success) throw new Error("Visibilidade inválida.");

  await prisma.project.update({
    where: { id: project.id },
    data: { visibility: parsed.data.visibility },
  });

  revalidatePath(`/projects/${project.slug}`);
  revalidatePath("/projects");
}
