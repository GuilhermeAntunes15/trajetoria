import { logAudit } from "@/lib/audit";
import { badges as badgesCopy, notifications as notificationCopy } from "@/lib/copy";
import { canGrantBadge, canManageSchoolEntity } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type { Viewer } from "@/lib/session";
import type { GrantBadgeInput } from "@/lib/validation/badge.schema";
import { notify } from "@/server/services/notification.service";

export class BadgeError extends Error {}

function permissionViewer(viewer: Viewer) {
  return { id: viewer.id, role: viewer.role, schoolId: viewer.schoolId };
}

export async function grantBadge(
  viewer: Viewer,
  input: GrantBadgeInput,
): Promise<{ badgeName: string; studentUsername: string }> {
  const student = await prisma.user.findFirst({
    where: { id: input.userId, role: "STUDENT", isActive: true },
    select: { id: true, username: true, schoolId: true },
  });

  if (!student) throw new BadgeError("Estudante inválido para a sua escola.");

  if (!canGrantBadge(permissionViewer(viewer), student.schoolId)) {
    throw new BadgeError("Você não pode conceder badges para este estudante.");
  }

  const badge = await prisma.badge.findFirst({
    where: { id: input.badgeId, schoolId: student.schoolId },
    select: { id: true, name: true },
  });

  if (!badge) throw new BadgeError("Badge inválida para a sua escola.");

  let projectId: string | null = null;
  if (input.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: input.projectId, schoolId: student.schoolId },
      select: { id: true },
    });
    if (!project) throw new BadgeError("Projeto inválido para a sua escola.");
    projectId = project.id;
  }

  let eventId: string | null = null;
  if (input.eventId) {
    const event = await prisma.event.findFirst({
      where: { id: input.eventId, schoolId: student.schoolId },
      select: { id: true },
    });
    if (!event) throw new BadgeError("Evento inválido para a sua escola.");
    eventId = event.id;
  }

  const existing = await prisma.userBadge.findFirst({
    where: { userId: student.id, badgeId: badge.id, projectId },
    select: { id: true },
  });

  if (existing) throw new BadgeError(badgesCopy.alreadyGranted);

  const userBadge = await prisma.userBadge.create({
    data: {
      userId: student.id,
      badgeId: badge.id,
      issuedById: viewer.id,
      projectId,
      eventId,
      note: input.note || null,
    },
    select: { id: true },
  });

  await notify([student.id], {
    type: "BADGE_GRANTED",
    title: notificationCopy.messages.badgeGranted(badge.name),
    body: input.note || null,
    link: `/u/${student.username}`,
    actorId: viewer.id,
  });

  await logAudit({
    schoolId: student.schoolId,
    actorId: viewer.id,
    action: "badge.granted",
    entityType: "UserBadge",
    entityId: userBadge.id,
    metadata: { badgeId: badge.id, userId: student.id, projectId, eventId },
  });

  return { badgeName: badge.name, studentUsername: student.username };
}

export async function revokeBadge(viewer: Viewer, userBadgeId: string): Promise<string> {
  const userBadge = await prisma.userBadge.findUnique({
    where: { id: userBadgeId },
    select: {
      id: true,
      badgeId: true,
      user: { select: { id: true, username: true, schoolId: true } },
    },
  });

  if (!userBadge) throw new BadgeError("Badge não encontrada.");

  if (!canManageSchoolEntity(permissionViewer(viewer), userBadge.user.schoolId)) {
    throw new BadgeError("Só a administração da escola pode remover badges.");
  }

  await prisma.userBadge.delete({ where: { id: userBadge.id } });

  await logAudit({
    schoolId: userBadge.user.schoolId,
    actorId: viewer.id,
    action: "badge.revoked",
    entityType: "UserBadge",
    entityId: userBadge.id,
    metadata: { badgeId: userBadge.badgeId, userId: userBadge.user.id },
  });

  return userBadge.user.username;
}
