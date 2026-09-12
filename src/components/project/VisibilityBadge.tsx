import type { Visibility } from "@prisma/client";
import { Globe, Lock, School } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { VISIBILITY_LABELS } from "@/lib/constants";

const icons = {
  PRIVATE: Lock,
  SCHOOL: School,
  PUBLIC: Globe,
} as const;

export function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  const Icon = icons[visibility];
  return (
    <Badge tone="neutral">
      <Icon size={14} strokeWidth={1.75} />
      {VISIBILITY_LABELS[visibility]}
    </Badge>
  );
}
