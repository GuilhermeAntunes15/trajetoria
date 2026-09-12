import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma, ProjectStatus } from "@prisma/client";
import { moderateProjectVisibilityAction } from "@/actions/admin.actions";
import { archiveProjectAction, unarchiveProjectAction } from "@/actions/validation.actions";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { SubmitButton } from "@/components/common/SubmitButton";
import { ProjectStatusBadge } from "@/components/project/ProjectStatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { STATUS_LABELS, VISIBILITY_LABELS } from "@/lib/constants";
import { admin as adminCopy, review as reviewCopy } from "@/lib/copy";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Projetos da escola" };
export const dynamic = "force-dynamic";

const STATUSES: ProjectStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "CHANGES_REQUESTED",
  "ARCHIVED",
];

function parseStatus(value: string | undefined): ProjectStatus | null {
  return STATUSES.includes(value as ProjectStatus) ? (value as ProjectStatus) : null;
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; year?: string }>;
}) {
  const viewer = await requireRole(["ADMIN"], "/admin/projects");
  const { q, status, year } = await searchParams;

  const query = (q ?? "").trim().slice(0, 80);
  const statusFilter = parseStatus(status);
  const yearFilter = /^\d{4}$/.test(year ?? "") ? Number(year) : null;

  const where: Prisma.ProjectWhereInput = {
    schoolId: viewer.schoolId,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(yearFilter ? { year: yearFilter } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [projects, years] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      take: 100,
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        visibility: true,
        year: true,
        updatedAt: true,
        createdBy: { select: { name: true } },
        _count: { select: { members: true } },
      },
    }),
    prisma.project.groupBy({
      by: ["year"],
      where: { schoolId: viewer.schoolId },
      orderBy: { year: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader title={adminCopy.projectsTitle} description={adminCopy.projectsSubtitle} />

      <form
        method="get"
        className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="q">Buscar</Label>
          <Input id="q" name="q" defaultValue={query} maxLength={80} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">Situação</Label>
          <Select id="status" name="status" defaultValue={statusFilter ?? ""}>
            <option value="">{adminCopy.filterAll}</option>
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {STATUS_LABELS[option]}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="year">{adminCopy.filterYear}</Label>
          <Select id="year" name="year" defaultValue={yearFilter ? String(yearFilter) : ""}>
            <option value="">{adminCopy.filterAll}</option>
            {years.map((row) => (
              <option key={row.year} value={row.year}>
                {row.year}
              </option>
            ))}
          </Select>
        </div>

        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
      </form>

      {projects.length === 0 ? (
        <EmptyState title={adminCopy.projectsEmpty.title} text={adminCopy.projectsEmpty.text} />
      ) : (
        <ul className="space-y-2">
          {projects.map((project) => (
            <li
              key={project.id}
              className="space-y-3 rounded-[var(--radius-card)] border border-line bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="text-sm font-medium text-ink hover:text-brand"
                    >
                      {project.title}
                    </Link>
                    <ProjectStatusBadge status={project.status} />
                  </div>
                  <p className="text-xs text-muted">
                    {[
                      project.createdBy.name,
                      `${project.year}`,
                      project._count.members === 1
                        ? "1 integrante"
                        : `${project._count.members} integrantes`,
                      formatDate(project.updatedAt),
                    ].join(" · ")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-line pt-3 sm:flex-row sm:items-end sm:justify-between">
                <form
                  action={moderateProjectVisibilityAction}
                  className="flex flex-wrap items-end gap-2"
                >
                  <input type="hidden" name="projectId" value={project.id} />
                  <div className="space-y-1.5">
                    <Label htmlFor={`visibility-${project.id}`}>Visibilidade</Label>
                    <Select
                      id={`visibility-${project.id}`}
                      name="visibility"
                      defaultValue={project.visibility}
                    >
                      {(["PRIVATE", "SCHOOL", "PUBLIC"] as const).map((value) => (
                        <option key={value} value={value}>
                          {VISIBILITY_LABELS[value]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <SubmitButton size="sm" variant="secondary" pendingLabel="Salvando...">
                    {adminCopy.visibilityAction}
                  </SubmitButton>
                </form>

                <form
                  action={
                    project.status === "ARCHIVED" ? unarchiveProjectAction : archiveProjectAction
                  }
                >
                  <input type="hidden" name="projectId" value={project.id} />
                  <SubmitButton size="sm" variant="secondary" pendingLabel="Salvando...">
                    {project.status === "ARCHIVED"
                      ? reviewCopy.unarchiveAction
                      : reviewCopy.archiveAction}
                  </SubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
