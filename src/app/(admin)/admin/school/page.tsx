import type { Metadata } from "next";
import { SchoolForm } from "@/components/admin/SchoolForm";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { admin as adminCopy } from "@/lib/copy";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Escola" };
export const dynamic = "force-dynamic";

export default async function AdminSchoolPage() {
  const viewer = await requireRole(["ADMIN"], "/admin/school");

  const school = await prisma.school.findUniqueOrThrow({
    where: { id: viewer.schoolId },
    select: { name: true, description: true, city: true, state: true, logoUrl: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title={adminCopy.schoolTitle} description={adminCopy.schoolSubtitle} />
      <Card>
        <CardBody>
          <SchoolForm
            defaults={{
              name: school.name,
              description: school.description ?? "",
              city: school.city ?? "",
              state: school.state ?? "",
              logoUrl: school.logoUrl ?? "",
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
