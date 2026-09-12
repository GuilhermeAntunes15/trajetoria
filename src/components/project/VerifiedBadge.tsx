import { ShieldCheck } from "lucide-react";
import { project as projectCopy } from "@/lib/copy";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand",
        className,
      )}
    >
      <ShieldCheck size={14} strokeWidth={1.75} />
      {projectCopy.verifiedSeal}
    </span>
  );
}
