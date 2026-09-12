export const UPLOAD_KINDS = ["image", "document"] as const;
export type UploadKind = (typeof UPLOAD_KINDS)[number];

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

type MimeRule = { kind: UploadKind; extension: string; maxBytes: number };

export const ALLOWED_MIME_TYPES: Record<string, MimeRule> = {
  "image/png": { kind: "image", extension: "png", maxBytes: MAX_IMAGE_BYTES },
  "image/jpeg": { kind: "image", extension: "jpg", maxBytes: MAX_IMAGE_BYTES },
  "image/webp": { kind: "image", extension: "webp", maxBytes: MAX_IMAGE_BYTES },
  "application/pdf": { kind: "document", extension: "pdf", maxBytes: MAX_DOCUMENT_BYTES },
};

export const ACCEPT_BY_KIND: Record<UploadKind, string> = {
  image: "image/png,image/jpeg,image/webp",
  document: "application/pdf",
};

export type UploadCheck =
  | { ok: true; extension: string; maxBytes: number }
  | { ok: false; error: string };

export function isUploadKind(value: unknown): value is UploadKind {
  return typeof value === "string" && (UPLOAD_KINDS as readonly string[]).includes(value);
}

export function checkUploadMeta(kind: UploadKind, mimeType: string, size: number): UploadCheck {
  const rule = ALLOWED_MIME_TYPES[mimeType.toLowerCase()];

  if (!rule || rule.kind !== kind) {
    return {
      ok: false,
      error:
        kind === "image"
          ? "Envie uma imagem PNG, JPEG ou WebP."
          : "Envie um arquivo PDF.",
    };
  }

  if (size <= 0) return { ok: false, error: "Arquivo vazio." };

  if (size > rule.maxBytes) {
    return {
      ok: false,
      error: `Arquivo muito grande. O limite é ${Math.round(rule.maxBytes / (1024 * 1024))} MB.`,
    };
  }

  return { ok: true, extension: rule.extension, maxBytes: rule.maxBytes };
}

export function hasValidMagicBytes(mimeType: string, buffer: Buffer): boolean {
  switch (mimeType.toLowerCase()) {
    case "image/png":
      return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case "image/jpeg":
      return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
    case "image/webp":
      return (
        buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
        buffer.subarray(8, 12).toString("ascii") === "WEBP"
      );
    case "application/pdf":
      return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
    default:
      return false;
  }
}

export function buildStorageKey(
  kind: UploadKind,
  extension: string,
  now: Date = new Date(),
  id: string = crypto.randomUUID(),
): string {
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return [kind, year, month, `${id}.${extension}`].join("/");
}

export function extensionOf(key: string): string {
  const base = key.slice(key.lastIndexOf("/") + 1);
  const dot = base.lastIndexOf(".");
  return dot <= 0 ? "" : base.slice(dot).toLowerCase();
}

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

export function contentTypeForKey(key: string): string | null {
  return CONTENT_TYPE_BY_EXTENSION[extensionOf(key)] ?? null;
}

export function sanitizeFileName(fileName: string): string {
  const base = fileName.split(/[\\/]/).pop() ?? "arquivo";
  return base.replace(/[^\p{L}\p{N}._ -]/gu, "").slice(0, 120) || "arquivo";
}
