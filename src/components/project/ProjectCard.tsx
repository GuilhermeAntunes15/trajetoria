import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import type { ProjectStatus, Visibility } from "@prisma/client";
import { ProjectStatusBadge } from "@/components/project/ProjectStatusBadge";
import { VisibilityBadge } from "@/components/project/VisibilityBadge";
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

export function ProjectCard({ project, className }: { project: ProjectCardData; className?: string }) {
  return (
    <article
      className={cn(
        "group rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)] transition-colors hover:border-brand/40",
        className,
      )}
    >
      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <ProjectStatusBadge status={project.status} />
          <VisibilityBadge visibility={project.visibility} />
          {project.area ? <span className="text-xs text-muted">{project.area}</span> : null}
        </div>

        <div className="space-y-1">
          <h3 className="text-base leading-snug font-semibold text-ink">
            <Link href={`/projects/${project.slug}`} className="transition-colors hover:text-brand">
              {project.title}
            </Link>
          </h3>
          <p className="line-clamp-3 text-sm text-muted">{project.summary}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} strokeWidth={1.75} />
            {project.year}
          </span>
          {typeof project.memberCount === "number" ? (
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} strokeWidth={1.75} />
              {project.memberCount === 1 ? "1 integrante" : `${project.memberCount} integrantes`}
            </span>
          ) : null}
          {project.eventName ? <span>{project.eventName}</span> : null}
        </div>
      </div>
    </article>
  );
}
