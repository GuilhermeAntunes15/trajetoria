import { describe, expect, it } from "vitest";
import { evidenceCreateSchema, isFileEvidence } from "@/lib/validation/evidence.schema";
import { projectCreateSchema, externalUrlSchema, mediaUrlSchema } from "@/lib/validation/project.schema";
import { requestChangesSchema } from "@/lib/validation/validation.schema";
import { firstName, formatDateRange, initials, pluralize } from "@/lib/format";

const validProject = {
  title: "Sistema de Monitoramento de Enchentes",
  summary: "Sensores no córrego e painel de alerta para os moradores.",
  description: "",
  problem: "O córrego transborda sem aviso.",
  solution: "Sensores ultrassônicos e painel web.",
  learnings: "Calibrar sensor é mais difícil do que parece.",
  area: "Desenvolvimento de Sistemas",
  projectDate: "2026-03-22",
  eventId: "",
  advisorId: "",
  parentProjectId: "",
  coverImageUrl: "",
  visibilityScope: "SCHOOL",
  makePublic: false,
  allowFork: true,
  ownerRole: "Backend",
  ownerContribution: "Construí a API.",
};

describe("projectCreateSchema", () => {
  it("aceita um projeto completo", () => {
    expect(projectCreateSchema.safeParse(validProject).success).toBe(true);
  });

  it("exige título e resumo mínimos", () => {
    expect(projectCreateSchema.safeParse({ ...validProject, title: "ab" }).success).toBe(false);
    expect(projectCreateSchema.safeParse({ ...validProject, summary: "curto" }).success).toBe(false);
  });

  it("limita o resumo a 280 caracteres", () => {
    expect(
      projectCreateSchema.safeParse({ ...validProject, summary: "a".repeat(281) }).success,
    ).toBe(false);
  });

  it("exige data no formato ISO", () => {
    expect(projectCreateSchema.safeParse({ ...validProject, projectDate: "22/03/2026" }).success).toBe(
      false,
    );
    expect(projectCreateSchema.safeParse({ ...validProject, projectDate: "" }).success).toBe(false);

    const parsed = projectCreateSchema.safeParse({ ...validProject, projectDate: "2026-03-22" });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const date = new Date(`${parsed.data.projectDate}T12:00:00.000Z`);
      expect(date.getUTCFullYear()).toBe(2026);
    }
  });

  it("aceita apenas áreas da lista fechada", () => {
    expect(projectCreateSchema.safeParse({ ...validProject, area: "" }).success).toBe(true);
    expect(projectCreateSchema.safeParse({ ...validProject, area: "Astrologia" }).success).toBe(
      false,
    );
  });

  it("aceita apenas escopo interno no formulário — publicação é opt-in separado", () => {
    expect(
      projectCreateSchema.safeParse({ ...validProject, visibilityScope: "PUBLIC" }).success,
    ).toBe(false);
    expect(
      projectCreateSchema.safeParse({ ...validProject, visibilityScope: "PRIVATE", makePublic: true })
        .success,
    ).toBe(true);
  });

  it("exige o papel de quem cria o projeto", () => {
    expect(projectCreateSchema.safeParse({ ...validProject, ownerRole: "" }).success).toBe(false);
  });
});

describe("endereços aceitos", () => {
  it("aceita apenas http e https em links externos", () => {
    expect(externalUrlSchema.safeParse("https://github.com/ee-horizonte/monitor").success).toBe(true);
    expect(externalUrlSchema.safeParse("javascript:alert(1)").success).toBe(false);
    expect(externalUrlSchema.safeParse("ftp://arquivo.zip").success).toBe(false);
    expect(externalUrlSchema.safeParse("github.com/sem-esquema").success).toBe(false);
  });

  it("aceita arquivos servidos pela própria aplicação", () => {
    expect(mediaUrlSchema.safeParse("/api/files/image/2026/03/a.png").success).toBe(true);
    expect(mediaUrlSchema.safeParse("").success).toBe(true);
    expect(mediaUrlSchema.safeParse("etc/passwd").success).toBe(false);
  });

  it("aceita capas estáticas do seed", () => {
    expect(mediaUrlSchema.safeParse("/seed/evento-feira.svg").success).toBe(true);
    expect(mediaUrlSchema.safeParse("/seed/projeto-enchentes.svg").success).toBe(true);
  });

  it("rejeita caminhos protocol-relative e com travessia", () => {
    expect(mediaUrlSchema.safeParse("//evil.com/x.png").success).toBe(false);
    expect(mediaUrlSchema.safeParse("/../etc").success).toBe(false);
    expect(mediaUrlSchema.safeParse("/seed/../../etc/passwd").success).toBe(false);
  });

  it("rejeita esquemas perigosos e caracteres inválidos", () => {
    expect(mediaUrlSchema.safeParse("javascript:alert(1)").success).toBe(false);
    expect(mediaUrlSchema.safeParse("/seed/arquivo com espaco.svg").success).toBe(false);
    expect(mediaUrlSchema.safeParse("/seed/a.svg?x=1").success).toBe(false);
  });
});

describe("evidências", () => {
  const base = {
    projectId: "project-1",
    title: "Repositório do projeto",
    description: "",
    url: "",
    fileUrl: "",
    fileName: "",
    fileSize: null,
    mimeType: "",
  };

  it("separa evidência de arquivo de evidência de link", () => {
    expect(isFileEvidence("IMAGE")).toBe(true);
    expect(isFileEvidence("DOCUMENT")).toBe(true);
    expect(isFileEvidence("PRESENTATION")).toBe(true);
    expect(isFileEvidence("GITHUB")).toBe(false);
    expect(isFileEvidence("VIDEO")).toBe(false);
  });

  it("exige endereço em evidência de link", () => {
    expect(evidenceCreateSchema.safeParse({ ...base, type: "GITHUB" }).success).toBe(false);
    expect(
      evidenceCreateSchema.safeParse({
        ...base,
        type: "GITHUB",
        url: "https://github.com/ee-horizonte/monitor",
      }).success,
    ).toBe(true);
  });

  it("exige arquivo em evidência de documento", () => {
    expect(evidenceCreateSchema.safeParse({ ...base, type: "DOCUMENT" }).success).toBe(false);
    expect(
      evidenceCreateSchema.safeParse({
        ...base,
        type: "DOCUMENT",
        fileUrl: "/api/files/document/2026/03/a.pdf",
      }).success,
    ).toBe(true);
  });
});

describe("pedido de alterações", () => {
  it("exige justificativa com pelo menos 10 caracteres", () => {
    expect(
      requestChangesSchema.safeParse({ projectId: "p1", comment: "ajuste", strengths: "", improvements: "" })
        .success,
    ).toBe(false);

    expect(
      requestChangesSchema.safeParse({
        projectId: "p1",
        comment: "Adicione uma explicação melhor sobre sua participação individual.",
        strengths: "",
        improvements: "",
      }).success,
    ).toBe(true);
  });
});

describe("formatação de apoio", () => {
  it("monta iniciais e primeiro nome", () => {
    expect(initials("João Silva")).toBe("JS");
    expect(initials("Ana")).toBe("A");
    expect(initials("   ")).toBe("?");
    expect(firstName("Maria Santos")).toBe("Maria");
  });

  it("formata intervalo de datas de evento", () => {
    expect(formatDateRange("2026-03-20T12:00:00.000Z", "2026-03-22T12:00:00.000Z")).toBe(
      "20/03/2026 a 22/03/2026",
    );
    expect(formatDateRange("2026-03-20T12:00:00.000Z", "2026-03-20T18:00:00.000Z")).toBe(
      "20/03/2026",
    );
    expect(formatDateRange("2026-03-20T12:00:00.000Z", null)).toBe("20/03/2026");
  });

  it("pluraliza contagens", () => {
    expect(pluralize(1, "integrante", "integrantes")).toBe("integrante");
    expect(pluralize(3, "integrante", "integrantes")).toBe("integrantes");
  });
});
