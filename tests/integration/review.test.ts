import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({ viewer: null as unknown }));

vi.mock("next/cache", () => ({ revalidatePath: () => undefined, revalidateTag: () => undefined }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));
vi.mock("@/lib/session", () => ({
  getViewer: async () => session.viewer,
  requireUser: async () => session.viewer,
  requireRole: async () => session.viewer,
  requireOnboarded: async () => session.viewer,
}));

import { prisma } from "@/lib/prisma";
import type { Viewer } from "@/lib/session";
import { submitProject } from "@/actions/project.actions";
import { approveProject, requestChanges, ReviewError } from "@/server/services/validation.service";
import { grantBadge, BadgeError } from "@/server/services/badge.service";
import { createProjectRow, createSchool, createUser, formData, resetDatabase } from "./factory";

const enabled = Boolean(process.env.TEST_DATABASE_URL);

describe.skipIf(!enabled)("validação do professor", () => {
  let schoolA: { id: string };
  let schoolB: { id: string };
  let owner: Viewer;
  let teammate: Viewer;
  let outsider: Viewer;
  let teacherA: Viewer;
  let teacherB: Viewer;

  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await resetDatabase();

    schoolA = await createSchool("escola-a", "E.E. Horizonte");
    schoolB = await createSchool("escola-b", "Colégio Aurora");

    owner = await createUser({ schoolId: schoolA.id, role: "STUDENT", username: "joao.silva" });
    teammate = await createUser({ schoolId: schoolA.id, role: "STUDENT", username: "maria.santos" });
    outsider = await createUser({ schoolId: schoolA.id, role: "STUDENT", username: "ana.oliveira" });
    teacherA = await createUser({ schoolId: schoolA.id, role: "TEACHER", username: "carlos.menezes" });
    teacherB = await createUser({ schoolId: schoolB.id, role: "TEACHER", username: "rita.alves" });

    session.viewer = owner;
  });

  async function draftProject() {
    return createProjectRow({
      schoolId: schoolA.id,
      owner,
      slug: "sistema-de-monitoramento-de-enchentes",
      memberIds: [teammate.id],
      withEvidence: true,
    });
  }

  it("envia para validação e avisa os professores da escola", async () => {
    const project = await draftProject();

    await submitProject(formData({ projectId: project.id }));

    const updated = await prisma.project.findUnique({
      where: { id: project.id },
      select: { status: true, submittedAt: true },
    });

    expect(updated!.status).toBe("SUBMITTED");
    expect(updated!.submittedAt).not.toBeNull();

    const notified = await prisma.notification.findMany({
      where: { type: "PROJECT_SUBMITTED" },
      select: { userId: true },
    });

    expect(notified.map((notification) => notification.userId)).toEqual([teacherA.id]);
  });

  it("projeto incompleto não pode ser enviado", async () => {
    const project = await createProjectRow({
      schoolId: schoolA.id,
      owner,
      slug: "projeto-sem-evidencia",
    });

    await expect(submitProject(formData({ projectId: project.id }))).rejects.toThrow(
      "Este projeto ainda não pode ser enviado para validação.",
    );
  });

  it("aprova registrando quem validou e notifica exatamente os integrantes", async () => {
    const project = await draftProject();
    await submitProject(formData({ projectId: project.id }));
    await prisma.notification.deleteMany({});

    const skill = await prisma.skill.create({
      data: { name: "Python", slug: "python", category: "TECHNICAL", schoolId: schoolA.id },
    });
    const projectSkill = await prisma.projectSkill.create({
      data: { projectId: project.id, skillId: skill.id },
    });

    await approveProject(teacherA, {
      projectId: project.id,
      strengths: "A equipe conversou com moradores antes de definir o alerta.",
      improvements: "",
      generalComment: "",
      validatedSkillIds: [projectSkill.id],
    });

    const updated = await prisma.project.findUnique({
      where: { id: project.id },
      select: { status: true, validatedById: true, validatedAt: true },
    });

    expect(updated!.status).toBe("APPROVED");
    expect(updated!.validatedById).toBe(teacherA.id);
    expect(updated!.validatedAt).not.toBeNull();

    const validatedSkill = await prisma.projectSkill.findUnique({
      where: { id: projectSkill.id },
      select: { validatedByTeacher: true, validatorId: true },
    });

    expect(validatedSkill).toMatchObject({ validatedByTeacher: true, validatorId: teacherA.id });

    const notified = await prisma.notification.findMany({
      where: { type: "PROJECT_APPROVED" },
      select: { userId: true },
    });

    expect(new Set(notified.map((notification) => notification.userId))).toEqual(
      new Set([owner.id, teammate.id]),
    );
    expect(notified).toHaveLength(2);
    expect(notified.some((notification) => notification.userId === outsider.id)).toBe(false);

    const audit = await prisma.auditLog.findMany({ where: { action: "project.approved" } });
    expect(audit).toHaveLength(1);
    expect(audit[0]!.actorId).toBe(teacherA.id);
  });

  it("professor integrante da equipe não aprova o próprio projeto", async () => {
    const project = await createProjectRow({
      schoolId: schoolA.id,
      owner,
      slug: "projeto-com-professor-na-equipe",
      memberIds: [teacherA.id],
      withEvidence: true,
    });
    await submitProject(formData({ projectId: project.id }));

    await expect(
      approveProject(teacherA, {
        projectId: project.id,
        strengths: "",
        improvements: "",
        generalComment: "",
        validatedSkillIds: [],
      }),
    ).rejects.toBeInstanceOf(ReviewError);

    const updated = await prisma.project.findUnique({
      where: { id: project.id },
      select: { status: true },
    });
    expect(updated!.status).toBe("SUBMITTED");
  });

  it("professor de outra escola não aprova nem pede alterações", async () => {
    const project = await draftProject();
    await submitProject(formData({ projectId: project.id }));

    await expect(
      approveProject(teacherB, {
        projectId: project.id,
        strengths: "",
        improvements: "",
        generalComment: "",
        validatedSkillIds: [],
      }),
    ).rejects.toBeInstanceOf(ReviewError);

    await expect(
      requestChanges(teacherB, {
        projectId: project.id,
        comment: "Adicione uma explicação melhor sobre sua participação individual.",
        strengths: "",
        improvements: "",
      }),
    ).rejects.toBeInstanceOf(ReviewError);
  });

  it("solicitar alterações guarda o comentário e devolve o projeto para a equipe", async () => {
    const project = await draftProject();
    await submitProject(formData({ projectId: project.id }));

    await requestChanges(teacherA, {
      projectId: project.id,
      comment: "Adicione uma explicação melhor sobre sua participação individual.",
      strengths: "",
      improvements: "",
    });

    const updated = await prisma.project.findUnique({
      where: { id: project.id },
      select: { status: true, validations: { select: { action: true, comment: true } } },
    });

    expect(updated!.status).toBe("CHANGES_REQUESTED");
    expect(updated!.validations[0]).toMatchObject({
      action: "CHANGES_REQUESTED",
      comment: "Adicione uma explicação melhor sobre sua participação individual.",
    });
  });

  it("badge não atravessa a fronteira da escola", async () => {
    const badgeA = await prisma.badge.create({
      data: {
        name: "Projeto Destaque",
        slug: "projeto-destaque",
        icon: "trophy",
        type: "HIGHLIGHT",
        schoolId: schoolA.id,
      },
    });

    await expect(
      grantBadge(teacherB, { userId: owner.id, badgeId: badgeA.id, projectId: "", eventId: "", note: "" }),
    ).rejects.toBeInstanceOf(BadgeError);

    expect(await prisma.userBadge.count()).toBe(0);

    await grantBadge(teacherA, {
      userId: owner.id,
      badgeId: badgeA.id,
      projectId: "",
      eventId: "",
      note: "",
    });

    expect(await prisma.userBadge.count()).toBe(1);
    expect(await prisma.notification.count({ where: { userId: owner.id, type: "BADGE_GRANTED" } })).toBe(1);
  });
});
