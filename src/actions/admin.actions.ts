"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
import { logAudit } from "@/lib/audit";
import { generatePassword } from "@/lib/code";
import { admin as adminCopy } from "@/lib/copy";
import { seedDefaultSkills } from "@/lib/default-skills";
import { canChangeProjectVisibilityAsModerator, canManageSchoolEntity } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getViewer, type Viewer } from "@/lib/session";
import { slugify } from "@/lib/slug";
import {
  classroomFormSchema,
  classroomIdSchema,
  classroomMembersSchema,
  projectVisibilityModerationSchema,
  schoolFormSchema,
  skillFormSchema,
  skillIdSchema,
  userCreateSchema,
  userIdSchema,
  userStatusSchema,
  userUpdateSchema,
} from "@/lib/validation/admin.schema";
import { badgeFormSchema, badgeIdSchema } from "@/lib/validation/badge.schema";

export type AdminFormState = { error?: string; success?: string; password?: string };

async function requireAdmin(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?redirectTo=%2Fadmin");
  if (!canManageSchoolEntity({ id: viewer.id, role: viewer.role, schoolId: viewer.schoolId }, viewer.schoolId)) {
    redirect("/dashboard");
  }
  return viewer;
}

function usernameFromName(name: string): string {
  const parts = slugify(name, 60).split("-").filter(Boolean);
  if (parts.length === 0) return "usuario";
  if (parts.length === 1) return parts[0]!;
  return `${parts[0]}.${parts[parts.length - 1]}`;
}

async function uniqueUsername(base: string): Promise<string> {
  let candidate = base;
  for (let suffix = 2; suffix <= 200; suffix += 1) {
    const existing = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${base}${suffix}`;
  }
  return `${base}${Date.now().toString(36)}`;
}

async function resolveClassroomId(classroomId: string, schoolId: string): Promise<string | null> {
  if (!classroomId) return null;
  const classroom = await prisma.classroom.findFirst({
    where: { id: classroomId, schoolId },
    select: { id: true },
  });
  if (!classroom) throw new Error("Turma inválida para a sua escola.");
  return classroom.id;
}

async function activeAdminCount(schoolId: string): Promise<number> {
  return prisma.user.count({ where: { schoolId, role: "ADMIN", isActive: true } });
}

export async function createUserAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const viewer = await requireAdmin();

  const parsed = userCreateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    classroomId: formData.get("classroomId") ?? "",
    password: formData.get("password") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos do formulário." };
  }

  const data = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });
  if (existing) return { error: "Já existe um acesso com este e-mail." };

  let classroomId: string | null;
  try {
    classroomId = data.role === "STUDENT" ? await resolveClassroomId(data.classroomId, viewer.schoolId) : null;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Turma inválida." };
  }

  const password = data.password || generatePassword();
  const username = await uniqueUsername(usernameFromName(data.name));

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      username,
      role: data.role,
      schoolId: viewer.schoolId,
      passwordHash: await hash(password, 12),
      mustCompleteOnboarding: data.role === "STUDENT",
      profileVisibility: "PRIVATE",
      ...(data.role === "STUDENT"
        ? { studentProfile: { create: { classroomId } } }
        : { teacherProfile: data.role === "TEACHER" ? { create: {} } : undefined }),
    },
    select: { id: true },
  });

  await logAudit({
    schoolId: viewer.schoolId,
    actorId: viewer.id,
    action: "user.created",
    entityType: "User",
    entityId: user.id,
    metadata: { role: data.role },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");

  return { success: adminCopy.userCreated, password };
}

export async function updateUserAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const viewer = await requireAdmin();

  const parsed = userUpdateSchema.safeParse({
    userId: formData.get("userId"),
    name: formData.get("name"),
    role: formData.get("role"),
    classroomId: formData.get("classroomId") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos do formulário." };
  }

  const data = parsed.data;

  const target = await prisma.user.findFirst({
    where: { id: data.userId, schoolId: viewer.schoolId },
    select: { id: true, username: true, role: true, isActive: true },
  });

  if (!target) return { error: "Usuário não encontrado nesta escola." };

  if (target.role === "ADMIN" && data.role !== "ADMIN" && target.isActive) {
    if ((await activeAdminCount(viewer.schoolId)) <= 1) return { error: adminCopy.lastAdmin };
  }

  let classroomId: string | null;
  try {
    classroomId = data.role === "STUDENT" ? await resolveClassroomId(data.classroomId, viewer.schoolId) : null;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Turma inválida." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: target.id },
      data: { name: data.name, role: data.role },
    });

    if (data.role === "STUDENT") {
      await tx.studentProfile.upsert({
        where: { userId: target.id },
        create: { userId: target.id, classroomId },
        update: { classroomId },
      });
    }

    if (data.role === "TEACHER") {
      await tx.teacherProfile.upsert({
        where: { userId: target.id },
        create: { userId: target.id },
        update: {},
      });
    }
  });

  if (target.role !== data.role) {
    await logAudit({
      schoolId: viewer.schoolId,
      actorId: viewer.id,
      action: "user.role_changed",
      entityType: "User",
      entityId: target.id,
      metadata: { from: target.role, to: data.role },
    });
  }

  revalidatePath("/admin/users");
  revalidatePath(`/u/${target.username}`);

  return { success: adminCopy.userUpdated };
}

export async function setUserStatusAction(formData: FormData): Promise<void> {
  const viewer = await requireAdmin();

  const parsed = userStatusSchema.safeParse({
    userId: formData.get("userId"),
    active: formData.get("active"),
  });
  if (!parsed.success) throw new Error("Usuário inválido.");

  const active = parsed.data.active === "true";

  const target = await prisma.user.findFirst({
    where: { id: parsed.data.userId, schoolId: viewer.schoolId },
    select: { id: true, role: true, isActive: true, username: true },
  });

  if (!target) throw new Error("Usuário não encontrado nesta escola.");

  if (!active && target.role === "ADMIN" && target.isActive) {
    if ((await activeAdminCount(viewer.schoolId)) <= 1) throw new Error(adminCopy.lastAdmin);
  }

  await prisma.user.update({ where: { id: target.id }, data: { isActive: active } });

  await logAudit({
    schoolId: viewer.schoolId,
    actorId: viewer.id,
    action: active ? "user.reactivated" : "user.deactivated",
    entityType: "User",
    entityId: target.id,
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${target.id}`);
}

export async function resetUserPasswordAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const viewer = await requireAdmin();

  const parsed = userIdSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return { error: "Usuário inválido." };

  const target = await prisma.user.findFirst({
    where: { id: parsed.data.userId, schoolId: viewer.schoolId },
    select: { id: true },
  });

  if (!target) return { error: "Usuário não encontrado nesta escola." };

  const password = generatePassword();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: target.id },
      data: { passwordHash: await hash(password, 12) },
    }),
    prisma.passwordResetToken.updateMany({
      where: { userId: target.id, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);

  await logAudit({
    schoolId: viewer.schoolId,
    actorId: viewer.id,
    action: "user.password_reset",
    entityType: "User",
    entityId: target.id,
  });

  return { success: adminCopy.passwordOnce, password };
}

export async function saveClassroomAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const viewer = await requireAdmin();

  const parsed = classroomFormSchema.safeParse({
    classroomId: formData.get("classroomId") ?? "",
    name: formData.get("name"),
    year: formData.get("year"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos do formulário." };
  }

  const data = parsed.data;
  const year = Number(data.year);

  const duplicate = await prisma.classroom.findFirst({
    where: {
      schoolId: viewer.schoolId,
      name: data.name,
      year,
      ...(data.classroomId ? { id: { not: data.classroomId } } : {}),
    },
    select: { id: true },
  });

  if (duplicate) return { error: "Já existe uma turma com esse nome neste ano." };

  if (data.classroomId) {
    const classroom = await prisma.classroom.findFirst({
      where: { id: data.classroomId, schoolId: viewer.schoolId },
      select: { id: true },
    });
    if (!classroom) return { error: "Turma não encontrada nesta escola." };

    await prisma.classroom.update({
      where: { id: classroom.id },
      data: { name: data.name, year },
    });
  } else {
    await prisma.classroom.create({
      data: { name: data.name, year, schoolId: viewer.schoolId },
    });
  }

  revalidatePath("/admin/classes");
  revalidatePath("/teacher/classes");

  return { success: adminCopy.classSaved };
}

export async function setClassroomMembersAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const viewer = await requireAdmin();

  const parsed = classroomMembersSchema.safeParse({
    classroomId: formData.get("classroomId"),
    studentIds: formData.getAll("studentIds").map(String),
    teacherIds: formData.getAll("teacherIds").map(String),
  });

  if (!parsed.success) return { error: "Revise a seleção de estudantes e professores." };

  const classroom = await prisma.classroom.findFirst({
    where: { id: parsed.data.classroomId, schoolId: viewer.schoolId },
    select: { id: true },
  });

  if (!classroom) return { error: "Turma não encontrada nesta escola." };

  const students = await prisma.studentProfile.findMany({
    where: { userId: { in: parsed.data.studentIds }, user: { schoolId: viewer.schoolId } },
    select: { id: true },
  });

  const teachers = await prisma.user.findMany({
    where: {
      id: { in: parsed.data.teacherIds },
      schoolId: viewer.schoolId,
      role: { in: ["TEACHER", "ADMIN"] },
    },
    select: { id: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.studentProfile.updateMany({
      where: { classroomId: classroom.id },
      data: { classroomId: null },
    });

    if (students.length > 0) {
      await tx.studentProfile.updateMany({
        where: { id: { in: students.map((student) => student.id) } },
        data: { classroomId: classroom.id },
      });
    }

    await tx.classroomTeacher.deleteMany({ where: { classroomId: classroom.id } });

    if (teachers.length > 0) {
      await tx.classroomTeacher.createMany({
        data: teachers.map((teacher) => ({ classroomId: classroom.id, teacherId: teacher.id })),
      });
    }
  });

  revalidatePath("/admin/classes");
  revalidatePath(`/admin/classes/${classroom.id}`);
  revalidatePath("/teacher/classes");

  return { success: adminCopy.classSaved };
}

export async function deleteClassroomAction(formData: FormData): Promise<void> {
  const viewer = await requireAdmin();

  const parsed = classroomIdSchema.safeParse({ classroomId: formData.get("classroomId") });
  if (!parsed.success) throw new Error("Turma inválida.");

  const classroom = await prisma.classroom.findFirst({
    where: { id: parsed.data.classroomId, schoolId: viewer.schoolId },
    select: { id: true },
  });

  if (!classroom) throw new Error("Turma não encontrada nesta escola.");

  await prisma.classroom.delete({ where: { id: classroom.id } });

  revalidatePath("/admin/classes");
  revalidatePath("/teacher/classes");
  redirect("/admin/classes");
}

export async function updateSchoolAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const viewer = await requireAdmin();

  const parsed = schoolFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    city: formData.get("city") ?? "",
    state: formData.get("state") ?? "",
    logoUrl: formData.get("logoUrl") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos do formulário." };
  }

  const data = parsed.data;

  const school = await prisma.school.update({
    where: { id: viewer.schoolId },
    data: {
      name: data.name,
      description: data.description || null,
      city: data.city || null,
      state: data.state || null,
      logoUrl: data.logoUrl || null,
    },
    select: { slug: true },
  });

  revalidatePath("/admin/school");
  revalidatePath(`/s/${school.slug}`);

  return { success: adminCopy.schoolSaved };
}

export async function saveSkillAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const viewer = await requireAdmin();

  const parsed = skillFormSchema.safeParse({
    skillId: formData.get("skillId") ?? "",
    name: formData.get("name"),
    category: formData.get("category"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos do formulário." };
  }

  const data = parsed.data;
  const slug = slugify(data.name, 60);

  const duplicate = await prisma.skill.findFirst({
    where: {
      schoolId: viewer.schoolId,
      slug,
      ...(data.skillId ? { id: { not: data.skillId } } : {}),
    },
    select: { id: true },
  });

  if (duplicate) return { error: "Já existe uma competência com esse nome." };

  if (data.skillId) {
    const skill = await prisma.skill.findFirst({
      where: { id: data.skillId, schoolId: viewer.schoolId },
      select: { id: true },
    });
    if (!skill) return { error: "Competência não encontrada nesta escola." };

    await prisma.skill.update({
      where: { id: skill.id },
      data: { name: data.name, slug, category: data.category },
    });
  } else {
    await prisma.skill.create({
      data: { name: data.name, slug, category: data.category, schoolId: viewer.schoolId },
    });
  }

  revalidatePath("/admin/skills");

  return { success: adminCopy.skillSaved };
}

export async function deleteSkillAction(formData: FormData): Promise<void> {
  const viewer = await requireAdmin();

  const parsed = skillIdSchema.safeParse({ skillId: formData.get("skillId") });
  if (!parsed.success) throw new Error("Competência inválida.");

  const skill = await prisma.skill.findFirst({
    where: { id: parsed.data.skillId, schoolId: viewer.schoolId },
    select: { id: true, _count: { select: { projectSkills: true } } },
  });

  if (!skill) throw new Error("Competência não encontrada nesta escola.");
  if (skill._count.projectSkills > 0) throw new Error(adminCopy.skillInUse);

  await prisma.skill.delete({ where: { id: skill.id } });

  revalidatePath("/admin/skills");
}

export async function restoreDefaultSkillsAction(
  _prev: AdminFormState,
  _formData: FormData,
): Promise<AdminFormState> {
  const viewer = await requireAdmin();

  const created = await seedDefaultSkills(prisma, viewer.schoolId);

  revalidatePath("/admin/skills");

  return { success: adminCopy.restoreSkillsDone(created) };
}

export async function saveBadgeAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const viewer = await requireAdmin();

  const badgeId = String(formData.get("badgeId") ?? "");

  const parsed = badgeFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    icon: formData.get("icon"),
    type: formData.get("type"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos do formulário." };
  }

  const data = parsed.data;
  const slug = slugify(data.name, 60);

  const duplicate = await prisma.badge.findFirst({
    where: { schoolId: viewer.schoolId, slug, ...(badgeId ? { id: { not: badgeId } } : {}) },
    select: { id: true },
  });

  if (duplicate) return { error: "Já existe uma badge com esse nome." };

  if (badgeId) {
    const badge = await prisma.badge.findFirst({
      where: { id: badgeId, schoolId: viewer.schoolId },
      select: { id: true },
    });
    if (!badge) return { error: "Badge não encontrada nesta escola." };

    await prisma.badge.update({
      where: { id: badge.id },
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        icon: data.icon,
        type: data.type,
      },
    });
  } else {
    await prisma.badge.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        icon: data.icon,
        type: data.type,
        schoolId: viewer.schoolId,
      },
    });
  }

  revalidatePath("/admin/badges");

  return { success: adminCopy.badgeSaved };
}

export async function deleteBadgeAction(formData: FormData): Promise<void> {
  const viewer = await requireAdmin();

  const parsed = badgeIdSchema.safeParse({ badgeId: formData.get("badgeId") });
  if (!parsed.success) throw new Error("Badge inválida.");

  const badge = await prisma.badge.findFirst({
    where: { id: parsed.data.badgeId, schoolId: viewer.schoolId },
    select: { id: true, _count: { select: { userBadges: true } } },
  });

  if (!badge) throw new Error("Badge não encontrada nesta escola.");
  if (badge._count.userBadges > 0) throw new Error(adminCopy.badgeInUse);

  await prisma.badge.delete({ where: { id: badge.id } });

  revalidatePath("/admin/badges");
}

export async function moderateProjectVisibilityAction(formData: FormData): Promise<void> {
  const viewer = await requireAdmin();

  const parsed = projectVisibilityModerationSchema.safeParse({
    projectId: formData.get("projectId"),
    visibility: formData.get("visibility"),
  });
  if (!parsed.success) throw new Error("Visibilidade inválida.");

  const project = await prisma.project.findFirst({
    where: { id: parsed.data.projectId, schoolId: viewer.schoolId },
    select: {
      id: true,
      slug: true,
      schoolId: true,
      createdById: true,
      advisorId: true,
      status: true,
      visibility: true,
      allowFork: true,
      members: { select: { userId: true } },
    },
  });

  if (!project) throw new Error("Projeto não encontrado nesta escola.");

  const projectCtx = {
    id: project.id,
    schoolId: project.schoolId,
    createdById: project.createdById,
    advisorId: project.advisorId,
    status: project.status,
    visibility: project.visibility,
    allowFork: project.allowFork,
    memberIds: project.members.map((member) => member.userId),
  };

  if (
    !canChangeProjectVisibilityAsModerator(
      { id: viewer.id, role: viewer.role, schoolId: viewer.schoolId },
      projectCtx,
    )
  ) {
    throw new Error("Você não pode alterar a visibilidade deste projeto.");
  }

  await prisma.project.update({
    where: { id: project.id },
    data: { visibility: parsed.data.visibility },
  });

  await logAudit({
    schoolId: project.schoolId,
    actorId: viewer.id,
    action: "project.visibility_changed",
    entityType: "Project",
    entityId: project.id,
    metadata: { from: project.visibility, to: parsed.data.visibility },
  });

  revalidatePath("/admin/projects");
  revalidatePath(`/projects/${project.slug}`);
}
