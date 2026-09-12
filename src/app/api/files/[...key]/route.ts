import { readFile, stat } from "node:fs/promises";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { isSafeStorageKey, resolveLocalPath } from "@/lib/storage/local";
import { contentTypeForKey } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  if (env.STORAGE_PROVIDER !== "local") {
    return NextResponse.json({ error: "Indisponível." }, { status: 404 });
  }

  const { key: segments } = await params;
  const key = (segments ?? []).join("/");

  if (!isSafeStorageKey(key)) {
    return NextResponse.json({ error: "Caminho inválido." }, { status: 400 });
  }

  const contentType = contentTypeForKey(key);
  const filePath = resolveLocalPath(key);

  if (!contentType || !filePath) {
    return NextResponse.json({ error: "Caminho inválido." }, { status: 400 });
  }

  const info = await stat(filePath).catch(() => null);
  if (!info || !info.isFile()) {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }

  const file = await readFile(filePath);

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(info.size),
      "Content-Disposition":
        contentType === "application/pdf"
          ? `attachment; filename="${key.split("/").pop()}"`
          : "inline",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
