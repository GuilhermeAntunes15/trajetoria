import { describe, expect, it } from "vitest";
import { safeRedirect } from "@/lib/redirect";

describe("safeRedirect", () => {
  it("aceita caminho interno", () => {
    expect(safeRedirect("/dashboard")).toBe("/dashboard");
    expect(safeRedirect("/projects/monitor?saved=1")).toBe("/projects/monitor?saved=1");
    expect(safeRedirect("/")).toBe("/");
  });

  it("rejeita URL absoluta", () => {
    expect(safeRedirect("https://evil.com")).toBe("/dashboard");
    expect(safeRedirect("http://evil.com/login")).toBe("/dashboard");
    expect(safeRedirect("//evil.com")).toBe("/dashboard");
  });

  it("rejeita barra invertida usada para escapar do host", () => {
    expect(safeRedirect("/\\evil.com")).toBe("/dashboard");
    expect(safeRedirect("\\\\evil.com")).toBe("/dashboard");
  });

  it("rejeita esquemas perigosos", () => {
    expect(safeRedirect("javascript:alert(1)")).toBe("/dashboard");
    expect(safeRedirect("data:text/html,<script>")).toBe("/dashboard");
  });

  it("rejeita valores que não são string", () => {
    expect(safeRedirect(undefined)).toBe("/dashboard");
    expect(safeRedirect(null)).toBe("/dashboard");
    expect(safeRedirect(42)).toBe("/dashboard");
    expect(safeRedirect(["/dashboard"])).toBe("/dashboard");
  });

  it("respeita o fallback informado", () => {
    expect(safeRedirect("https://evil.com", "/login")).toBe("/login");
  });

  it("rejeita caminho relativo sem barra inicial", () => {
    expect(safeRedirect("dashboard")).toBe("/dashboard");
    expect(safeRedirect("")).toBe("/dashboard");
  });
});
