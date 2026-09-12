"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeRedirect } from "@/lib/redirect";
import { getViewer } from "@/lib/session";

export async function markAllNotificationsRead(): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?redirectTo=%2Fnotifications");

  await prisma.notification.updateMany({
    where: { userId: viewer.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/notifications");
}

export async function markNotificationRead(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?redirectTo=%2Fnotifications");

  const id = String(formData.get("notificationId") ?? "");
  if (!id) throw new Error("Notificação inválida.");

  await prisma.notification.updateMany({
    where: { id, userId: viewer.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/notifications");
}

export async function openNotification(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?redirectTo=%2Fnotifications");

  const id = String(formData.get("notificationId") ?? "");
  if (!id) throw new Error("Notificação inválida.");

  const notification = await prisma.notification.findFirst({
    where: { id, userId: viewer.id },
    select: { id: true, link: true },
  });

  if (!notification) throw new Error("Notificação não encontrada.");

  await prisma.notification.updateMany({
    where: { id: notification.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/notifications");
  redirect(safeRedirect(notification.link, "/notifications"));
}
