import type { Metadata } from "next";
import Link from "next/link";
import { deleteSkillAction } from "@/actions/admin.actions";
import { RestoreSkillsForm, SkillForm } from "@/components/admin/SkillForm";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { SubmitButton } from "@/components/common/SubmitButton";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SKILL_CATEGORY_LABELS } from "@/lib/constants";
import { admin as adminCopy } from "@/lib/copy";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Competências" };
export const dynamic = "force-dynamic";

export default async function AdminSkillsPage() {
  const viewer = await requireRole(["ADMIN"], "/admin/skills");

  const skills = await prisma.skill.findMany({
    where: { schoolId: viewer.schoolId },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      category: true,
      _count: { select: { projectSkills: true } },
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader title={adminCopy.skillsTitle} description={adminCopy.skillsSubtitle} />

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink">{adminCopy.newSkill}</h2>
        </CardHeader>
        <CardBody className="space-y-6">
          <SkillForm />
          <div className="border-t border-line pt-4">
            <RestoreSkillsForm />
          </div>
        </CardBody>
      </Card>

      {skills.length === 0 ? (
        <EmptyState title={adminCopy.skillsEmpty.title} text={adminCopy.skillsEmpty.text} />
      ) : (
        <ul className="space-y-2">
          {skills.map((skill) => (
            <li
              key={skill.id}
              className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-ink">{skill.name}</p>
                  <Badge tone="neutral">{SKILL_CATEGORY_LABELS[skill.category]}</Badge>
                </div>
                <p className="text-xs text-muted">
                  {skill._count.projectSkills === 1
                    ? "1 projeto"
                    : `${skill._count.projectSkills} projetos`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/skills/${skill.id}`}
                  className="text-sm text-brand hover:text-brand-hover"
                >
                  Editar
                </Link>
                {skill._count.projectSkills === 0 ? (
                  <form action={deleteSkillAction}>
                    <input type="hidden" name="skillId" value={skill.id} />
                    <SubmitButton variant="ghost" size="sm" pendingLabel="Removendo...">
                      {adminCopy.deleteAction}
                    </SubmitButton>
                  </form>
                ) : (
                  <span className="text-xs text-muted">{adminCopy.skillInUse}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
