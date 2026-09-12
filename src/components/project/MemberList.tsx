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
        <li key={member.id} className="flex items-start gap-3">
          <StudentAvatar name={member.name} avatarUrl={member.avatarUrl} size="sm" />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">
              {member.profileHref ? (
                <Link href={member.profileHref} className="hover:text-brand">
                  {member.name}
                </Link>
              ) : (
                member.name
              )}
              <span className="font-normal text-muted"> — {member.role}</span>
            </p>
            {member.contribution ? (
              <p className="text-sm text-muted">{member.contribution}</p>
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
