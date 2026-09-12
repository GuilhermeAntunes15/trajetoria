import type { Metadata } from "next";
import type { Prisma, ProjectStatus } from "@prisma/client";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { STATUS_LABELS } from "@/lib/constants";
import { empty } from "@/lib/copy";
import { getViewer } from "@/lib/session";
import { countVisibleProjects, listVisibleProjects } from "@/server/services/project.service";

export const metadata: Metadata = { title: "Projetos" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

const STATUS_FILTERS: ProjectStatus[] = ["DRAFT", "SUBMITTED", "APPROVED", "CHANGES_REQUESTED"];
const MINE_STATUS_FILTERS: ProjectStatus[] = [...STATUS_FILTERS, "ARCHIVED"];

type SearchParams = { q?: string; scope?: string; status?: string; page?: string };

function readPage(value: string | undefined): number {
  const page = Number(value ?? "1");
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const viewer = await getViewer();

  const query = (params.q ?? "").trim().slice(0, 80);
  const scope = viewer && params.scope === "mine" ? "mine" : "all";
  const statusOptions = scope === "mine" ? MINE_STATUS_FILTERS : STATUS_FILTERS;
  const status = statusOptions.includes(params.status as ProjectStatus)
    ? (params.status as ProjectStatus)
    : null;
  const page = readPage(params.page);

  const filters: Prisma.ProjectWhereInput = {
    ...(query ? { title: { contains: query, mode: "insensitive" as const } } : {}),
    ...(scope === "mine" && viewer ? { members: { some: { userId: viewer.id } } } : {}),
    ...(status ? { status } : {}),
  };

  const includeArchived = scope === "mine";

  const [projects, total] = await Promise.all([
    listVisibleProjects(viewer, {
      where: filters,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      includeArchived,
    }),
    countVisibleProjects(viewer, { where: filters, includeArchived }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (target: number) => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (scope === "mine") search.set("scope", "mine");
    if (status) search.set("status", status);
    if (target > 1) search.set("page", String(target));
    const queryString = search.toString();
    return queryString ? `/projects?${queryString}` : "/projects";
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Acervo vivo"
        accent="var(--color-lp-tangerine)"
        title="Projetos"
        description="O que foi construído na escola, documentado por quem construiu."
        actions={
          viewer?.role === "STUDENT" ? (
            <ButtonLink href="/projects/new" size="sm">
              + Novo projeto
            </ButtonLink>
          ) : null
        }
      />

      <form
        method="get"
        action="/projects"
        className="lp-sticker lp-sticker-soft grid gap-3 bg-surface p-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
      >
        <div className="space-y-1.5">
          <Label htmlFor="q">Buscar por título</Label>
          <Input id="q" name="q" defaultValue={query} maxLength={80} placeholder="Ex.: enchentes" />
        </div>

        {viewer ? (
          <div className="space-y-1.5">
            <Label htmlFor="scope">Mostrar</Label>
            <Select id="scope" name="scope" defaultValue={scope}>
              <option value="all">Todos da escola</option>
              <option value="mine">Meus projetos</option>
            </Select>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="status">Situação</Label>
          <Select key={status ?? ""} id="status" name="status" defaultValue={status ?? ""}>
            <option value="">Todas</option>
            {statusOptions.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </Select>
        </div>

        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
      </form>

      {projects.length === 0 ? (
        <EmptyState
          title={empty.projects.title}
          text={empty.projects.text}
          actionLabel={viewer?.role === "STUDENT" ? empty.portfolio.action : undefined}
          actionHref={viewer?.role === "STUDENT" ? "/projects/new" : undefined}
          illustration="notebook"
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                showProgress={scope === "mine"}
              />
            ))}
          </div>
          <Pagination page={page} pageCount={pageCount} buildHref={buildHref} />
        </>
      )}
    </div>
  );
}
