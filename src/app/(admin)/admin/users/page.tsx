import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma, Role } from "@prisma/client";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { ROLE_LABELS } from "@/lib/constants";
import { admin as adminCopy } from "@/lib/copy";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Usuários" };
export const dynamic = "force-dynamic";

const ROLES: Role[] = ["STUDENT", "TEACHER", "ADMIN"];

function parseRole(value: string | undefined): Role | null {
  return ROLES.includes(value as Role) ? (value as Role) : null;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; status?: string }>;
}) {
  const viewer = await requireRole(["ADMIN"], "/admin/users");
  const { q, role, status } = await searchParams;

  const query = (q ?? "").trim().slice(0, 80);
  const roleFilter = parseRole(role);
  const statusFilter = status === "active" || status === "inactive" ? status : null;

  const where: Prisma.UserWhereInput = {
    schoolId: viewer.schoolId,
    ...(roleFilter ? { role: roleFilter } : {}),
    ...(statusFilter ? { isActive: statusFilter === "active" } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { username: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const users = await prisma.user.findMany({
    where,
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    take: 200,
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      studentProfile: { select: { classroom: { select: { name: true } } } },
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title={adminCopy.usersTitle}
        description={adminCopy.usersSubtitle}
        actions={
          <ButtonLink href="/admin/users/new" size="sm">
            {adminCopy.newUser}
          </ButtonLink>
        }
      />

      <form
        method="get"
        className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="q">{adminCopy.usersSearch}</Label>
          <Input id="q" name="q" defaultValue={query} maxLength={80} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="role">{adminCopy.filterRole}</Label>
          <Select id="role" name="role" defaultValue={roleFilter ?? ""}>
            <option value="">{adminCopy.filterAll}</option>
            {ROLES.map((option) => (
              <option key={option} value={option}>
                {ROLE_LABELS[option]}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">{adminCopy.filterStatus}</Label>
          <Select id="status" name="status" defaultValue={statusFilter ?? ""}>
            <option value="">{adminCopy.filterAll}</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </Select>
        </div>

        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
      </form>

      {users.length === 0 ? (
        <EmptyState title={adminCopy.usersEmpty.title} text={adminCopy.usersEmpty.text} />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-canvas text-left text-xs tracking-[0.08em] text-muted uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Nome
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    E-mail
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Papel
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Turma
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">
                      <span className="font-medium text-ink">{user.name}</span>
                      <span className="block text-xs text-muted">@{user.username}</span>
                    </td>
                    <td className="px-4 py-3 text-muted">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        {ROLE_LABELS[user.role]}
                        {user.isActive ? null : (
                          <Badge tone="warning">{adminCopy.inactiveLabel}</Badge>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {user.studentProfile?.classroom?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-sm text-brand hover:text-brand-hover"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 md:hidden">
            {users.map((user) => (
              <li
                key={user.id}
                className="rounded-[var(--radius-card)] border border-line bg-surface p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-ink">{user.name}</p>
                  {user.isActive ? null : <Badge tone="warning">{adminCopy.inactiveLabel}</Badge>}
                </div>
                <p className="text-xs text-muted">@{user.username}</p>
                <p className="mt-1 text-sm text-muted">{user.email}</p>
                <p className="text-sm text-muted">
                  {[ROLE_LABELS[user.role], user.studentProfile?.classroom?.name]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <Link
                  href={`/admin/users/${user.id}`}
                  className="mt-3 inline-block text-sm text-brand hover:text-brand-hover"
                >
                  Editar
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="text-xs text-muted">{adminCopy.neverDelete}</p>
    </div>
  );
}
