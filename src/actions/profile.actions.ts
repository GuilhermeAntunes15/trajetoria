"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { actions as actionsCopy } from "@/lib/copy";
import { getViewer } from "@/lib/session";
import { privacySchema, profileSchema } from "@/lib/validation/profile.schema";

export type ProfileState = { error?: string; success?: string };

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?redirectTo=%2Fsettings");

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    avatarUrl: formData.get("avatarUrl") ?? "",
    bio: formData.get("bio") ?? "",
    course: formData.get("course") ?? "",
    classroomId: formData.get("classroomId") ?? "",
    gradeYear: formData.get("gradeYear") ?? "",
    interests: formData.getAll("interests"),
    subject: formData.get("subject") ?? "",
    title: formData.get("title") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos do formulário." };
  }

  const data = parsed.data;

  let classroomId: string | null = null;
  if (viewer.role === "STUDENT" && data.classroomId) {
    const classroom = await prisma.classroom.findFirst({
      where: { id: data.classroomId, schoolId: viewer.schoolId },
      select: { id: true },
    });
    if (!classroom) return { error: "Turma inválida para a sua escola." };
    classroomId = classroom.id;
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: viewer.id },
      data: {
        name: data.name,
        bio: data.bio || null,
        avatarUrl: data.avatarUrl || null,
      },
    });

    if (viewer.role === "STUDENT") {
      const profileData = {
        course: data.course || null,
        gradeYear: data.gradeYear || null,
        classroomId,
        interests: data.interests,
      };
      await tx.studentProfile.upsert({
        where: { userId: viewer.id },
        create: { userId: viewer.id, ...profileData },
        update: profileData,
      });
    }

    if (viewer.role === "TEACHER") {
      const profileData = { subject: data.subject || null, title: data.title || null };
      await tx.teacherProfile.upsert({
        where: { userId: viewer.id },
        create: { userId: viewer.id, ...profileData },
        update: profileData,
      });
    }
  });

  revalidatePath("/settings");
  revalidatePath(`/u/${viewer.username}`);
  revalidatePath("/dashboard");

  return { success: actionsCopy.profileSaved };
}

export async function updatePrivacy(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?redirectTo=%2Fsettings");

  const parsed = privacySchema.safeParse({
    profileVisibility: formData.get("profileVisibility"),
  });

  if (!parsed.success) {
    return { error: "Selecione uma opção de visibilidade válida." };
  }

  await prisma.user.update({
    where: { id: viewer.id },
    data: { profileVisibility: parsed.data.profileVisibility },
  });

  revalidatePath("/settings");
  revalidatePath(`/u/${viewer.username}`);

  return { success: actionsCopy.profileSaved };
}
