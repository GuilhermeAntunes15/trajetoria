"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/session";
import { onboardingSchema } from "@/lib/validation/onboarding.schema";

export type OnboardingState = { error?: string };

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = onboardingSchema.safeParse({
    name: formData.get("name"),
    avatarUrl: formData.get("avatarUrl") ?? "",
    course: formData.get("course") ?? "",
    classroomId: formData.get("classroomId") ?? "",
    gradeYear: formData.get("gradeYear") ?? "",
    bio: formData.get("bio") ?? "",
    interests: formData.getAll("interests"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos do formulário." };
  }

  const data = parsed.data;
  let classroomId: string | null = null;

  if (data.classroomId) {
    const classroom = await prisma.classroom.findFirst({
      where: { id: data.classroomId, schoolId: viewer.schoolId },
      select: { id: true },
    });
    if (!classroom) {
      return { error: "Turma inválida para a sua escola." };
    }
    classroomId = classroom.id;
  }

  const profileData = {
    course: data.course ? data.course : null,
    gradeYear: data.gradeYear ? data.gradeYear : null,
    classroomId,
    interests: data.interests,
  };

  await prisma.$transaction([
    prisma.user.update({
      where: { id: viewer.id },
      data: {
        name: data.name,
        avatarUrl: data.avatarUrl || null,
        bio: data.bio ? data.bio : null,
        mustCompleteOnboarding: false,
      },
    }),
    prisma.studentProfile.upsert({
      where: { userId: viewer.id },
      create: { userId: viewer.id, ...profileData },
      update: profileData,
    }),
  ]);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
