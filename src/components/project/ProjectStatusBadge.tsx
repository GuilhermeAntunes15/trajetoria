import type { ProjectStatus } from "@prisma/client";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { STATUS_LABELS } from "@/lib/constants";

const tones: Record<ProjectStatus, BadgeTone> = {
  DRAFT: "neutral",
  SUBMITTED: "info",
  APPROVED: "success",
  CHANGES_REQUESTED: "warning",
  ARCHIVED: "neutral",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge tone={tones[status]}>{STATUS_LABELS[status]}</Badge>;
}
