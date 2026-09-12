import type { EvidenceType } from "@prisma/client";
import {
  ExternalLink,
  FileText,
  GitBranch,
  Globe,
  Image as ImageIcon,
  Link2,
  Paperclip,
  Presentation,
  Video,
  type LucideIcon,
} from "lucide-react";
import { EVIDENCE_TYPE_LABELS } from "@/lib/constants";

const icons: Record<EvidenceType, LucideIcon> = {
  IMAGE: ImageIcon,
  VIDEO: Video,
  DOCUMENT: FileText,
  LINK: Link2,
  GITHUB: GitBranch,
  WEBSITE: Globe,
  PRESENTATION: Presentation,
  OTHER: Paperclip,
};

export type EvidenceCardData = {
  id: string;
  type: EvidenceType;
  title: string;
  description: string | null;
  url: string | null;
  fileUrl: string | null;
};

export function EvidenceCard({
  evidence,
  actions,
}: {
  evidence: EvidenceCardData;
  actions?: React.ReactNode;
}) {
  const Icon = icons[evidence.type];
  const href = evidence.url ?? evidence.fileUrl;

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 text-muted">
            <Icon size={18} strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">{evidence.title}</p>
            <p className="text-xs text-muted">{EVIDENCE_TYPE_LABELS[evidence.type]}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-hover"
            >
              Abrir
              <ExternalLink size={16} strokeWidth={1.75} />
            </a>
          ) : null}
          {actions}
        </div>
      </div>

      {evidence.description ? (
        <p className="mt-2 text-sm whitespace-pre-wrap text-muted">{evidence.description}</p>
      ) : null}
    </div>
  );
}
