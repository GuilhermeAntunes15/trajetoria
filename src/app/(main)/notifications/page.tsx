import type { Metadata } from "next";
import {
  markAllNotificationsRead,
  markNotificationRead,
  openNotification,
} from "@/actions/notification.actions";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { SubmitButton } from "@/components/common/SubmitButton";
import { Badge } from "@/components/ui/Badge";
import { empty, notifications as notificationsCopy } from "@/lib/copy";
import { formatRelative } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Notificações" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const viewer = await requireUser("/notifications");

  const notifications = await prisma.notification.findMany({
    where: { userId: viewer.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, title: true, body: true, link: true, readAt: true, createdAt: true },
  });

  const unreadCount = notifications.filter((notification) => notification.readAt === null).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title={notificationsCopy.title}
        description={notificationsCopy.subtitle}
        actions={
          unreadCount > 0 ? (
            <form action={markAllNotificationsRead}>
              <SubmitButton size="sm" variant="secondary" pendingLabel="Salvando...">
                {notificationsCopy.markAll}
              </SubmitButton>
            </form>
          ) : null
        }
      />

      {notifications.length === 0 ? (
        <EmptyState title={empty.notifications.title} text={empty.notifications.text} />
      ) : (
        <ul className="space-y-2">
          {notifications.map((notification) => {
            const unread = notification.readAt === null;

            return (
              <li
                key={notification.id}
                className={cn(
                  "rounded-[var(--radius-card)] border bg-surface p-4",
                  unread ? "border-brand/40" : "border-line",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium text-ink">{notification.title}</p>
                    {notification.body ? (
                      <p className="text-sm text-muted">{notification.body}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {unread ? <Badge tone="brand">{notificationsCopy.unread}</Badge> : null}
                    <span className="text-xs text-muted">
                      {formatRelative(notification.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {notification.link ? (
                    <form action={openNotification}>
                      <input type="hidden" name="notificationId" value={notification.id} />
                      <SubmitButton size="sm" variant="ghost" pendingLabel="Abrindo...">
                        {notificationsCopy.open}
                      </SubmitButton>
                    </form>
                  ) : null}

                  {unread ? (
                    <form action={markNotificationRead}>
                      <input type="hidden" name="notificationId" value={notification.id} />
                      <SubmitButton size="sm" variant="ghost" pendingLabel="Salvando...">
                        {notificationsCopy.markOne}
                      </SubmitButton>
                    </form>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
