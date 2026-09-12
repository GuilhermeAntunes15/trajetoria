import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionTitle } from "@/components/common/SectionTitle";
import { Card, CardBody } from "@/components/ui/Card";
import { admin as adminCopy } from "@/lib/copy";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Administração" };
export const dynamic = "force-dynamic";

const managementLinks = [
  { href: "/admin/users", label: adminCopy.usersTitle },
  { href: "/admin/classes", label: adminCopy.classesTitle },
  { href: "/admin/projects", label: adminCopy.projectsTitle },
  { href: "/admin/events", label: adminCopy.eventsTitle },
  { href: "/admin/skills", label: adminCopy.skillsTitle },
  { href: "/admin/badges", label: adminCopy.badgesTitle },
  { href: "/admin/school", label: adminCopy.schoolTitle },
];

export default async function AdminPage() {
  const viewer = await requireRole(["ADMIN"], "/admin");

  const [students, teachers, projects, waiting, events, school] = await Promise.all([
    prisma.user.count({ where: { schoolId: viewer.schoolId, role: "STUDENT", isActive: true } }),
    prisma.user.count({ where: { schoolId: viewer.schoolId, role: "TEACHER", isActive: true } }),
    prisma.project.count({ where: { schoolId: viewer.schoolId } }),
    prisma.project.count({ where: { schoolId: viewer.schoolId, status: "SUBMITTED" } }),
    prisma.event.count({ where: { schoolId: viewer.schoolId } }),
    prisma.school.findUniqueOrThrow({
      where: { id: viewer.schoolId },
      select: { name: true, city: true, state: true },
    }),
  ]);

  const blocks = [
    { label: "Estudantes", value: students, href: "/admin/users?role=STUDENT" },
    { label: "Professores", value: teachers, href: "/admin/users?role=TEACHER" },
    { label: "Projetos", value: projects, href: "/admin/projects" },
    {
      label: "Projetos aguardando validação",
      value: waiting,
      href: "/admin/projects?status=SUBMITTED",
    },
    { label: "Eventos", value: events, href: "/admin/events" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={adminCopy.title}
        description={[school.name, school.city, school.state].filter(Boolean).join(" · ")}
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block) => (
          <Card key={block.label}>
            <CardBody className="py-4">
              <p className="text-2xl font-semibold text-ink">{block.value}</p>
              <p className="mt-0.5 text-xs text-muted">{block.label}</p>
              <Link
                href={block.href}
                className="mt-3 inline-block text-sm text-brand hover:text-brand-hover"
              >
                Ver lista
              </Link>
            </CardBody>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <SectionTitle>{adminCopy.managementTitle}</SectionTitle>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {managementLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-brand/40 hover:text-brand"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
