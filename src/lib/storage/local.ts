import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PutParams, PutResult, StorageProvider } from "@/lib/storage/types";

export const UPLOADS_DIR = path.join(process.cwd(), ".uploads");

const SEGMENT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function isSafeStorageKey(key: string): boolean {
  if (!key || key.length > 300) return false;
  if (key.startsWith("/") || key.includes("\\") || key.includes("\0")) return false;

  const segments = key.split("/");
  return segments.every(
    (segment) => segment !== "." && segment !== ".." && SEGMENT_PATTERN.test(segment),
  );
}

export function resolveLocalPath(key: string): string | null {
  if (!isSafeStorageKey(key)) return null;

  const resolved = path.resolve(UPLOADS_DIR, ...key.split("/"));
  const root = path.resolve(UPLOADS_DIR);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) return null;

  return resolved;
}

export function createLocalStorage(): StorageProvider {
  return {
    async put({ key, body }: PutParams): Promise<PutResult> {
      const target = resolveLocalPath(key);
      if (!target) throw new Error("Chave de arquivo inválida.");

      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, body);

      return { key, url: this.publicUrl(key) };
    },

    async delete(key: string): Promise<void> {
      const target = resolveLocalPath(key);
      if (!target) return;
      await unlink(target).catch(() => undefined);
    },

    publicUrl(key: string): string {
      return `/api/files/${key}`;
    },
  };
}
