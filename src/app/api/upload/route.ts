import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getViewer } from "@/lib/session";
import { getStorage } from "@/lib/storage";
import {
  buildStorageKey,
  checkUploadMeta,
  hasValidMagicBytes,
  isUploadKind,
  sanitizeFileName,
} from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Entre para enviar arquivos." }, { status: 401 });
  }

  const limit = rateLimit(`upload:${viewer.id}`, 20, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Muitos envios. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Envio inválido." }, { status: 400 });
  }

  const kind = formData.get("kind");
  const file = formData.get("file");

  if (!isUploadKind(kind)) {
    return NextResponse.json({ error: "Tipo de envio inválido." }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Selecione um arquivo." }, { status: 400 });
  }

  const mimeType = file.type.toLowerCase();
  const check = checkUploadMeta(kind, mimeType, file.size);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  const body = Buffer.from(await file.arrayBuffer());
  if (body.byteLength > check.maxBytes || !hasValidMagicBytes(mimeType, body)) {
    return NextResponse.json({ error: "Arquivo não reconhecido." }, { status: 400 });
  }

  const key = buildStorageKey(kind, check.extension);
  const { url } = await getStorage().put({ key, body, contentType: mimeType });

  return NextResponse.json({
    url,
    key,
    fileName: sanitizeFileName(file.name),
    fileSize: body.byteLength,
    mimeType,
  });
}
