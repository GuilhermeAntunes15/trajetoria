import Link from "next/link";
import { StudentAvatar } from "@/components/project/StudentAvatar";
import { SubmitButton } from "@/components/common/SubmitButton";

export type MemberListItem = {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  contribution: string | null;
  isOwner: boolean;
  profileHref: string | null;
};

type MemberListProps = {
  members: MemberListItem[];
  removeAction?: (formData: FormData) => Promise<void>;
};

export function MemberList({ members, removeAction }: MemberListProps) {
  return (
    <ul className="space-y-3">
      {members.map((member) => (
        <li key={member.id} className="flex items-start gap-3.5">
          <StudentAvatar name={member.name} avatarUrl={member.avatarUrl} size="md" />

          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2">
              <span className="font-display text-base leading-tight font-bold text-ink">
                {member.profileHref ? (
                  <Link href={member.profileHref} className="transition-colors hover:text-brand">
                    {member.name}
                  </Link>
                ) : (
                  member.name
                )}
              </span>
              <span className="rounded-full border border-line bg-canvas px-2 py-0.5 text-xs text-muted">
                {member.role}
              </span>
            </p>
            {member.contribution ? (
              <p className="mt-1 text-sm leading-relaxed text-muted">{member.contribution}</p>
            ) : null}
          </div>

          {removeAction && !member.isOwner ? (
            <form action={removeAction}>
              <input type="hidden" name="memberId" value={member.id} />
              <SubmitButton variant="ghost" size="sm" pendingLabel="Removendo...">
                Remover
              </SubmitButton>
            </form>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
