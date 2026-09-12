import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setUserStatusAction } from "@/actions/admin.actions";
import { ResetPasswordForm } from "@/components/admin/ResetPasswordForm";
import { UserForm } from "@/components/admin/UserForm";
import { PageHeader } from "@/components/common/PageHeader";
import { SubmitButton } from "@/components/common/SubmitButton";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { admin as adminCopy } from "@/lib/copy";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Editar usuário" };
export const dynamic = "force-dynamic";

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await requireRole(["ADMIN"], "/admin/users");

  const [user, classrooms] = await Promise.all([
    prisma.user.findFirst({
      where: { id, schoolId: viewer.schoolId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        studentProfile: { select: { classroomId: true } },
      },
    }),
    prisma.classroom.findMany({
      where: { schoolId: viewer.schoolId },
      orderBy: [{ year: "desc" }, { name: "asc" }],
      select: { id: true, name: true, year: true },
    }),
  ]);

  if (!user) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title={adminCopy.editUserTitle}
        description={adminCopy.editUserSubtitle}
        actions={user.isActive ? null : <Badge tone="warning">{adminCopy.inactiveLabel}</Badge>}
      />

      <p className="text-sm text-muted">
        <Link href={`/u/${user.username}`} className="text-brand hover:text-brand-hover">
          @{user.username}
        </Link>
      </p>

      <Card>
        <CardBody>
          <UserForm
            mode="edit"
            classrooms={classrooms}
            defaults={{
              userId: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              classroomId: user.studentProfile?.classroomId ?? "",
            }}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink">{adminCopy.resetPasswordTitle}</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-sm text-muted">{adminCopy.resetPasswordSubtitle}</p>
          <ResetPasswordForm userId={user.id} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink">Acesso</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-sm text-muted">{adminCopy.neverDelete}</p>
          <form action={setUserStatusAction}>
            <input type="hidden" name="userId" value={user.id} />
            <input type="hidden" name="active" value={user.isActive ? "false" : "true"} />
            <SubmitButton size="sm" variant="secondary" pendingLabel="Salvando...">
              {user.isActive ? adminCopy.deactivateAction : adminCopy.reactivateAction}
            </SubmitButton>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
