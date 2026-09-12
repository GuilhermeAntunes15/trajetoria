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

      {/* Diploma: moldura tracejada dentro do adesivo, como um certificado impresso. */}
      <Card variant="sticker" className="overflow-hidden">
        <div className="h-3 border-b-2 border-ink bg-lp-sun" aria-hidden />
        <CardBody className="p-4 sm:p-6">
          <div className="space-y-7 rounded-[12px] border-2 border-dashed border-ink/25 px-4 py-8 text-center sm:px-8 sm:py-10">
            <p className="text-[0.7rem] font-bold tracking-[0.14em] text-muted uppercase">
              {certificatesCopy.title}
            </p>

            <div className="space-y-3">
              <h1 className="font-display text-[1.75rem] leading-[1.05] font-bold text-ink sm:text-4xl">
                {certificate.studentName}
              </h1>
              <p className="text-base text-ink sm:text-lg">{certificate.title}</p>
              {certificate.hours ? (
                <p className="inline-flex rounded-full border-2 border-ink bg-lp-mint px-3 py-1 text-xs font-bold text-ink">
                  {certificatesCopy.hoursText(certificate.hours)}
                </p>
              ) : null}
            </div>

            <dl className="mx-auto grid max-w-md gap-2 text-left text-sm">
              {details.map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between gap-4 border-b border-dashed border-ink/20 pb-1.5"
                >
                  <dt className="text-muted">{item.label}</dt>
                  <dd className="text-right font-semibold text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>

            {certificate.projectSlug ? (
              <p className="text-sm">
                <Link
                  href={`/projects/${certificate.projectSlug}`}
                  className="font-semibold text-brand underline-offset-4 hover:text-brand-hover hover:underline"
                >
                  Ver o projeto
                </Link>
              </p>
            ) : null}

            {revoked ? null : (
              <p>
                <a
                  href={`/api/certificates/${certificate.code}/pdf`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border-2 border-ink bg-brand px-5 text-sm font-bold text-white shadow-[3px_3px_0_var(--color-ink)] transition-colors hover:bg-brand-hover"
                >
                  {certificatesCopy.downloadAction}
                </a>
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      <section className="space-y-3">
        <SectionTitle variant="display">{certificatesCopy.verifyTitle}</SectionTitle>
        <div className="lp-sticker lp-sticker-soft flex flex-col items-start gap-4 bg-surface p-4 sm:flex-row sm:items-center">
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
              {certificatesCopy.codeLabel}:{" "}
              <span className="font-mono font-semibold tracking-wider text-ink">
                {certificate.code}
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
