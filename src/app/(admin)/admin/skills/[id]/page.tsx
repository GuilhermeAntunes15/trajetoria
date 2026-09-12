import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SkillForm } from "@/components/admin/SkillForm";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { admin as adminCopy } from "@/lib/copy";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Editar competência" };
export const dynamic = "force-dynamic";

export default async function AdminSkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await requireRole(["ADMIN"], "/admin/skills");

  const skill = await prisma.skill.findFirst({
    where: { id, schoolId: viewer.schoolId },
    select: { id: true, name: true, category: true },
  });

  if (!skill) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title={skill.name} description={adminCopy.skillsSubtitle} />
      <Card>
        <CardBody>
          <SkillForm
            defaults={{ skillId: skill.id, name: skill.name, category: skill.category }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
