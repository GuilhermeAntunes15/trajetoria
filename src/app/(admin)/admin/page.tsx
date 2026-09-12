import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionTitle } from "@/components/common/SectionTitle";
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
          <div key={block.label} className="lp-sticker lp-sticker-soft bg-surface p-4 sm:p-5">
            <p className="font-display text-3xl leading-none font-bold text-ink">{block.value}</p>
            <p className="mt-1.5 text-xs leading-tight text-muted">{block.label}</p>
            <Link
              href={block.href}
              className="mt-3 inline-block text-sm font-semibold text-brand hover:text-brand-hover"
            >
              Ver lista
            </Link>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <SectionTitle>{adminCopy.managementTitle}</SectionTitle>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {managementLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="lp-sticker lp-sticker-soft lp-lift-soft block bg-surface px-4 py-3 text-sm font-semibold text-ink transition-colors hover:text-brand"
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
