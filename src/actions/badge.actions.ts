"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { badges as badgesCopy } from "@/lib/copy";
import { getViewer } from "@/lib/session";
import { grantBadgeSchema, revokeBadgeSchema } from "@/lib/validation/badge.schema";
import { BadgeError, grantBadge, revokeBadge } from "@/server/services/badge.service";

export type BadgeFormState = { error?: string; success?: string };

export async function grantBadgeAction(
  _prev: BadgeFormState,
  formData: FormData,
): Promise<BadgeFormState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = grantBadgeSchema.safeParse({
    userId: formData.get("userId"),
    badgeId: formData.get("badgeId"),
    projectId: formData.get("projectId") ?? "",
    eventId: formData.get("eventId") ?? "",
    note: formData.get("note") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos do formulário." };
  }

  try {
    const { studentUsername } = await grantBadge(viewer, parsed.data);
    revalidatePath(`/u/${studentUsername}`);
    revalidatePath("/dashboard");
    return { success: badgesCopy.granted };
  } catch (error) {
    if (error instanceof BadgeError) return { error: error.message };
    throw error;
  }
}

export async function revokeBadgeAction(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = revokeBadgeSchema.safeParse({ userBadgeId: formData.get("userBadgeId") });
  if (!parsed.success) throw new Error("Badge inválida.");

  const username = await revokeBadge(viewer, parsed.data.userBadgeId);

  revalidatePath(`/u/${username}`);
  revalidatePath("/dashboard");
}
