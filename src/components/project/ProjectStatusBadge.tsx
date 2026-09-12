import type { ProjectStatus } from "@prisma/client";
import { BadgeCheck, FileEdit, Hourglass, Inbox, PenLine } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { STATUS_LABELS } from "@/lib/constants";

const tones: Record<ProjectStatus, BadgeTone> = {
  DRAFT: "neutral",
  SUBMITTED: "info",
  APPROVED: "success",
  CHANGES_REQUESTED: "warning",
  ARCHIVED: "neutral",
};

const icons = {
  DRAFT: PenLine,
  SUBMITTED: Hourglass,
  APPROVED: BadgeCheck,
  CHANGES_REQUESTED: FileEdit,
  ARCHIVED: Inbox,
} as const;

/**
 * O estado do projeto é a informação que a equipe procura primeiro na página,
 * então ele vem como adesivo. Arquivado é a exceção: sai da leitura principal,
 * fica no chip discreto.
 */
export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const Icon = icons[status];

  return (
    <Badge tone={tones[status]} variant={status === "ARCHIVED" ? "soft" : "ink"}>
      <Icon size={14} strokeWidth={2.25} aria-hidden="true" />
      {STATUS_LABELS[status]}
    </Badge>
  );
}
