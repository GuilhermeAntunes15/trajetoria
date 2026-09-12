import type { Visibility } from "@prisma/client";
import { Globe, Lock, School } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { VISIBILITY_LABELS } from "@/lib/constants";

const icons = {
  PRIVATE: Lock,
  SCHOOL: School,
  PUBLIC: Globe,
} as const;

/** Fica discreto de propósito: quem vê o projeto é metadado, não estado. */
export function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  const Icon = icons[visibility];
  return (
    <Badge tone="neutral">
      <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
      {VISIBILITY_LABELS[visibility]}
    </Badge>
  );
}
