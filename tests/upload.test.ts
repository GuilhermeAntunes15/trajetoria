import { describe, expect, it } from "vitest";
import {
  ALLOWED_MIME_TYPES,
  buildStorageKey,
  checkUploadMeta,
  contentTypeForKey,
  hasValidMagicBytes,
  isUploadKind,
  MAX_DOCUMENT_BYTES,
  MAX_IMAGE_BYTES,
  sanitizeFileName,
} from "@/lib/upload";
import { isSafeStorageKey, resolveLocalPath } from "@/lib/storage/local";

const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const JPEG_HEADER = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
const PDF_HEADER = Buffer.from("%PDF-1.7\n");

describe("allowlist de tipos", () => {
  it("aceita apenas os MIME types previstos", () => {
    expect(Object.keys(ALLOWED_MIME_TYPES).sort()).toEqual([
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);
  });

  it("recusa SVG e HTML mesmo com o kind correto", () => {
    expect(checkUploadMeta("image", "image/svg+xml", 1024).ok).toBe(false);
    expect(checkUploadMeta("document", "text/html", 1024).ok).toBe(false);
  });

  it("recusa MIME válido no kind errado", () => {
    expect(checkUploadMeta("document", "image/png", 1024).ok).toBe(false);
    expect(checkUploadMeta("image", "application/pdf", 1024).ok).toBe(false);
  });

  it("valida o kind recebido do formulário", () => {
    expect(isUploadKind("image")).toBe(true);
    expect(isUploadKind("document")).toBe(true);
    expect(isUploadKind("video")).toBe(false);
    expect(isUploadKind(undefined)).toBe(false);
  });
});

describe("limites de tamanho", () => {
  it("respeita o limite de imagem", () => {
    expect(checkUploadMeta("image", "image/png", MAX_IMAGE_BYTES).ok).toBe(true);
    expect(checkUploadMeta("image", "image/png", MAX_IMAGE_BYTES + 1).ok).toBe(false);
  });

  it("respeita o limite de documento", () => {
    expect(checkUploadMeta("document", "application/pdf", MAX_DOCUMENT_BYTES).ok).toBe(true);
    expect(checkUploadMeta("document", "application/pdf", MAX_DOCUMENT_BYTES + 1).ok).toBe(false);
  });

  it("recusa arquivo vazio", () => {
    expect(checkUploadMeta("image", "image/png", 0).ok).toBe(false);
  });
});

describe("extensão derivada do MIME", () => {
  it("usa a extensão da allowlist e não a do nome enviado", () => {
    const png = checkUploadMeta("image", "image/png", 1024);
    const jpeg = checkUploadMeta("image", "image/jpeg", 1024);
    const pdf = checkUploadMeta("document", "application/pdf", 1024);

    expect(png.ok && png.extension).toBe("png");
    expect(jpeg.ok && jpeg.extension).toBe("jpg");
    expect(pdf.ok && pdf.extension).toBe("pdf");
  });

  it("aceita MIME em caixa alta", () => {
    expect(checkUploadMeta("image", "IMAGE/PNG", 1024).ok).toBe(true);
  });

  it("mapeia content-type a partir da chave", () => {
    expect(contentTypeForKey("image/2026/03/a.png")).toBe("image/png");
    expect(contentTypeForKey("document/2026/03/a.pdf")).toBe("application/pdf");
    expect(contentTypeForKey("image/2026/03/a.svg")).toBeNull();
    expect(contentTypeForKey("image/2026/03/semextensao")).toBeNull();
  });
});

describe("magic bytes", () => {
  it("confirma arquivos coerentes com o MIME declarado", () => {
    expect(hasValidMagicBytes("image/png", PNG_HEADER)).toBe(true);
    expect(hasValidMagicBytes("image/jpeg", JPEG_HEADER)).toBe(true);
    expect(hasValidMagicBytes("application/pdf", PDF_HEADER)).toBe(true);
  });

  it("recusa conteúdo que não bate com o MIME", () => {
    expect(hasValidMagicBytes("image/png", PDF_HEADER)).toBe(false);
    expect(hasValidMagicBytes("application/pdf", PNG_HEADER)).toBe(false);
    expect(hasValidMagicBytes("image/png", Buffer.from("<svg xmlns="))).toBe(false);
  });

  it("recusa MIME fora da allowlist", () => {
    expect(hasValidMagicBytes("image/svg+xml", Buffer.from("<svg"))).toBe(false);
  });
});

describe("chave de armazenamento", () => {
  it("monta a chave com kind, ano, mês e identificador", () => {
    const key = buildStorageKey("image", "png", new Date("2026-03-07T10:00:00.000Z"), "abc-123");
    expect(key).toBe("image/2026/03/abc-123.png");
    expect(isSafeStorageKey(key)).toBe(true);
  });

  it("recusa travessia de diretório", () => {
    expect(isSafeStorageKey("../secret.pdf")).toBe(false);
    expect(isSafeStorageKey("image/../../.env")).toBe(false);
    expect(isSafeStorageKey("/etc/passwd")).toBe(false);
    expect(isSafeStorageKey("image\\2026\\a.png")).toBe(false);
    expect(isSafeStorageKey("image/2026/a\0.png")).toBe(false);
    expect(isSafeStorageKey("")).toBe(false);
    expect(isSafeStorageKey("a".repeat(301))).toBe(false);
  });

  it("não resolve caminho fora da pasta de uploads", () => {
    expect(resolveLocalPath("../fora.png")).toBeNull();
    expect(resolveLocalPath("image/2026/03/ok.png")).not.toBeNull();
  });

  it("limpa o nome original do arquivo", () => {
    expect(sanitizeFileName("../../relatório final.pdf")).toBe("relatório final.pdf");
    expect(sanitizeFileName("C:\\Users\\aluno\\foto.png")).toBe("foto.png");
    expect(sanitizeFileName("<script>.png")).toBe("script.png");
  });
});
