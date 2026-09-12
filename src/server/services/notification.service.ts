import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type NotifyInput = {
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
  actorId?: string | null;
};

export async function notify(userIds: string[], input: NotifyInput): Promise<number> {
  const recipients = [...new Set(userIds)].filter((id) => id && id !== input.actorId);
  if (recipients.length === 0) return 0;

  const result = await prisma.notification.createMany({
    data: recipients.map((userId) => ({
      userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
    })),
  });

  return result.count;
}
