import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { ProjectForm } from "@/components/project/ProjectForm";
import { Card, CardBody } from "@/components/ui/Card";
import { AREAS } from "@/lib/constants";
import { canEditProjectContent } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Editar projeto" };
export const dynamic = "force-dynamic";

type Area = (typeof AREAS)[number];

function toArea(value: string | null): Area | "" {
  return (AREAS as readonly string[]).includes(value ?? "") ? (value as Area) : "";
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const viewer = await requireUser(`/projects/${slug}/edit`);

  const project = await prisma.project.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      summary: true,
      description: true,
      problem: true,
      solution: true,
      learnings: true,
      area: true,
      projectDate: true,
      coverImageUrl: true,
      visibility: true,
      allowFork: true,
      status: true,
      schoolId: true,
      createdById: true,
      advisorId: true,
      members: { select: { userId: true } },
      eventEntries: { select: { eventId: true } },
    },
  });

  if (!project) notFound();

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

  if (
    !canEditProjectContent(
      { id: viewer.id, role: viewer.role, schoolId: viewer.schoolId },
      projectCtx,
    )
  ) {
    notFound();
  }

  const [events, teachers] = await Promise.all([
    prisma.event.findMany({
      where: { schoolId: project.schoolId },
      orderBy: { startDate: "desc" },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: { schoolId: project.schoolId, role: "TEACHER", isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Editar projeto"
        description="O endereço do projeto continua o mesmo depois de salvar."
      />
      <Card>
        <CardBody>
          <ProjectForm
            mode="edit"
            slug={slug}
            events={events}
            teachers={teachers}
            defaults={{
              title: project.title,
              summary: project.summary,
              description: project.description ?? "",
              problem: project.problem ?? "",
              solution: project.solution ?? "",
              learnings: project.learnings ?? "",
              area: toArea(project.area),
              projectDate: project.projectDate.toISOString().slice(0, 10),
              eventId: project.eventEntries[0]?.eventId ?? "",
              advisorId: project.advisorId ?? "",
              coverImageUrl: project.coverImageUrl ?? "",
              visibilityScope: project.visibility === "PRIVATE" ? "PRIVATE" : "SCHOOL",
              makePublic: project.visibility === "PUBLIC",
              allowFork: project.allowFork,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
