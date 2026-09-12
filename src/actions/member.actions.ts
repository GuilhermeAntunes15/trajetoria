"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageMembers, isProjectMember } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getViewer, type Viewer } from "@/lib/session";
import {
  memberAddSchema,
  memberContributionSchema,
  memberRemoveSchema,
  studentSearchSchema,
} from "@/lib/validation/member.schema";
import { notify } from "@/server/services/notification.service";
import { getProjectCtxById } from "@/server/services/project.service";

export type MemberFormState = { error?: string; success?: string };

export type StudentOption = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  course: string | null;
  classroom: string | null;
};

function permissionViewer(viewer: Viewer) {
  return { id: viewer.id, role: viewer.role, schoolId: viewer.schoolId };
}

export async function searchStudents(query: string): Promise<StudentOption[]> {
  const viewer = await getViewer();
  if (!viewer) return [];

  const parsed = studentSearchSchema.safeParse(query);
  if (!parsed.success) return [];

  const students = await prisma.user.findMany({
    where: {
      schoolId: viewer.schoolId,
      role: "STUDENT",
      isActive: true,
      OR: [
        { name: { contains: parsed.data, mode: "insensitive" } },
        { username: { contains: parsed.data, mode: "insensitive" } },
      ],
    },
    orderBy: { name: "asc" },
    take: 10,
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      studentProfile: { select: { course: true, classroom: { select: { name: true } } } },
    },
  });

  return students.map((student) => ({
    id: student.id,
    name: student.name,
    username: student.username,
    avatarUrl: student.avatarUrl,
    course: student.studentProfile?.course ?? null,
    classroom: student.studentProfile?.classroom?.name ?? null,
  }));
}

export async function addMember(
  _prev: MemberFormState,
  formData: FormData,
): Promise<MemberFormState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = memberAddSchema.safeParse({
    projectId: formData.get("projectId"),
    userId: formData.get("userId"),
    role: formData.get("role"),
    contribution: formData.get("contribution") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos." };
  }

  const project = await getProjectCtxById(parsed.data.projectId);
  if (!project) return { error: "Projeto não encontrado." };

  if (!canManageMembers(permissionViewer(viewer), project)) {
    return { error: "A equipe só pode ser alterada enquanto o projeto está em edição." };
  }

  const student = await prisma.user.findFirst({
    where: {
      id: parsed.data.userId,
      schoolId: project.schoolId,
      role: "STUDENT",
      isActive: true,
    },
    select: { id: true },
  });

  if (!student) return { error: "Estudante inválido para a sua escola." };
  if (project.memberIds.includes(student.id)) {
    return { error: "Este estudante já faz parte da equipe." };
  }

  const title = await prisma.project.findUnique({
    where: { id: project.id },
    select: { title: true },
  });

  await prisma.projectMember.create({
    data: {
      projectId: project.id,
      userId: student.id,
      role: parsed.data.role,
      contribution: parsed.data.contribution || null,
    },
  });

  await notify([student.id], {
    type: "MEMBER_ADDED",
    title: `Você foi adicionado ao projeto ${title?.title ?? ""}.`.trim(),
    link: `/projects/${project.slug}`,
    actorId: viewer.id,
  });

  revalidatePath(`/projects/${project.slug}`);
  revalidatePath("/dashboard");

  return { success: "Integrante adicionado." };
}

export async function updateMemberContribution(
  _prev: MemberFormState,
  formData: FormData,
): Promise<MemberFormState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = memberContributionSchema.safeParse({
    memberId: formData.get("memberId"),
    role: formData.get("role"),
    contribution: formData.get("contribution") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos." };
  }

  const member = await prisma.projectMember.findUnique({
    where: { id: parsed.data.memberId },
    select: { id: true, userId: true, projectId: true },
  });

  if (!member) return { error: "Integrante não encontrado." };

  const project = await getProjectCtxById(member.projectId);
  if (!project) return { error: "Projeto não encontrado." };

  const isSelf = member.userId === viewer.id;
  if (!isSelf || !canManageMembers(permissionViewer(viewer), project)) {
    return { error: "Você só pode editar a sua própria contribuição, enquanto o projeto está em edição." };
  }

  await prisma.projectMember.update({
    where: { id: member.id },
    data: { role: parsed.data.role, contribution: parsed.data.contribution || null },
  });

  revalidatePath(`/projects/${project.slug}`);

  return { success: "Contribuição atualizada." };
}

export async function removeMember(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = memberRemoveSchema.safeParse({ memberId: formData.get("memberId") });
  if (!parsed.success) throw new Error("Integrante inválido.");

  const member = await prisma.projectMember.findUnique({
    where: { id: parsed.data.memberId },
    select: { id: true, userId: true, projectId: true, isOwner: true },
  });

  if (!member) throw new Error("Integrante não encontrado.");
  if (member.isOwner) throw new Error("Quem criou o projeto não pode ser removido da equipe.");

  const project = await getProjectCtxById(member.projectId);
  if (!project) throw new Error("Projeto não encontrado.");

  if (!canManageMembers(permissionViewer(viewer), project)) {
    throw new Error("A equipe só pode ser alterada enquanto o projeto está em edição.");
  }

  await prisma.projectMember.delete({ where: { id: member.id } });

  revalidatePath(`/projects/${project.slug}`);
  revalidatePath("/dashboard");
}

export async function leaveProject(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const projectId = String(formData.get("projectId") ?? "");
  const project = await getProjectCtxById(projectId);
  if (!project) throw new Error("Projeto não encontrado.");

  if (!isProjectMember(permissionViewer(viewer), project)) {
    throw new Error("Você não faz parte deste projeto.");
  }

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: project.id, userId: viewer.id } },
    select: { id: true, isOwner: true },
  });

  if (!member) throw new Error("Você não faz parte deste projeto.");
  if (member.isOwner) throw new Error("Quem criou o projeto não pode sair da equipe.");

  await prisma.projectMember.delete({ where: { id: member.id } });

  revalidatePath(`/projects/${project.slug}`);
  revalidatePath("/dashboard");
  redirect("/projects");
}
