"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { certificates as certificatesCopy } from "@/lib/copy";
import { getViewer } from "@/lib/session";
import {
  issueCertificateSchema,
  revokeCertificateSchema,
} from "@/lib/validation/certificate.schema";
import {
  CertificateError,
  issueCertificate,
  revokeCertificate,
} from "@/server/services/certificate.service";

export type CertificateFormState = { error?: string; success?: string; code?: string };

export async function issueCertificateAction(
  _prev: CertificateFormState,
  formData: FormData,
): Promise<CertificateFormState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = issueCertificateSchema.safeParse({
    studentId: formData.get("studentId"),
    title: formData.get("title"),
    eventId: formData.get("eventId") ?? "",
    projectId: formData.get("projectId") ?? "",
    hours: formData.get("hours") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos do formulário." };
  }

  try {
    const { code, studentUsername } = await issueCertificate(viewer, parsed.data);
    revalidatePath(`/u/${studentUsername}`);
    return { success: certificatesCopy.issued, code };
  } catch (error) {
    if (error instanceof CertificateError) return { error: error.message };
    throw error;
  }
}

export async function revokeCertificateAction(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = revokeCertificateSchema.safeParse({
    certificateId: formData.get("certificateId"),
  });
  if (!parsed.success) throw new Error("Certificado inválido.");

  const { code, studentUsername } = await revokeCertificate(viewer, parsed.data.certificateId);

  revalidatePath(`/certificate/${code}`);
  revalidatePath(`/u/${studentUsername}`);
}
