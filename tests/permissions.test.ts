import { describe, expect, it } from "vitest";
import type { ProjectStatus, Visibility } from "@prisma/client";
import {
  canArchiveProject,
  canCreateProject,
  canDeleteProject,
  canEditProjectContent,
  canForkProject,
  canGrantBadge,
  canManageSchoolEntity,
  canModerateProject,
  canPublishProject,
  canReviewProject,
  canSubmitProject,
  canValidateSkill,
  canViewProfile,
  canViewProject,
  isProjectComplete,
  type ProjectCtx,
  type SubmitCtx,
  type Viewer,
} from "@/lib/permissions";

const SCHOOL_A = "school-a";
const SCHOOL_B = "school-b";

type Account = NonNullable<Viewer>;

const anonymous: Viewer = null;
const owner: Account = { id: "owner", role: "STUDENT", schoolId: SCHOOL_A };
const teammate: Account = { id: "teammate", role: "STUDENT", schoolId: SCHOOL_A };
const classmate: Account = { id: "classmate", role: "STUDENT", schoolId: SCHOOL_A };
const outsideStudent: Account = { id: "outside-student", role: "STUDENT", schoolId: SCHOOL_B };
const teacher: Account = { id: "teacher", role: "TEACHER", schoolId: SCHOOL_A };
const admin: Account = { id: "admin", role: "ADMIN", schoolId: SCHOOL_A };
const outsideTeacher: Account = { id: "outside-teacher", role: "TEACHER", schoolId: SCHOOL_B };
const outsideAdmin: Account = { id: "outside-admin", role: "ADMIN", schoolId: SCHOOL_B };

function project(overrides: Partial<ProjectCtx> = {}): ProjectCtx {
  return {
    id: "project-1",
    schoolId: SCHOOL_A,
    createdById: owner.id,
    advisorId: null,
    status: "APPROVED",
    visibility: "SCHOOL",
    allowFork: true,
    memberIds: [owner.id, teammate.id],
    ...overrides,
  };
}

describe("canViewProject", () => {
  const columns: [string, Viewer][] = [
    ["anônimo", anonymous],
    ["estudante da escola", classmate],
    ["estudante de outra escola", outsideStudent],
    ["membro", teammate],
    ["professor da escola", teacher],
    ["professor de outra escola", outsideTeacher],
  ];

  const matrix: { situation: string; ctx: ProjectCtx; expected: boolean[] }[] = [
    {
      situation: "PUBLIC + APPROVED",
      ctx: project({ visibility: "PUBLIC", status: "APPROVED" }),
      expected: [true, true, true, true, true, true],
    },
    {
      situation: "SCHOOL + APPROVED",
      ctx: project({ visibility: "SCHOOL", status: "APPROVED" }),
      expected: [false, true, false, true, true, false],
    },
    {
      situation: "PRIVATE + APPROVED",
      ctx: project({ visibility: "PRIVATE", status: "APPROVED" }),
      expected: [false, false, false, true, true, false],
    },
    {
      situation: "PUBLIC + SUBMITTED",
      ctx: project({ visibility: "PUBLIC", status: "SUBMITTED" }),
      expected: [false, false, false, true, true, false],
    },
    {
      situation: "PUBLIC + ARCHIVED",
      ctx: project({ visibility: "PUBLIC", status: "ARCHIVED" }),
      expected: [false, false, false, true, true, false],
    },
  ];

  for (const line of matrix) {
    for (const [index, column] of columns.entries()) {
      it(`${line.situation} — ${column[0]} → ${line.expected[index]}`, () => {
        expect(canViewProject(column[1], line.ctx)).toBe(line.expected[index]);
      });
    }
  }

  it("criador sempre enxerga o próprio rascunho", () => {
    expect(canViewProject(owner, project({ status: "DRAFT", visibility: "PRIVATE" }))).toBe(true);
  });

  it("admin de outra escola não enxerga projeto interno", () => {
    expect(canViewProject(outsideAdmin, project({ visibility: "SCHOOL" }))).toBe(false);
    expect(canViewProject(outsideAdmin, project({ visibility: "PRIVATE" }))).toBe(false);
  });

  it("falha fechada quando o schoolId do viewer está vazio", () => {
    const brokenViewer: Account = { id: "ghost", role: "ADMIN", schoolId: "" };
    expect(canViewProject(brokenViewer, project({ visibility: "SCHOOL" }))).toBe(false);
    expect(canViewProject(brokenViewer, project({ schoolId: "" }))).toBe(false);
  });
});

describe("canEditProjectContent", () => {
  const editable: ProjectStatus[] = ["DRAFT", "CHANGES_REQUESTED"];
  const blocked: ProjectStatus[] = ["SUBMITTED", "APPROVED", "ARCHIVED"];

  for (const status of editable) {
    it(`membro edita em ${status}`, () => {
      expect(canEditProjectContent(teammate, project({ status }))).toBe(true);
    });
  }

  for (const status of blocked) {
    it(`membro não edita em ${status}`, () => {
      expect(canEditProjectContent(teammate, project({ status }))).toBe(false);
    });
  }

  it("professor não edita conteúdo do projeto do aluno", () => {
    expect(canEditProjectContent(teacher, project({ status: "DRAFT" }))).toBe(false);
    expect(canEditProjectContent(admin, project({ status: "CHANGES_REQUESTED" }))).toBe(false);
  });

  it("anônimo nunca edita", () => {
    expect(canEditProjectContent(anonymous, project({ status: "DRAFT" }))).toBe(false);
  });
});

describe("canSubmitProject", () => {
  function submitCtx(overrides: Partial<SubmitCtx> = {}): SubmitCtx {
    return {
      id: "project-1",
      schoolId: SCHOOL_A,
      createdById: owner.id,
      memberIds: [owner.id, teammate.id],
      status: "DRAFT",
      title: "Sistema de Monitoramento de Enchentes",
      summary: "Sensores e painel de alerta.",
      problem: "O córrego transborda sem aviso.",
      solution: "Sensor ultrassônico com painel.",
      evidenceCount: 1,
      ...overrides,
    };
  }

  it("membro envia rascunho completo", () => {
    expect(canSubmitProject(owner, submitCtx())).toBe(true);
  });

  it("membro reenvia depois de ajustes solicitados", () => {
    expect(canSubmitProject(owner, submitCtx({ status: "CHANGES_REQUESTED" }))).toBe(true);
  });

  it("não envia sem evidência", () => {
    expect(canSubmitProject(owner, submitCtx({ evidenceCount: 0 }))).toBe(false);
  });

  it("não envia sem problema ou solução", () => {
    expect(canSubmitProject(owner, submitCtx({ problem: null }))).toBe(false);
    expect(canSubmitProject(owner, submitCtx({ solution: "   " }))).toBe(false);
  });

  it("não envia projeto já submetido ou aprovado", () => {
    expect(canSubmitProject(owner, submitCtx({ status: "SUBMITTED" }))).toBe(false);
    expect(canSubmitProject(owner, submitCtx({ status: "APPROVED" }))).toBe(false);
  });

  it("quem não é membro não envia", () => {
    expect(canSubmitProject(classmate, submitCtx())).toBe(false);
    expect(canSubmitProject(teacher, submitCtx())).toBe(false);
  });

  it("isProjectComplete cobre campos vazios", () => {
    expect(isProjectComplete(submitCtx())).toBe(true);
    expect(isProjectComplete(submitCtx({ summary: "" }))).toBe(false);
  });
});

describe("canReviewProject", () => {
  it("professor da escola revisa projeto submetido", () => {
    expect(canReviewProject(teacher, project({ status: "SUBMITTED" }))).toBe(true);
  });

  it("professor orientador pode revisar", () => {
    expect(
      canReviewProject(teacher, project({ status: "SUBMITTED", advisorId: teacher.id })),
    ).toBe(true);
  });

  it("professor autor do projeto não revisa", () => {
    expect(
      canReviewProject(teacher, project({ status: "SUBMITTED", createdById: teacher.id })),
    ).toBe(false);
  });

  it("professor membro da equipe não revisa", () => {
    expect(
      canReviewProject(
        teacher,
        project({ status: "SUBMITTED", memberIds: [owner.id, teacher.id] }),
      ),
    ).toBe(false);
  });

  it("estudante nunca revisa", () => {
    expect(canReviewProject(classmate, project({ status: "SUBMITTED" }))).toBe(false);
    expect(canReviewProject(owner, project({ status: "SUBMITTED" }))).toBe(false);
  });

  it("admin de outra escola não revisa", () => {
    expect(canReviewProject(outsideAdmin, project({ status: "SUBMITTED" }))).toBe(false);
  });

  it("rascunho não é revisável", () => {
    expect(canReviewProject(teacher, project({ status: "DRAFT" }))).toBe(false);
    expect(canReviewProject(teacher, project({ status: "ARCHIVED" }))).toBe(false);
  });

  it("canValidateSkill segue a mesma regra", () => {
    expect(canValidateSkill(teacher, project({ status: "APPROVED" }))).toBe(true);
    expect(canValidateSkill(classmate, project({ status: "APPROVED" }))).toBe(false);
    expect(canValidateSkill(outsideTeacher, project({ status: "APPROVED" }))).toBe(false);
  });
});

describe("canDeleteProject", () => {
  it("criador exclui o próprio rascunho", () => {
    expect(canDeleteProject(owner, project({ status: "DRAFT" }))).toBe(true);
  });

  it("criador não exclui projeto aprovado", () => {
    expect(canDeleteProject(owner, project({ status: "APPROVED" }))).toBe(false);
  });

  it("admin não exclui projeto aprovado", () => {
    expect(canDeleteProject(admin, { ...project({ status: "APPROVED" }), otherMemberCount: 0 })).toBe(
      false,
    );
  });

  it("admin exclui rascunho sem outros integrantes", () => {
    expect(canDeleteProject(admin, { ...project({ status: "DRAFT" }), otherMemberCount: 0 })).toBe(
      true,
    );
  });

  it("admin não exclui rascunho com outros integrantes", () => {
    expect(canDeleteProject(admin, { ...project({ status: "DRAFT" }), otherMemberCount: 1 })).toBe(
      false,
    );
  });

  it("admin de outra escola não exclui", () => {
    expect(
      canDeleteProject(outsideAdmin, { ...project({ status: "DRAFT" }), otherMemberCount: 0 }),
    ).toBe(false);
  });
});

describe("canArchiveProject e canModerateProject", () => {
  it("apenas admin da escola arquiva", () => {
    expect(canArchiveProject(admin, project())).toBe(true);
    expect(canArchiveProject(teacher, project())).toBe(false);
    expect(canArchiveProject(owner, project())).toBe(false);
    expect(canArchiveProject(outsideAdmin, project())).toBe(false);
  });

  it("moderação é da equipe da escola", () => {
    expect(canModerateProject(teacher, project())).toBe(true);
    expect(canModerateProject(admin, project())).toBe(true);
    expect(canModerateProject(classmate, project())).toBe(false);
    expect(canModerateProject(outsideTeacher, project())).toBe(false);
    expect(canModerateProject(anonymous, project())).toBe(false);
  });

  it("publicar é decisão dos membros", () => {
    expect(canPublishProject(owner, project())).toBe(true);
    expect(canPublishProject(teacher, project())).toBe(false);
  });
});

describe("canForkProject", () => {
  it("estudante continua projeto aprovado e liberado", () => {
    expect(canForkProject(classmate, project({ visibility: "SCHOOL", allowFork: true }))).toBe(true);
  });

  it("não continua projeto com fork bloqueado", () => {
    expect(canForkProject(classmate, project({ allowFork: false }))).toBe(false);
  });

  it("não continua projeto que ainda não foi validado", () => {
    expect(canForkProject(classmate, project({ status: "SUBMITTED" }))).toBe(false);
  });

  it("anônimo não continua projeto", () => {
    expect(canForkProject(anonymous, project({ visibility: "PUBLIC" }))).toBe(false);
  });

  it("estudante de outra escola só continua projeto público", () => {
    expect(canForkProject(outsideStudent, project({ visibility: "SCHOOL" }))).toBe(false);
    expect(canForkProject(outsideStudent, project({ visibility: "PUBLIC" }))).toBe(true);
  });
});

describe("canViewProfile", () => {
  function profile(visibility: Visibility, schoolId = SCHOOL_A) {
    return { id: "student", schoolId, profileVisibility: visibility };
  }

  it("dono sempre vê o próprio perfil", () => {
    const self: Account = { id: "student", role: "STUDENT", schoolId: SCHOOL_A };
    expect(canViewProfile(self, profile("PRIVATE"))).toBe(true);
  });

  it("perfil público é visível para todos", () => {
    expect(canViewProfile(anonymous, profile("PUBLIC"))).toBe(true);
    expect(canViewProfile(outsideStudent, profile("PUBLIC"))).toBe(true);
  });

  it("perfil da escola é visível para colegas", () => {
    expect(canViewProfile(classmate, profile("SCHOOL"))).toBe(true);
    expect(canViewProfile(outsideStudent, profile("SCHOOL"))).toBe(false);
    expect(canViewProfile(anonymous, profile("SCHOOL"))).toBe(false);
  });

  it("perfil privado só para a equipe da escola", () => {
    expect(canViewProfile(teacher, profile("PRIVATE"))).toBe(true);
    expect(canViewProfile(admin, profile("PRIVATE"))).toBe(true);
    expect(canViewProfile(classmate, profile("PRIVATE"))).toBe(false);
    expect(canViewProfile(outsideTeacher, profile("PRIVATE"))).toBe(false);
  });
});

describe("gestão da escola", () => {
  it("apenas estudantes criam projetos", () => {
    expect(canCreateProject(owner)).toBe(true);
    expect(canCreateProject(teacher)).toBe(false);
    expect(canCreateProject(admin)).toBe(false);
    expect(canCreateProject(anonymous)).toBe(false);
  });

  it("admin administra apenas a própria escola", () => {
    expect(canManageSchoolEntity(admin, SCHOOL_A)).toBe(true);
    expect(canManageSchoolEntity(admin, SCHOOL_B)).toBe(false);
    expect(canManageSchoolEntity(teacher, SCHOOL_A)).toBe(false);
  });

  it("badge só para estudante da mesma escola", () => {
    expect(canGrantBadge(teacher, SCHOOL_A)).toBe(true);
    expect(canGrantBadge(teacher, SCHOOL_B)).toBe(false);
    expect(canGrantBadge(classmate, SCHOOL_A)).toBe(false);
  });

  it("falha fechada com schoolId vazio", () => {
    const brokenAdmin: Account = { id: "admin", role: "ADMIN", schoolId: "" };
    expect(canManageSchoolEntity(brokenAdmin, "")).toBe(false);
    expect(canGrantBadge(brokenAdmin, SCHOOL_A)).toBe(false);
  });
});
