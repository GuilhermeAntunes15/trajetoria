import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { StudentAvatar } from "@/components/project/StudentAvatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { teacher as teacherCopy } from "@/lib/copy";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Estudantes" };
export const dynamic = "force-dynamic";

export default async function TeacherStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const viewer = await requireRole(["TEACHER", "ADMIN"], "/teacher/students");
  const params = await searchParams;
  const query = (params.q ?? "").trim().slice(0, 80);

  const students = await prisma.user.findMany({
    where: {
      schoolId: viewer.schoolId,
      role: "STUDENT",
      isActive: true,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { username: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    take: 100,
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      studentProfile: {
        select: { course: true, gradeYear: true, classroom: { select: { name: true } } },
      },
    },
  });

  const approvedCounts = await prisma.projectMember.groupBy({
    by: ["userId"],
    where: {
      userId: { in: students.map((student) => student.id) },
      project: { schoolId: viewer.schoolId, status: "APPROVED" },
    },
    _count: { _all: true },
  });

  const countByUser = new Map(approvedCounts.map((row) => [row.userId, row._count._all]));

  const rows = students.map((student) => ({
    id: student.id,
    name: student.name,
    username: student.username,
    avatarUrl: student.avatarUrl,
    classroom: student.studentProfile?.classroom?.name ?? null,
    course: student.studentProfile?.course ?? null,
    gradeYear: student.studentProfile?.gradeYear ?? null,
    approved: countByUser.get(student.id) ?? 0,
  }));

  return (
    <div className="space-y-8">
      <PageHeader title={teacherCopy.studentsTitle} description={teacherCopy.studentsSubtitle} />

      <form
        method="get"
        action="/teacher/students"
        className="flex flex-wrap items-end gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-4"
      >
        <div className="min-w-56 flex-1 space-y-1.5">
          <Label htmlFor="students-q">{teacherCopy.studentsSearch}</Label>
          <Input id="students-q" name="q" defaultValue={query} maxLength={80} />
        </div>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      {rows.length === 0 ? (
        <EmptyState title={teacherCopy.studentsEmpty.title} text={teacherCopy.studentsEmpty.text} />
      ) : (
        <>
          <ul className="space-y-2 md:hidden">
            {rows.map((student) => (
              <li
                key={student.id}
                className="rounded-[var(--radius-card)] border border-line bg-surface p-4"
              >
                <div className="flex items-center gap-3">
                  <StudentAvatar name={student.name} avatarUrl={student.avatarUrl} size="sm" />
                  <div className="min-w-0">
                    <Link
                      href={`/u/${student.username}`}
                      className="block text-sm font-medium text-ink hover:text-brand"
                    >
                      {student.name}
                    </Link>
                    <p className="text-xs text-muted">
                      {[student.classroom, student.course, student.gradeYear]
                        .filter(Boolean)
                        .join(" · ") || "Sem turma definida"}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted">
                  {student.approved} {teacherCopy.approvedProjects}
                </p>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface md:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{teacherCopy.studentsTitle}</caption>
              <thead className="border-b border-line text-xs text-muted uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Estudante
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Turma
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Curso
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Projetos verificados
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((student) => (
                  <tr key={student.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-3">
                        <StudentAvatar name={student.name} avatarUrl={student.avatarUrl} size="sm" />
                        <Link
                          href={`/u/${student.username}`}
                          className="font-medium text-ink hover:text-brand"
                        >
                          {student.name}
                        </Link>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{student.classroom ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">
                      {[student.course, student.gradeYear].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">{student.approved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
