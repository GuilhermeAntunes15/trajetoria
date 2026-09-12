import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteClassroomAction } from "@/actions/admin.actions";
import { ClassroomForm } from "@/components/admin/ClassroomForm";
import { ClassroomMembersForm } from "@/components/admin/ClassroomMembersForm";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { admin as adminCopy } from "@/lib/copy";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Turma" };
export const dynamic = "force-dynamic";

export default async function AdminClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await requireRole(["ADMIN"], "/admin/classes");

  const classroom = await prisma.classroom.findFirst({
    where: { id, schoolId: viewer.schoolId },
    select: {
      id: true,
      name: true,
      year: true,
      students: { select: { userId: true } },
      teachers: { select: { teacherId: true } },
    },
  });

  if (!classroom) notFound();

  const [students, teachers] = await Promise.all([
    prisma.user.findMany({
      where: { schoolId: viewer.schoolId, role: "STUDENT", isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        studentProfile: { select: { classroom: { select: { id: true, name: true } } } },
      },
    }),
    prisma.user.findMany({
      where: { schoolId: viewer.schoolId, role: { in: ["TEACHER", "ADMIN"] }, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const studentOptions = students.map((student) => {
    const current = student.studentProfile?.classroom;
    return {
      id: student.id,
      name: student.name,
      hint: current && current.id !== classroom.id ? `Hoje em ${current.name}` : null,
    };
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title={classroom.name}
        description={`${adminCopy.classYearLabel}: ${classroom.year}`}
      />

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink">Dados da turma</h2>
        </CardHeader>
        <CardBody>
          <ClassroomForm
            defaults={{ classroomId: classroom.id, name: classroom.name, year: classroom.year }}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink">{adminCopy.classStudentsTitle}</h2>
        </CardHeader>
        <CardBody>
          <ClassroomMembersForm
            classroomId={classroom.id}
            students={studentOptions}
            teachers={teachers}
            selectedStudentIds={classroom.students.map((student) => student.userId)}
            selectedTeacherIds={classroom.teachers.map((teacher) => teacher.teacherId)}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink">{adminCopy.classDeleteAction}</h2>
        </CardHeader>
        <CardBody>
          <ConfirmDialog
            triggerLabel={adminCopy.classDeleteAction}
            title={adminCopy.classDeleteAction}
            description={adminCopy.classDeleteConfirm}
            confirmLabel={adminCopy.classDeleteAction}
            action={deleteClassroomAction}
            hiddenFields={{ classroomId: classroom.id }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
