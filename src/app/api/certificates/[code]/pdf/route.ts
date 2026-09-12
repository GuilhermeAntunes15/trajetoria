import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { renderCertificatePdf } from "@/lib/pdf/certificate";
import { qrPngBuffer } from "@/lib/qrcode";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { certificateCodeSchema } from "@/lib/validation/certificate.schema";
import { getCertificateByCode } from "@/server/services/certificate.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const limit = rateLimit(`certificate-pdf:${clientIp(request.headers)}`, 30, 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Muitas solicitações. Tente novamente em instantes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const { code } = await params;

  const parsed = certificateCodeSchema.safeParse(code);
  if (!parsed.success) {
    return NextResponse.json({ error: "Certificado não encontrado." }, { status: 404 });
  }

  const certificate = await getCertificateByCode(parsed.data);
  if (!certificate || certificate.revokedAt) {
    return NextResponse.json({ error: "Certificado não encontrado." }, { status: 404 });
  }

  const verifyUrl = `${env.APP_URL}/certificate/${certificate.code}`;
  const qrPng = await qrPngBuffer(verifyUrl, 320);

  const pdf = await renderCertificatePdf({
    code: certificate.code,
    title: certificate.title,
    studentName: certificate.studentName,
    schoolName: certificate.schoolName,
    eventName: certificate.eventName,
    projectTitle: certificate.projectTitle,
    hours: certificate.hours,
    issuedAt: certificate.issuedAt,
    verifyUrl,
    qrPng,
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdf.byteLength),
      "Content-Disposition": `attachment; filename="certificado-${certificate.code}.pdf"`,
      "Cache-Control": "private, max-age=600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
