import { logAudit } from "@/lib/audit";
import { generateCertificateCode } from "@/lib/code";
import { notifications as notificationCopy } from "@/lib/copy";
import { canIssueCertificate, canManageSchoolEntity } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type { Viewer } from "@/lib/session";
import type { IssueCertificateInput } from "@/lib/validation/certificate.schema";
import { notify } from "@/server/services/notification.service";

export class CertificateError extends Error {}

export type PublicCertificate = {
  id: string;
  code: string;
  title: string;
  hours: number | null;
  issuedAt: Date;
  revokedAt: Date | null;
  studentName: string;
  schoolName: string;
  eventName: string | null;
  projectTitle: string | null;
  projectSlug: string | null;
};

function permissionViewer(viewer: Viewer) {
  return { id: viewer.id, role: viewer.role, schoolId: viewer.schoolId };
}

async function nextCertificateCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateCertificateCode();
    const existing = await prisma.certificate.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new CertificateError("Não foi possível gerar um código único. Tente novamente.");
}

export async function issueCertificate(
  viewer: Viewer,
  input: IssueCertificateInput,
): Promise<{ code: string; studentUsername: string }> {
  const student = await prisma.user.findFirst({
    where: { id: input.studentId, role: "STUDENT", isActive: true },
    select: { id: true, username: true, schoolId: true },
  });

  if (!student) throw new CertificateError("Estudante inválido para a sua escola.");

  if (!canIssueCertificate(permissionViewer(viewer), student.schoolId)) {
    throw new CertificateError("Você não pode emitir certificados para este estudante.");
  }

  let eventId: string | null = null;
  if (input.eventId) {
    const event = await prisma.event.findFirst({
      where: { id: input.eventId, schoolId: student.schoolId },
      select: { id: true },
    });
    if (!event) throw new CertificateError("Evento inválido para a sua escola.");
    eventId = event.id;
  }

  let projectId: string | null = null;
  if (input.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: input.projectId, schoolId: student.schoolId },
      select: { id: true },
    });
    if (!project) throw new CertificateError("Projeto inválido para a sua escola.");
    projectId = project.id;
  }

  const code = await nextCertificateCode();

  const certificate = await prisma.certificate.create({
    data: {
      code,
      title: input.title,
      studentId: student.id,
      schoolId: student.schoolId,
      eventId,
      projectId,
      hours: input.hours ? Number(input.hours) : null,
      issuedById: viewer.id,
    },
    select: { id: true, code: true },
  });

  await notify([student.id], {
    type: "CERTIFICATE_ISSUED",
    title: notificationCopy.messages.certificateIssued,
    body: input.title,
    link: `/certificate/${certificate.code}`,
    actorId: viewer.id,
  });

  await logAudit({
    schoolId: student.schoolId,
    actorId: viewer.id,
    action: "certificate.issued",
    entityType: "Certificate",
    entityId: certificate.id,
    metadata: { code: certificate.code, studentId: student.id, eventId, projectId },
  });

  return { code: certificate.code, studentUsername: student.username };
}

export async function revokeCertificate(
  viewer: Viewer,
  certificateId: string,
): Promise<{ code: string; studentUsername: string }> {
  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    select: {
      id: true,
      code: true,
      schoolId: true,
      revokedAt: true,
      student: { select: { username: true } },
    },
  });

  if (!certificate) throw new CertificateError("Certificado não encontrado.");

  if (!canManageSchoolEntity(permissionViewer(viewer), certificate.schoolId)) {
    throw new CertificateError("Só a administração da escola pode revogar certificados.");
  }

  if (!certificate.revokedAt) {
    await prisma.certificate.update({
      where: { id: certificate.id },
      data: { revokedAt: new Date() },
    });

    await logAudit({
      schoolId: certificate.schoolId,
      actorId: viewer.id,
      action: "certificate.revoked",
      entityType: "Certificate",
      entityId: certificate.id,
      metadata: { code: certificate.code },
    });
  }

  return { code: certificate.code, studentUsername: certificate.student.username };
}

export async function getCertificateByCode(code: string): Promise<PublicCertificate | null> {
  const certificate = await prisma.certificate.findUnique({
    where: { code },
    select: {
      id: true,
      code: true,
      title: true,
      hours: true,
      issuedAt: true,
      revokedAt: true,
      student: { select: { name: true } },
      school: { select: { name: true } },
      event: { select: { name: true } },
      project: { select: { title: true, slug: true, visibility: true, status: true } },
    },
  });

  if (!certificate) return null;

  const isPublicProject =
    certificate.project?.status === "APPROVED" && certificate.project.visibility === "PUBLIC";

  return {
    id: certificate.id,
    code: certificate.code,
    title: certificate.title,
    hours: certificate.hours,
    issuedAt: certificate.issuedAt,
    revokedAt: certificate.revokedAt,
    studentName: certificate.student.name,
    schoolName: certificate.school.name,
    eventName: certificate.event?.name ?? null,
    projectTitle: certificate.project?.title ?? null,
    projectSlug: isPublicProject ? (certificate.project?.slug ?? null) : null,
  };
}
