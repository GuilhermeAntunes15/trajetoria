import { BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { project as projectCopy } from "@/lib/copy";

type SkillBadgeProps = {
  name: string;
  verified: boolean;
};

export function SkillBadge({ name, verified }: SkillBadgeProps) {
  return (
    <Badge tone={verified ? "brand" : "neutral"}>
      {verified ? <BadgeCheck size={14} strokeWidth={1.75} /> : null}
      {name}
      <span className="text-[0.68rem] font-normal opacity-80">
        {verified ? projectCopy.skillVerified : projectCopy.skillDeclared}
      </span>
    </Badge>
  );
}
