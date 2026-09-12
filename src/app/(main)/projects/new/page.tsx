import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { ProjectForm } from "@/components/project/ProjectForm";
import { Card, CardBody } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { requireOnboarded } from "@/lib/session";

export const metadata: Metadata = { title: "Novo projeto" };
export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const viewer = await requireOnboarded("/projects/new");

  if (viewer.role !== "STUDENT") {
    redirect("/projects");
  }

  const [events, teachers] = await Promise.all([
    prisma.event.findMany({
      where: { schoolId: viewer.schoolId },
      orderBy: { startDate: "desc" },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: { schoolId: viewer.schoolId, role: "TEACHER", isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Novo projeto"
        description="Comece pelo essencial. O projeto nasce como rascunho e você pode voltar quando quiser."
      />
      <Card>
        <CardBody>
          <ProjectForm
            mode="create"
            events={events}
            teachers={teachers}
            defaults={{ projectDate: new Date().toISOString().slice(0, 10) }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
