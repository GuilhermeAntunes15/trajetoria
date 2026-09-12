import { ShieldCheck } from "lucide-react";
import { project as projectCopy } from "@/lib/copy";
import { cn } from "@/lib/utils";

/** Selo cheio: é a única marca da interface que diz "a escola conferiu isto". */
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-brand px-3 py-1 text-xs font-bold text-white",
        className,
      )}
    >
      <ShieldCheck size={15} strokeWidth={2.25} aria-hidden="true" />
      {projectCopy.verifiedSeal}
    </span>
  );
}
