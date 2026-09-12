import type { Metadata } from "next";
import Link from "next/link";
import { ClassroomForm } from "@/components/admin/ClassroomForm";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { admin as adminCopy } from "@/lib/copy";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Turmas" };
export const dynamic = "force-dynamic";

export default async function AdminClassesPage() {
  const viewer = await requireRole(["ADMIN"], "/admin/classes");

  const classrooms = await prisma.classroom.findMany({
    where: { schoolId: viewer.schoolId },
    orderBy: [{ year: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      year: true,
      _count: { select: { students: true, teachers: true } },
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader title={adminCopy.classesTitle} description={adminCopy.classesSubtitle} />

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink">{adminCopy.newClass}</h2>
        </CardHeader>
        <CardBody>
          <ClassroomForm />
        </CardBody>
      </Card>

      {classrooms.length === 0 ? (
        <EmptyState title={adminCopy.classesEmpty.title} text={adminCopy.classesEmpty.text} />
      ) : (
        <ul className="space-y-2">
          {classrooms.map((classroom) => (
            <li
              key={classroom.id}
              className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">
                  {classroom.name}
                  <span className="font-normal text-muted"> — {classroom.year}</span>
                </p>
                <p className="text-xs text-muted">
                  {classroom._count.students === 1
                    ? "1 estudante"
                    : `${classroom._count.students} estudantes`}
                  {" · "}
                  {classroom._count.teachers === 1
                    ? "1 professor"
                    : `${classroom._count.teachers} professores`}
                </p>
              </div>

              <Link
                href={`/admin/classes/${classroom.id}`}
                className="text-sm text-brand hover:text-brand-hover"
              >
                Abrir turma
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
