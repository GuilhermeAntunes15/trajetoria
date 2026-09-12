import Link from "next/link";
import { Bell } from "lucide-react";
import { prisma } from "@/lib/prisma";

export async function NotificationBell({ userId }: { userId: string }) {
  const unread = await prisma.notification.count({
    where: { userId, readAt: null },
  });

  return (
    <Link
      href="/notifications"
      aria-label={unread > 0 ? `Notificações: ${unread} não lidas` : "Notificações"}
      className="relative inline-flex size-9 items-center justify-center rounded-[var(--radius-control)] border border-line bg-surface text-muted transition-colors hover:text-ink"
    >
      <Bell size={18} strokeWidth={1.75} />
      {unread > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[0.65rem] font-medium text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
