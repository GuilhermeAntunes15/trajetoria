import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { qrPngBuffer } from "@/lib/qrcode";
import { certificateCodeSchema } from "@/lib/validation/certificate.schema";
import { getCertificateByCode } from "@/server/services/certificate.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const parsed = certificateCodeSchema.safeParse(code);
  if (!parsed.success) {
    return NextResponse.json({ error: "Certificado não encontrado." }, { status: 404 });
  }

  const certificate = await getCertificateByCode(parsed.data);
  if (!certificate) {
    return NextResponse.json({ error: "Certificado não encontrado." }, { status: 404 });
  }

  const png = await qrPngBuffer(`${env.APP_URL}/certificate/${certificate.code}`, 320);

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(png.byteLength),
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
