import type { Prisma } from "@prisma/client";
import { logAudit } from "@/lib/audit";
import { notifications as notificationCopy, review as reviewCopy } from "@/lib/copy";
import {
  canArchiveProject,
  canAddFeedback,
  canFeatureProject,
  canReviewProject,
  canValidateSkill,
  type ProjectCtx,
  type Viewer as PermissionViewer,
} from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type { Viewer } from "@/lib/session";
import { notify } from "@/server/services/notification.service";
import type {
  AddFeedbackInput,
  ApproveProjectInput,
  RequestChangesInput,
} from "@/lib/validation/validation.schema";

const reviewSelect = {
  id: true,
  slug: true,
  title: true,
  schoolId: true,
  createdById: true,
  advisorId: true,
  status: true,
  visibility: true,
  allowFork: true,
  isFeatured: true,
  validatedAt: true,
  members: { select: { userId: true } },
} satisfies Prisma.ProjectSelect;

type ReviewRow = Prisma.ProjectGetPayload<{ select: typeof reviewSelect }>;

export type ReviewTarget = ProjectCtx & {
  slug: string;
  title: string;
  isFeatured: boolean;
  validatedAt: Date | null;
};

export class ReviewError extends Error {}

function permissionViewer(viewer: Viewer): PermissionViewer {
  return { id: viewer.id, role: viewer.role, schoolId: viewer.schoolId };
}

function toReviewTarget(row: ReviewRow): ReviewTarget {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    schoolId: row.schoolId,
    createdById: row.createdById,
    advisorId: row.advisorId,
    status: row.status,
    visibility: row.visibility,
    allowFork: row.allowFork,
    isFeatured: row.isFeatured,
    validatedAt: row.validatedAt,
    memberIds: row.members.map((member) => member.userId),
  };
}

async function loadTarget(projectId: string): Promise<ReviewTarget> {
  const row = await prisma.project.findUnique({ where: { id: projectId }, select: reviewSelect });
  if (!row) throw new ReviewError("Projeto não encontrado.");
  return toReviewTarget(row);
}

function recipients(target: ReviewTarget): string[] {
  return [target.createdById, ...target.memberIds];
}

export async function approveProject(
  viewer: Viewer,
  input: ApproveProjectInput,
): Promise<ReviewTarget> {
  const target = await loadTarget(input.projectId);

  if (!canReviewProject(permissionViewer(viewer), target)) {
    throw new ReviewError(reviewCopy.notReviewable);
  }
  if (target.status !== "SUBMITTED") throw new ReviewError(reviewCopy.notSubmitted);

  const validatedAt = new Date();

  const skillIds =
    input.validatedSkillIds.length > 0
      ? (
          await prisma.projectSkill.findMany({
            where: { id: { in: input.validatedSkillIds }, projectId: target.id },
            select: { id: true },
          })
        ).map((projectSkill) => projectSkill.id)
      : [];

  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id: target.id },
      data: { status: "APPROVED", validatedById: viewer.id, validatedAt },
    });

    await tx.projectValidation.create({
      data: {
        projectId: target.id,
        reviewerId: viewer.id,
        action: "APPROVED",
        strengths: input.strengths || null,
        improvements: input.improvements || null,
        generalComment: input.generalComment || null,
      },
    });

    if (skillIds.length > 0) {
      await tx.projectSkill.updateMany({
        where: { id: { in: skillIds } },
        data: { validatedByTeacher: true, validatorId: viewer.id, validatedAt },
      });
    }
  });

  await logAudit({
    schoolId: target.schoolId,
    actorId: viewer.id,
    action: "project.approved",
    entityType: "Project",
    entityId: target.id,
    metadata: { validatedSkills: skillIds.length },
  });

  await notify(recipients(target), {
    type: "PROJECT_APPROVED",
    title: notificationCopy.messages.projectApproved,
    body: target.title,
    link: `/projects/${target.slug}`,
    actorId: viewer.id,
  });

  return target;
}

export async function requestChanges(
  viewer: Viewer,
  input: RequestChangesInput,
): Promise<ReviewTarget> {
  const target = await loadTarget(input.projectId);

  if (!canReviewProject(permissionViewer(viewer), target)) {
    throw new ReviewError(reviewCopy.notReviewable);
  }
  if (target.status !== "SUBMITTED") throw new ReviewError(reviewCopy.notSubmitted);

  await prisma.$transaction(async (tx) => {
    await tx.project.update({ where: { id: target.id }, data: { status: "CHANGES_REQUESTED" } });

    await tx.projectValidation.create({
      data: {
        projectId: target.id,
        reviewerId: viewer.id,
        action: "CHANGES_REQUESTED",
        comment: input.comment,
        strengths: input.strengths || null,
        improvements: input.improvements || null,
      },
    });
  });

  await logAudit({
    schoolId: target.schoolId,
    actorId: viewer.id,
    action: "project.changes_requested",
    entityType: "Project",
    entityId: target.id,
  });

  await notify(recipients(target), {
    type: "PROJECT_CHANGES_REQUESTED",
    title: notificationCopy.messages.changesRequested,
    body: target.title,
    link: `/projects/${target.slug}`,
    actorId: viewer.id,
  });

  return target;
}

// Feedback avulso em projeto já aprovado usa ValidationAction.APPROVED sem tocar no status:
// o enum do banco só tem APPROVED e CHANGES_REQUESTED, e um registro CHANGES_REQUESTED aqui
// faria o histórico parecer um pedido de ajustes que nunca aconteceu.
export async function addFeedback(viewer: Viewer, input: AddFeedbackInput): Promise<ReviewTarget> {
  const target = await loadTarget(input.projectId);

  if (!canAddFeedback(permissionViewer(viewer), target)) {
    throw new ReviewError(reviewCopy.notReviewable);
  }
  if (target.status !== "APPROVED") throw new ReviewError(reviewCopy.notApproved);

  await prisma.projectValidation.create({
    data: {
      projectId: target.id,
      reviewerId: viewer.id,
      action: "APPROVED",
      strengths: input.strengths || null,
      improvements: input.improvements || null,
      generalComment: input.generalComment || null,
    },
  });

  await notify(recipients(target), {
    type: "FEEDBACK_ADDED",
    title: notificationCopy.messages.feedbackAdded,
    body: target.title,
    link: `/projects/${target.slug}`,
    actorId: viewer.id,
  });

  return target;
}

export async function setProjectSkillValidation(
  viewer: Viewer,
  projectSkillId: string,
  validate: boolean,
): Promise<ReviewTarget> {
  const projectSkill = await prisma.projectSkill.findUnique({
    where: { id: projectSkillId },
    select: {
      id: true,
      projectId: true,
      validatedByTeacher: true,
      skill: { select: { name: true } },
    },
  });

  if (!projectSkill) throw new ReviewError("Competência não encontrada.");

  const target = await loadTarget(projectSkill.projectId);

  if (!canValidateSkill(permissionViewer(viewer), target)) {
    throw new ReviewError(reviewCopy.notReviewable);
  }

  if (projectSkill.validatedByTeacher === validate) return target;

  await prisma.projectSkill.update({
    where: { id: projectSkill.id },
    data: validate
      ? { validatedByTeacher: true, validatorId: viewer.id, validatedAt: new Date() }
      : { validatedByTeacher: false, validatorId: null, validatedAt: null },
  });

  if (validate) {
    await notify(recipients(target), {
      type: "SKILL_VALIDATED",
      title: notificationCopy.messages.skillValidated,
      body: `${projectSkill.skill.name} — ${target.title}`,
      link: `/projects/${target.slug}`,
      actorId: viewer.id,
    });
  }

  return target;
}

export async function toggleFeatured(viewer: Viewer, projectId: string): Promise<ReviewTarget> {
  const target = await loadTarget(projectId);

  if (!canFeatureProject(permissionViewer(viewer), target)) {
    throw new ReviewError("Só projetos verificados podem virar destaque.");
  }

  const isFeatured = !target.isFeatured;

  await prisma.project.update({ where: { id: target.id }, data: { isFeatured } });

  await logAudit({
    schoolId: target.schoolId,
    actorId: viewer.id,
    action: isFeatured ? "project.featured" : "project.unfeatured",
    entityType: "Project",
    entityId: target.id,
  });

  return target;
}

export async function toggleEventHighlight(
  viewer: Viewer,
  eventProjectId: string,
): Promise<ReviewTarget> {
  const entry = await prisma.eventProject.findUnique({
    where: { id: eventProjectId },
    select: { id: true, isHighlight: true, projectId: true, event: { select: { slug: true } } },
  });

  if (!entry) throw new ReviewError("Este projeto não está vinculado a um evento.");

  const target = await loadTarget(entry.projectId);

  if (!canFeatureProject(permissionViewer(viewer), target)) {
    throw new ReviewError("Só projetos verificados podem virar destaque.");
  }

  await prisma.eventProject.update({
    where: { id: entry.id },
    data: { isHighlight: !entry.isHighlight },
  });

  await logAudit({
    schoolId: target.schoolId,
    actorId: viewer.id,
    action: entry.isHighlight ? "event_project.unhighlighted" : "event_project.highlighted",
    entityType: "EventProject",
    entityId: entry.id,
    metadata: { eventSlug: entry.event.slug },
  });

  return target;
}

export async function archiveProject(viewer: Viewer, projectId: string): Promise<ReviewTarget> {
  const target = await loadTarget(projectId);

  if (!canArchiveProject(permissionViewer(viewer), target)) {
    throw new ReviewError("Só a administração da escola pode arquivar projetos.");
  }
  if (target.status === "ARCHIVED") return target;

  await prisma.project.update({ where: { id: target.id }, data: { status: "ARCHIVED" } });

  await logAudit({
    schoolId: target.schoolId,
    actorId: viewer.id,
    action: "project.archived",
    entityType: "Project",
    entityId: target.id,
    metadata: { previousStatus: target.status },
  });

  return target;
}

// Ao desarquivar, o status anterior não é guardado: projeto já validado volta como APPROVED,
// os demais voltam como rascunho para que a equipe reenvie.
export async function unarchiveProject(viewer: Viewer, projectId: string): Promise<ReviewTarget> {
  const target = await loadTarget(projectId);

  if (!canArchiveProject(permissionViewer(viewer), target)) {
    throw new ReviewError("Só a administração da escola pode arquivar projetos.");
  }
  if (target.status !== "ARCHIVED") return target;

  const status = target.validatedAt ? "APPROVED" : "DRAFT";

  await prisma.project.update({ where: { id: target.id }, data: { status } });

  await logAudit({
    schoolId: target.schoolId,
    actorId: viewer.id,
    action: "project.unarchived",
    entityType: "Project",
    entityId: target.id,
    metadata: { status },
  });

  return target;
}
