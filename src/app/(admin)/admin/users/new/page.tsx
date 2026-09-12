import type { Metadata } from "next";
import { PageHeader } from "@/components/common/PageHeader";
import { UserForm } from "@/components/admin/UserForm";
import { Card, CardBody } from "@/components/ui/Card";
import { admin as adminCopy } from "@/lib/copy";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Novo usuário" };
export const dynamic = "force-dynamic";

export default async function NewAdminUserPage() {
  const viewer = await requireRole(["ADMIN"], "/admin/users/new");

  const classrooms = await prisma.classroom.findMany({
    where: { schoolId: viewer.schoolId },
    orderBy: [{ year: "desc" }, { name: "asc" }],
    select: { id: true, name: true, year: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title={adminCopy.createUserTitle} description={adminCopy.createUserSubtitle} />
      <Card>
        <CardBody>
          <UserForm mode="create" classrooms={classrooms} />
        </CardBody>
      </Card>
    </div>
  );
}
