import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Notice } from "@/components/common/Notice";
import { SectionTitle } from "@/components/common/SectionTitle";
import { Card, CardBody } from "@/components/ui/Card";
import { certificates as certificatesCopy } from "@/lib/copy";
import { formatLongDate } from "@/lib/format";
import { certificateCodeSchema } from "@/lib/validation/certificate.schema";
import { getCertificateByCode } from "@/server/services/certificate.service";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const parsed = certificateCodeSchema.safeParse(code);
  if (!parsed.success) return { title: "Certificado" };

  const certificate = await getCertificateByCode(parsed.data);
  if (!certificate) return { title: "Certificado" };

  return { title: `${certificate.title} — ${certificate.studentName}` };
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const parsed = certificateCodeSchema.safeParse(code);
  if (!parsed.success) notFound();

  const certificate = await getCertificateByCode(parsed.data);
  if (!certificate) notFound();

  const revoked = certificate.revokedAt !== null;

  const details = [
    certificate.eventName ? { label: certificatesCopy.eventLabel, value: certificate.eventName } : null,
    certificate.projectTitle
      ? { label: certificatesCopy.projectLabel, value: certificate.projectTitle }
      : null,
    certificate.hours
      ? { label: certificatesCopy.hoursLabel, value: `${certificate.hours}` }
      : null,
    { label: "Escola", value: certificate.schoolName },
    { label: "Data de emissão", value: formatLongDate(certificate.issuedAt) },
    { label: certificatesCopy.codeLabel, value: certificate.code },
  ].filter((item): item is { label: string; value: string } => item !== null);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {revoked ? (
        <Notice tone="warning" title={certificatesCopy.revoked}>
          <p>{certificatesCopy.revokedNote}</p>
        </Notice>
      ) : null}

      <Card>
        <CardBody className="space-y-6 py-8 text-center">
          <p className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">
            {certificatesCopy.title}
          </p>

          <div className="space-y-2">
            <h1 className="font-display text-3xl leading-tight font-semibold text-ink">
              {certificate.studentName}
            </h1>
            <p className="text-base text-ink">{certificate.title}</p>
          </div>

          <dl className="mx-auto grid max-w-md gap-2 text-left text-sm">
            {details.map((item) => (
              <div key={item.label} className="flex justify-between gap-4 border-b border-line pb-1.5">
                <dt className="text-muted">{item.label}</dt>
                <dd className="text-right font-medium text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>

          {certificate.projectSlug ? (
            <p className="text-sm">
              <Link
                href={`/projects/${certificate.projectSlug}`}
                className="text-brand hover:text-brand-hover"
              >
                Ver o projeto
              </Link>
            </p>
          ) : null}

          {revoked ? null : (
            <p>
              <a
                href={`/api/certificates/${certificate.code}/pdf`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-brand bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
              >
                {certificatesCopy.downloadAction}
              </a>
            </p>
          )}
        </CardBody>
      </Card>

      <section className="space-y-3">
        <SectionTitle>{certificatesCopy.verifyTitle}</SectionTitle>
        <div className="flex flex-col items-start gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:flex-row sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/certificates/${certificate.code}/qr`}
            alt={`QR Code de verificação do certificado ${certificate.code}`}
            width={128}
            height={128}
            className="size-32 shrink-0"
          />
          <div className="space-y-1">
            <p className="text-sm text-ink">{certificatesCopy.verifyHint}</p>
            <p className="text-sm text-muted">
              {certificatesCopy.codeLabel}: <span className="font-medium">{certificate.code}</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
