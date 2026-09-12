import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeForm } from "@/components/admin/BadgeForm";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { BADGE_ICON_KEYS, type BadgeIconKey } from "@/lib/constants";
import { admin as adminCopy } from "@/lib/copy";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Editar badge" };
export const dynamic = "force-dynamic";

function toIconKey(value: string): BadgeIconKey {
  return (BADGE_ICON_KEYS as readonly string[]).includes(value) ? (value as BadgeIconKey) : "award";
}

export default async function AdminBadgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await requireRole(["ADMIN"], "/admin/badges");

  const badge = await prisma.badge.findFirst({
    where: { id, schoolId: viewer.schoolId },
    select: { id: true, name: true, description: true, icon: true, type: true },
  });

  if (!badge) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title={badge.name} description={adminCopy.badgesSubtitle} />
      <Card>
        <CardBody>
          <BadgeForm
            defaults={{
              badgeId: badge.id,
              name: badge.name,
              description: badge.description ?? "",
              icon: toIconKey(badge.icon),
              type: badge.type,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
