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
import { createProject } from "@/actions/project.actions";
import { addMember } from "@/actions/member.actions";
import { listVisibleProjects } from "@/server/services/project.service";
import {
  catchRedirect,
  createEvent,
  createProjectRow,
  createSchool,
  createUser,
  formData,
  resetDatabase,
} from "./factory";

const enabled = Boolean(process.env.TEST_DATABASE_URL);

const baseInput = {
  title: "Sistema de Monitoramento de Enchentes",
  summary: "Sensores no córrego e painel de alerta para os moradores.",
  description: "",
  problem: "O córrego transborda sem aviso.",
  solution: "Sensores ultrassônicos com painel web.",
  learnings: "",
  area: "Desenvolvimento de Sistemas",
  projectDate: "2026-03-22",
  eventId: "",
  advisorId: "",
  parentProjectId: "",
  coverImageUrl: "",
  visibilityScope: "SCHOOL" as const,
  makePublic: false,
  allowFork: true,
  ownerRole: "Backend",
  ownerContribution: "Construí a API.",
};

describe.skipIf(!enabled)("projetos — criação e isolamento por escola", () => {
  let schoolA: { id: string };
  let schoolB: { id: string };
  let studentA: Viewer;
  let studentA2: Viewer;
  let studentB: Viewer;
  let teacherA: Viewer;
  let eventA: { id: string };
  let eventB: { id: string };

  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await resetDatabase();

    schoolA = await createSchool("escola-a", "E.E. Horizonte");
    schoolB = await createSchool("escola-b", "Colégio Aurora");

    studentA = await createUser({ schoolId: schoolA.id, role: "STUDENT", username: "joao.silva" });
    studentA2 = await createUser({ schoolId: schoolA.id, role: "STUDENT", username: "maria.santos" });
    studentB = await createUser({ schoolId: schoolB.id, role: "STUDENT", username: "pedro.lima" });
    teacherA = await createUser({ schoolId: schoolA.id, role: "TEACHER", username: "carlos.menezes" });

    eventA = await createEvent(schoolA.id, teacherA.id, "hackathon-a");
    eventB = await createEvent(schoolB.id, studentB.id, "hackathon-b");

    session.viewer = studentA;
  });

  it("cria projeto com o autor como integrante dono e vincula o evento", async () => {
    const redirectUrl = await catchRedirect(
      createProject({ ...baseInput, eventId: eventA.id }),
    );

    expect(redirectUrl).toBe("/projects/sistema-de-monitoramento-de-enchentes?saved=1");

    const project = await prisma.project.findUnique({
      where: { slug: "sistema-de-monitoramento-de-enchentes" },
      select: {
        schoolId: true,
        status: true,
        visibility: true,
        year: true,
        createdById: true,
        members: { select: { userId: true, isOwner: true, role: true } },
        eventEntries: { select: { eventId: true } },
      },
    });

    expect(project).not.toBeNull();
    expect(project!.schoolId).toBe(schoolA.id);
    expect(project!.status).toBe("DRAFT");
    expect(project!.visibility).toBe("SCHOOL");
    expect(project!.year).toBe(2026);
    expect(project!.createdById).toBe(studentA.id);
    expect(project!.members).toHaveLength(1);
    expect(project!.members[0]).toMatchObject({ userId: studentA.id, isOwner: true, role: "Backend" });
    expect(project!.eventEntries.map((entry) => entry.eventId)).toEqual([eventA.id]);
  });

  it("recusa evento de outra escola", async () => {
    const result = await createProject({ ...baseInput, eventId: eventB.id });

    expect(result).toEqual({ error: "Evento inválido para a sua escola." });
    expect(await prisma.project.count()).toBe(0);
  });

  it("gera slug único quando o título se repete", async () => {
    await catchRedirect(createProject(baseInput));
    await catchRedirect(createProject(baseInput));
    await catchRedirect(createProject(baseInput));

    const slugs = await prisma.project.findMany({ select: { slug: true }, orderBy: { slug: "asc" } });

    expect(slugs.map((project) => project.slug)).toEqual([
      "sistema-de-monitoramento-de-enchentes",
      "sistema-de-monitoramento-de-enchentes-2",
      "sistema-de-monitoramento-de-enchentes-3",
    ]);
  });

  it("professor não cria projeto", async () => {
    session.viewer = teacherA;
    const result = await createProject(baseInput);

    expect(result).toEqual({ error: "Apenas estudantes podem criar projetos." });
  });

  it("listagem não devolve projeto de outra escola", async () => {
    await createProjectRow({
      schoolId: schoolA.id,
      owner: studentA,
      slug: "projeto-da-escola-a",
      status: "APPROVED",
      visibility: "SCHOOL",
    });

    const fromSchoolA = await listVisibleProjects({
      id: studentA.id,
      role: "STUDENT",
      schoolId: schoolA.id,
    });
    const fromSchoolB = await listVisibleProjects({
      id: studentB.id,
      role: "STUDENT",
      schoolId: schoolB.id,
    });
    const fromTeacherB = await listVisibleProjects({
      id: studentB.id,
      role: "TEACHER",
      schoolId: schoolB.id,
    });
    const anonymous = await listVisibleProjects(null);

    expect(fromSchoolA.map((project) => project.slug)).toEqual(["projeto-da-escola-a"]);
    expect(fromSchoolB).toHaveLength(0);
    expect(fromTeacherB).toHaveLength(0);
    expect(anonymous).toHaveLength(0);
  });

  it("listagem pública mostra apenas projeto público e aprovado", async () => {
    await createProjectRow({
      schoolId: schoolA.id,
      owner: studentA,
      slug: "projeto-publico",
      status: "APPROVED",
      visibility: "PUBLIC",
    });
    await createProjectRow({
      schoolId: schoolA.id,
      owner: studentA,
      slug: "projeto-publico-em-analise",
      status: "SUBMITTED",
      visibility: "PUBLIC",
    });

    const anonymous = await listVisibleProjects(null);
    const otherSchool = await listVisibleProjects({
      id: studentB.id,
      role: "STUDENT",
      schoolId: schoolB.id,
    });

    expect(anonymous.map((project) => project.slug)).toEqual(["projeto-publico"]);
    expect(otherSchool.map((project) => project.slug)).toEqual(["projeto-publico"]);
  });

  it("não adiciona integrante de outra escola", async () => {
    const project = await createProjectRow({
      schoolId: schoolA.id,
      owner: studentA,
      slug: "projeto-em-edicao",
    });

    const invalid = await addMember(
      {},
      formData({ projectId: project.id, userId: studentB.id, role: "Dados", contribution: "" }),
    );

    expect(invalid).toEqual({ error: "Estudante inválido para a sua escola." });
    expect(await prisma.projectMember.count({ where: { projectId: project.id } })).toBe(1);

    const valid = await addMember(
      {},
      formData({ projectId: project.id, userId: studentA2.id, role: "UX/UI", contribution: "" }),
    );

    expect(valid).toEqual({ success: "Integrante adicionado." });
    expect(await prisma.projectMember.count({ where: { projectId: project.id } })).toBe(2);
    expect(
      await prisma.notification.count({ where: { userId: studentA2.id, type: "MEMBER_ADDED" } }),
    ).toBe(1);
  });
});
