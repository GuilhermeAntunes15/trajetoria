import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { ProjectForm } from "@/components/project/ProjectForm";
import { Card, CardBody } from "@/components/ui/Card";
import { fork as forkCopy } from "@/lib/copy";
import { canCreateProject, canForkProject } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { requireOnboarded } from "@/lib/session";

export const metadata: Metadata = { title: "Continuar projeto" };
export const dynamic = "force-dynamic";

export default async function ForkProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const viewer = await requireOnboarded(`/projects/${slug}/fork`);

  const project = await prisma.project.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      problem: true,
      solution: true,
      status: true,
      visibility: true,
      allowFork: true,
      schoolId: true,
      createdById: true,
      advisorId: true,
      members: { select: { userId: true } },
    },
  });

  if (!project) notFound();

  const permissionViewer = { id: viewer.id, role: viewer.role, schoolId: viewer.schoolId };

  const projectCtx = {
    id: project.id,
    schoolId: project.schoolId,
    createdById: project.createdById,
    advisorId: project.advisorId,
    status: project.status,
    visibility: project.visibility,
    allowFork: project.allowFork,
    memberIds: project.members.map((member) => member.userId),
  };

  if (!canForkProject(permissionViewer, projectCtx)) notFound();
  if (!canCreateProject(permissionViewer)) redirect(`/projects/${slug}`);

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
      <PageHeader title={forkCopy.title} description={forkCopy.subtitle} />
      <Card>
        <CardBody>
          <ProjectForm
            mode="create"
            events={events}
            teachers={teachers}
            defaults={{
              title: forkCopy.titleSuffix(project.title),
              problem: project.problem ?? "",
              solution: project.solution ?? "",
              projectDate: new Date().toISOString().slice(0, 10),
              parentProjectId: project.id,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
