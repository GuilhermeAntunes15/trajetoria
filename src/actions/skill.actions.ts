"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canSuggestSkill } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getViewer, type Viewer } from "@/lib/session";
import { projectSkillAddSchema, projectSkillRemoveSchema } from "@/lib/validation/skill.schema";
import { getProjectCtxById } from "@/server/services/project.service";

export type SkillFormState = { error?: string; success?: string };

function permissionViewer(viewer: Viewer) {
  return { id: viewer.id, role: viewer.role, schoolId: viewer.schoolId };
}

export async function addProjectSkill(
  _prev: SkillFormState,
  formData: FormData,
): Promise<SkillFormState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = projectSkillAddSchema.safeParse({
    projectId: formData.get("projectId"),
    skillId: formData.get("skillId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Selecione uma competência." };
  }

  const project = await getProjectCtxById(parsed.data.projectId);
  if (!project) return { error: "Projeto não encontrado." };

  if (!canSuggestSkill(permissionViewer(viewer), project)) {
    return { error: "As competências só podem ser alteradas enquanto o projeto está em edição." };
  }

  const skill = await prisma.skill.findFirst({
    where: { id: parsed.data.skillId, schoolId: project.schoolId },
    select: { id: true },
  });

  if (!skill) return { error: "Competência inválida para a sua escola." };

  const existing = await prisma.projectSkill.findUnique({
    where: { projectId_skillId: { projectId: project.id, skillId: skill.id } },
    select: { id: true },
  });

  if (existing) return { error: "Esta competência já está declarada no projeto." };

  await prisma.projectSkill.create({
    data: { projectId: project.id, skillId: skill.id, suggestedByStudent: true },
  });

  revalidatePath(`/projects/${project.slug}`);

  return { success: "Competência declarada." };
}

export async function removeProjectSkill(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = projectSkillRemoveSchema.safeParse({
    projectSkillId: formData.get("projectSkillId"),
  });
  if (!parsed.success) throw new Error("Competência inválida.");

  const projectSkill = await prisma.projectSkill.findUnique({
    where: { id: parsed.data.projectSkillId },
    select: { id: true, projectId: true, validatedByTeacher: true },
  });

  if (!projectSkill) throw new Error("Competência não encontrada.");
  if (projectSkill.validatedByTeacher) {
    throw new Error("Competências já verificadas não podem ser removidas.");
  }

  const project = await getProjectCtxById(projectSkill.projectId);
  if (!project) throw new Error("Projeto não encontrado.");

  if (!canSuggestSkill(permissionViewer(viewer), project)) {
    throw new Error("As competências só podem ser alteradas enquanto o projeto está em edição.");
  }

  await prisma.projectSkill.delete({ where: { id: projectSkill.id } });

  revalidatePath(`/projects/${project.slug}`);
}
