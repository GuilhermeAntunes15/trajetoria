"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EvidenceType } from "@prisma/client";
import { canManageEvidence } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getViewer, type Viewer } from "@/lib/session";
import {
  evidenceCreateSchema,
  evidenceRemoveSchema,
  evidenceReorderSchema,
  evidenceUpdateSchema,
  isFileEvidence,
} from "@/lib/validation/evidence.schema";
import { getProjectCtxById } from "@/server/services/project.service";

export type EvidenceFormState = { error?: string; success?: string };

function permissionViewer(viewer: Viewer) {
  return { id: viewer.id, role: viewer.role, schoolId: viewer.schoolId };
}

function readEvidenceFields(formData: FormData) {
  const fileSize = formData.get("fileSize");
  return {
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    url: formData.get("url") ?? "",
    fileUrl: formData.get("fileUrl") ?? "",
    fileName: formData.get("fileName") ?? "",
    mimeType: formData.get("mimeType") ?? "",
    fileSize: fileSize ? Number(fileSize) : null,
  };
}

function evidenceData(input: {
  type: EvidenceType;
  title: string;
  description: string;
  url: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number | null;
}) {
  const usesFile = isFileEvidence(input.type);

  return {
    type: input.type,
    title: input.title,
    description: input.description || null,
    url: usesFile ? null : input.url,
    fileUrl: usesFile ? input.fileUrl : null,
    fileName: usesFile ? input.fileName || null : null,
    mimeType: usesFile ? input.mimeType || null : null,
    fileSize: usesFile ? input.fileSize : null,
  };
}

export async function addEvidence(
  _prev: EvidenceFormState,
  formData: FormData,
): Promise<EvidenceFormState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = evidenceCreateSchema.safeParse({
    projectId: formData.get("projectId"),
    ...readEvidenceFields(formData),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos." };
  }

  const project = await getProjectCtxById(parsed.data.projectId);
  if (!project) return { error: "Projeto não encontrado." };

  if (!canManageEvidence(permissionViewer(viewer), project)) {
    return { error: "As evidências só podem ser alteradas enquanto o projeto está em edição." };
  }

  const last = await prisma.projectEvidence.findFirst({
    where: { projectId: project.id },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await prisma.projectEvidence.create({
    data: {
      projectId: project.id,
      order: (last?.order ?? 0) + 1,
      ...evidenceData(parsed.data),
    },
  });

  revalidatePath(`/projects/${project.slug}`);

  return { success: "Evidência adicionada." };
}

export async function updateEvidence(
  _prev: EvidenceFormState,
  formData: FormData,
): Promise<EvidenceFormState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = evidenceUpdateSchema.safeParse({
    evidenceId: formData.get("evidenceId"),
    ...readEvidenceFields(formData),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos." };
  }

  const evidence = await prisma.projectEvidence.findUnique({
    where: { id: parsed.data.evidenceId },
    select: { id: true, projectId: true },
  });

  if (!evidence) return { error: "Evidência não encontrada." };

  const project = await getProjectCtxById(evidence.projectId);
  if (!project) return { error: "Projeto não encontrado." };

  if (!canManageEvidence(permissionViewer(viewer), project)) {
    return { error: "As evidências só podem ser alteradas enquanto o projeto está em edição." };
  }

  await prisma.projectEvidence.update({
    where: { id: evidence.id },
    data: evidenceData(parsed.data),
  });

  revalidatePath(`/projects/${project.slug}`);

  return { success: "Evidência atualizada." };
}

export async function removeEvidence(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = evidenceRemoveSchema.safeParse({ evidenceId: formData.get("evidenceId") });
  if (!parsed.success) throw new Error("Evidência inválida.");

  const evidence = await prisma.projectEvidence.findUnique({
    where: { id: parsed.data.evidenceId },
    select: { id: true, projectId: true },
  });

  if (!evidence) throw new Error("Evidência não encontrada.");

  const project = await getProjectCtxById(evidence.projectId);
  if (!project) throw new Error("Projeto não encontrado.");

  if (!canManageEvidence(permissionViewer(viewer), project)) {
    throw new Error("As evidências só podem ser alteradas enquanto o projeto está em edição.");
  }

  await prisma.projectEvidence.delete({ where: { id: evidence.id } });

  revalidatePath(`/projects/${project.slug}`);
}

export async function reorderEvidence(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = evidenceReorderSchema.safeParse({
    evidenceId: formData.get("evidenceId"),
    direction: formData.get("direction"),
  });
  if (!parsed.success) throw new Error("Movimento inválido.");

  const evidence = await prisma.projectEvidence.findUnique({
    where: { id: parsed.data.evidenceId },
    select: { id: true, projectId: true, order: true },
  });

  if (!evidence) throw new Error("Evidência não encontrada.");

  const project = await getProjectCtxById(evidence.projectId);
  if (!project) throw new Error("Projeto não encontrado.");

  if (!canManageEvidence(permissionViewer(viewer), project)) {
    throw new Error("As evidências só podem ser alteradas enquanto o projeto está em edição.");
  }

  const neighbour = await prisma.projectEvidence.findFirst({
    where:
      parsed.data.direction === "up"
        ? { projectId: project.id, order: { lt: evidence.order } }
        : { projectId: project.id, order: { gt: evidence.order } },
    orderBy: { order: parsed.data.direction === "up" ? "desc" : "asc" },
    select: { id: true, order: true },
  });

  if (!neighbour) return;

  await prisma.$transaction([
    prisma.projectEvidence.update({ where: { id: evidence.id }, data: { order: neighbour.order } }),
    prisma.projectEvidence.update({ where: { id: neighbour.id }, data: { order: evidence.order } }),
  ]);

  revalidatePath(`/projects/${project.slug}`);
}
