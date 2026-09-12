import { describe, expect, it } from "vitest";
import { likePattern } from "@/lib/search-text";

describe("likePattern", () => {
  it("envolve o termo com curingas", () => {
    expect(likePattern("estacao")).toBe("%estacao%");
  });

  it("ignora espacos nas bordas", () => {
    expect(likePattern("  ciencias  ")).toBe("%ciencias%");
  });

  it("mantem acentos do termo", () => {
    expect(likePattern("Estação")).toBe("%Estação%");
  });

  it("escapa curingas do LIKE", () => {
    expect(likePattern("100%_a")).toBe("%100\\%\\_a%");
  });

  it("escapa a barra invertida", () => {
    expect(likePattern("a\\b")).toBe("%a\\\\b%");
  });
});
