import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { StudentAvatar } from "@/components/project/StudentAvatar";
import { teacher as teacherCopy } from "@/lib/copy";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Turmas" };
export const dynamic = "force-dynamic";

export default async function TeacherClassesPage() {
  const viewer = await requireRole(["TEACHER", "ADMIN"], "/teacher/classes");

  const classrooms = await prisma.classroom.findMany({
    where: { schoolId: viewer.schoolId },
    orderBy: [{ year: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      year: true,
      students: {
        orderBy: { user: { name: "asc" } },
        select: {
          id: true,
          course: true,
          gradeYear: true,
          user: { select: { name: true, username: true, avatarUrl: true, isActive: true } },
        },
      },
      teachers: { select: { teacher: { select: { name: true } } } },
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader title={teacherCopy.classesTitle} description={teacherCopy.classesSubtitle} />

      {classrooms.length === 0 ? (
        <EmptyState title={teacherCopy.classesEmpty.title} text={teacherCopy.classesEmpty.text} />
      ) : (
        <ul className="space-y-3">
          {classrooms.map((classroom) => {
            const students = classroom.students.filter((student) => student.user.isActive);

            return (
              <li
                key={classroom.id}
                className="rounded-[var(--radius-card)] border border-line bg-surface"
              >
                <details>
                  <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm">
                    <span className="font-medium text-ink">
                      {classroom.name}
                      <span className="font-normal text-muted"> — {classroom.year}</span>
                    </span>
                    <span className="text-xs text-muted">
                      {students.length === 1 ? "1 estudante" : `${students.length} estudantes`}
                      {classroom.teachers.length > 0
                        ? ` · ${classroom.teachers.map((item) => item.teacher.name).join(", ")}`
                        : ""}
                    </span>
                  </summary>

                  <div className="border-t border-line px-4 py-4">
                    {students.length === 0 ? (
                      <p className="text-sm text-muted">{teacherCopy.noStudentsInClass}</p>
                    ) : (
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {students.map((student) => (
                          <li key={student.id} className="flex items-center gap-3">
                            <StudentAvatar
                              name={student.user.name}
                              avatarUrl={student.user.avatarUrl}
                              size="sm"
                            />
                            <span className="min-w-0">
                              <Link
                                href={`/u/${student.user.username}`}
                                className="block text-sm font-medium text-ink hover:text-brand"
                              >
                                {student.user.name}
                              </Link>
                              <span className="block truncate text-xs text-muted">
                                {[student.course, student.gradeYear].filter(Boolean).join(" · ") ||
                                  `@${student.user.username}`}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
