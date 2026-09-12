import { describe, expect, it } from "vitest";
import { generateUniqueSlug, slugify } from "@/lib/slug";

describe("slugify", () => {
  it("remove acentos e normaliza espaços", () => {
    expect(slugify("Sistema de Monitoramento de Enchentes")).toBe(
      "sistema-de-monitoramento-de-enchentes",
    );
    expect(slugify("Análise de Dados")).toBe("analise-de-dados");
    expect(slugify("Eletrônica & Robótica")).toBe("eletronica-robotica");
  });

  it("remove símbolos e hifens nas pontas", () => {
    expect(slugify("  ---Horta Inteligente!!!  ")).toBe("horta-inteligente");
    expect(slugify("3º A - Desenvolvimento de Sistemas")).toBe("3-a-desenvolvimento-de-sistemas");
  });

  it("trunca no tamanho máximo sem deixar hífen no fim", () => {
    const slug = slugify("a".repeat(120));
    expect(slug).toHaveLength(80);

    const truncated = slugify("projeto de-- monitoramento", 11);
    expect(truncated).toBe("projeto-de");
    expect(truncated.endsWith("-")).toBe(false);
  });

  it("usa fallback quando não sobra nada", () => {
    expect(slugify("#$%&")).toBe("item");
    expect(slugify("")).toBe("item");
  });
});

describe("generateUniqueSlug", () => {
  it("mantém o slug base quando está livre", async () => {
    const slug = await generateUniqueSlug("Horta Inteligente", async () => false);
    expect(slug).toBe("horta-inteligente");
  });

  it("adiciona sufixo -2 na primeira colisão", async () => {
    const taken = new Set(["horta-inteligente"]);
    const slug = await generateUniqueSlug("Horta Inteligente", async (candidate) =>
      taken.has(candidate),
    );
    expect(slug).toBe("horta-inteligente-2");
  });

  it("avança para -3 quando o -2 também existe", async () => {
    const taken = new Set(["horta-inteligente", "horta-inteligente-2"]);
    const slug = await generateUniqueSlug("Horta Inteligente", async (candidate) =>
      taken.has(candidate),
    );
    expect(slug).toBe("horta-inteligente-3");
  });

  it("consulta a função de existência para cada candidato", async () => {
    const checked: string[] = [];
    await generateUniqueSlug("Projeto", async (candidate) => {
      checked.push(candidate);
      return checked.length < 3;
    });
    expect(checked).toEqual(["projeto", "projeto-2", "projeto-3"]);
  });

  it("respeita o tamanho máximo mesmo com sufixo", async () => {
    const slug = await generateUniqueSlug("a".repeat(40), async (candidate) => candidate.length === 20, 20);
    expect(slug.length).toBeLessThanOrEqual(20);
  });
});
