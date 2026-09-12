import type { Metadata } from "next";
import Link from "next/link";
import { deleteBadgeAction } from "@/actions/admin.actions";
import { BadgeForm } from "@/components/admin/BadgeForm";
import { BadgeCard } from "@/components/badge/BadgeCard";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { SubmitButton } from "@/components/common/SubmitButton";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { BADGE_TYPE_LABELS } from "@/lib/constants";
import { admin as adminCopy } from "@/lib/copy";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Badges" };
export const dynamic = "force-dynamic";

export default async function AdminBadgesPage() {
  const viewer = await requireRole(["ADMIN"], "/admin/badges");

  const badges = await prisma.badge.findMany({
    where: { schoolId: viewer.schoolId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      icon: true,
      type: true,
      _count: { select: { userBadges: true } },
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader title={adminCopy.badgesTitle} description={adminCopy.badgesSubtitle} />

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink">{adminCopy.newBadge}</h2>
        </CardHeader>
        <CardBody>
          <BadgeForm />
        </CardBody>
      </Card>

      {badges.length === 0 ? (
        <EmptyState title={adminCopy.badgesEmpty.title} text={adminCopy.badgesEmpty.text} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {badges.map((badge) => (
            <li key={badge.id}>
              <BadgeCard
                badge={{
                  name: badge.name,
                  description: badge.description,
                  icon: badge.icon,
                }}
                actions={
                  <div className="flex flex-col items-end gap-1">
                    <Link
                      href={`/admin/badges/${badge.id}`}
                      className="text-sm text-brand hover:text-brand-hover"
                    >
                      Editar
                    </Link>
                    {badge._count.userBadges === 0 ? (
                      <form action={deleteBadgeAction}>
                        <input type="hidden" name="badgeId" value={badge.id} />
                        <SubmitButton variant="ghost" size="sm" pendingLabel="Removendo...">
                          {adminCopy.deleteAction}
                        </SubmitButton>
                      </form>
                    ) : null}
                  </div>
                }
                meta={
                  <>
                    {BADGE_TYPE_LABELS[badge.type]}
                    {" · "}
                    {badge._count.userBadges === 1
                      ? "1 concessão"
                      : `${badge._count.userBadges} concessões`}
                  </>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
