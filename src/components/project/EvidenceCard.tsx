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

/** Cada tipo de evidência tem seu bloco de cor — o rótulo continua escrito. */
const tints: Record<EvidenceType, string> = {
  IMAGE: "var(--color-lp-sky)",
  VIDEO: "var(--color-lp-tangerine)",
  DOCUMENT: "var(--color-lp-paper)",
  LINK: "var(--color-lp-mint)",
  GITHUB: "var(--color-lp-mint)",
  WEBSITE: "var(--color-lp-sky)",
  PRESENTATION: "var(--color-lp-sun)",
  OTHER: "var(--color-lp-paper)",
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
    <div className="lp-sticker lp-sticker-soft bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3.5">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-[10px] border-2 border-ink text-ink"
            style={{ backgroundColor: tints[evidence.type] }}
            aria-hidden
          >
            <Icon size={20} strokeWidth={2.25} />
          </span>
          <div className="min-w-0">
            <p className="font-display text-base leading-tight font-bold text-ink">
              {evidence.title}
            </p>
            <p className="mt-0.5 text-xs font-semibold tracking-[0.06em] text-muted uppercase">
              {EVIDENCE_TYPE_LABELS[evidence.type]}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-hover"
            >
              Abrir
              <ExternalLink size={16} strokeWidth={2} aria-hidden="true" />
            </a>
          ) : null}
          {actions}
        </div>
      </div>

      {evidence.description ? (
        <p className="mt-2.5 text-sm leading-relaxed whitespace-pre-wrap text-muted">
          {evidence.description}
        </p>
      ) : null}
    </div>
  );
}
