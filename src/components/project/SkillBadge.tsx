import { BadgeCheck } from "lucide-react";
import { project as projectCopy } from "@/lib/copy";

type SkillBadgeProps = {
  name: string;
  verified: boolean;
};

/**
 * Verificada (o professor confirmou lendo o projeto) vem sólida e com selo;
 * declarada vem em contorno tracejado. A diferença é de forma, não só de cor,
 * e o rótulo continua escrito por extenso.
 */
export function SkillBadge({ name, verified }: SkillBadgeProps) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-brand bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
        <BadgeCheck size={15} strokeWidth={2.25} aria-hidden="true" />
        {name}
        <span className="text-[0.68rem] font-medium opacity-80">{projectCopy.skillVerified}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-ink/30 px-3 py-1 text-sm font-medium text-muted">
      {name}
      <span className="text-[0.68rem] font-normal opacity-80">{projectCopy.skillDeclared}</span>
    </span>
  );
}
