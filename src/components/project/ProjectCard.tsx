import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import type { ProjectStatus, Visibility } from "@prisma/client";
import { ProgressTrack } from "@/components/common/decor";
import { ProjectStatusBadge } from "@/components/project/ProjectStatusBadge";
import { VisibilityBadge } from "@/components/project/VisibilityBadge";
import { STATUS_LABELS } from "@/lib/constants";
import { project as projectCopy } from "@/lib/copy";
import { cn } from "@/lib/utils";

export type ProjectCardData = {
  slug: string;
  title: string;
  summary: string;
  status: ProjectStatus;
  visibility: Visibility;
  year: number;
  area: string | null;
  eventName?: string | null;
  memberCount?: number;
};

/**
 * Quanto do caminho até a validação o projeto já andou. Não é pontuação nem
 * comparação entre pessoas: é o mesmo projeto olhando para o próprio estado.
 */
const PROGRESS: Record<ProjectStatus, number | null> = {
  DRAFT: 25,
  CHANGES_REQUESTED: 45,
  SUBMITTED: 60,
  APPROVED: 100,
  ARCHIVED: null,
};

const PROGRESS_COLOR: Record<ProjectStatus, string> = {
  DRAFT: "var(--color-lp-sun)",
  CHANGES_REQUESTED: "var(--color-lp-tangerine)",
  SUBMITTED: "var(--color-info)",
  APPROVED: "var(--color-brand)",
  ARCHIVED: "var(--color-line)",
};

export function projectProgress(status: ProjectStatus): number | null {
  return PROGRESS[status];
}

type ProjectCardProps = {
  project: ProjectCardData;
  /** Barra do rascunho até a validação. Usada onde o projeto é seu. */
  showProgress?: boolean;
  /** Etiqueta colada no topo do cartão (ex.: "Destaque"). */
  ribbon?: string;
  className?: string;
};

export function ProjectCard({ project, showProgress, ribbon, className }: ProjectCardProps) {
  const progress = showProgress ? PROGRESS[project.status] : null;

  return (
    <article
      className={cn(
        "lp-sticker lp-sticker-flat lp-lift-soft relative flex h-full flex-col bg-surface",
        className,
      )}
    >
      {ribbon ? (
        <p className="absolute -top-3 left-4 z-10 rounded-full border-2 border-ink bg-lp-sun px-2.5 py-0.5 text-[0.68rem] font-bold text-ink">
          {ribbon}
        </p>
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <ProjectStatusBadge status={project.status} />
          <VisibilityBadge visibility={project.visibility} />
          {project.area ? <span className="text-xs text-muted">{project.area}</span> : null}
        </div>

        <div className="space-y-1">
          <h3 className="font-display text-lg leading-snug font-bold text-ink">
            <Link href={`/projects/${project.slug}`} className="transition-colors hover:text-brand">
              {project.title}
            </Link>
          </h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted">{project.summary}</p>
        </div>

        {progress !== null ? (
          <div className="space-y-1.5 pt-1">
            <ProgressTrack
              value={progress}
              color={PROGRESS_COLOR[project.status]}
              label={`${projectCopy.progressLabel}: ${STATUS_LABELS[project.status]}`}
            />
            <p className="text-[0.7rem] font-semibold tracking-[0.08em] text-muted uppercase">
              {projectCopy.progressLabel}
            </p>
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} strokeWidth={2} aria-hidden="true" />
            {project.year}
          </span>
          {typeof project.memberCount === "number" ? (
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} strokeWidth={2} aria-hidden="true" />
              {project.memberCount === 1 ? "1 integrante" : `${project.memberCount} integrantes`}
            </span>
          ) : null}
          {project.eventName ? <span>{project.eventName}</span> : null}
        </div>
      </div>
    </article>
  );
}
