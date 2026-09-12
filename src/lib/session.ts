import { cache } from "react";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type Viewer = {
  id: string;
  name: string;
  username: string;
  role: Role;
  schoolId: string;
  avatarUrl: string | null;
  mustCompleteOnboarding: boolean;
};

export const getViewer = cache(async (): Promise<Viewer | null> => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      schoolId: true,
      avatarUrl: true,
      isActive: true,
      mustCompleteOnboarding: true,
    },
  });

  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    schoolId: user.schoolId,
    avatarUrl: user.avatarUrl,
    mustCompleteOnboarding: user.mustCompleteOnboarding,
  };
});

export async function requireUser(redirectTo = "/dashboard"): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }
  return viewer;
}

export async function requireRole(roles: Role[], redirectTo = "/dashboard"): Promise<Viewer> {
  const viewer = await requireUser(redirectTo);
  if (!roles.includes(viewer.role)) {
    redirect("/dashboard");
  }
  return viewer;
}

export async function requireOnboarded(redirectTo = "/dashboard"): Promise<Viewer> {
  const viewer = await requireUser(redirectTo);
  if (viewer.role === "STUDENT" && viewer.mustCompleteOnboarding) {
    redirect("/onboarding");
  }
  return viewer;
}
