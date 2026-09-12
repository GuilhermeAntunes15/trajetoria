import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Viewer } from "@/lib/session";

export const REDIRECT_PREFIX = "NEXT_REDIRECT:";

export async function resetDatabase(): Promise<void> {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;

  const list = tables
    .map((table) => table.tablename)
    .filter((name) => !name.startsWith("_prisma"))
    .map((name) => `"public"."${name}"`)
    .join(", ");

  if (list) await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} CASCADE`);
}

export async function createSchool(slug: string, name: string) {
  return prisma.school.create({ data: { slug, name } });
}

export async function createUser(options: {
  schoolId: string;
  role: Role;
  username: string;
  name?: string;
}): Promise<Viewer> {
  const user = await prisma.user.create({
    data: {
      email: `${options.username}@exemplo.test`,
      username: options.username,
      name: options.name ?? options.username,
      passwordHash: "hash-de-teste",
      role: options.role,
      schoolId: options.schoolId,
      mustCompleteOnboarding: false,
    },
    select: { id: true, name: true, username: true, role: true, schoolId: true, avatarUrl: true },
  });

  return { ...user, mustCompleteOnboarding: false };
}

export async function createEvent(schoolId: string, createdById: string, slug: string) {
  return prisma.event.create({
    data: {
      slug,
      name: `Evento ${slug}`,
      type: "HACKATHON",
      startDate: new Date("2026-03-20T12:00:00.000Z"),
      schoolId,
      createdById,
    },
  });
}

export async function createProjectRow(options: {
  schoolId: string;
  owner: Viewer;
  slug: string;
  title?: string;
  status?: "DRAFT" | "SUBMITTED" | "APPROVED" | "CHANGES_REQUESTED" | "ARCHIVED";
  visibility?: "PRIVATE" | "SCHOOL" | "PUBLIC";
  memberIds?: string[];
  withEvidence?: boolean;
}) {
  const project = await prisma.project.create({
    data: {
      slug: options.slug,
      title: options.title ?? `Projeto ${options.slug}`,
      summary: "Resumo do projeto usado nos testes de integração.",
      problem: "Problema descrito para permitir o envio.",
      solution: "Solução descrita para permitir o envio.",
      status: options.status ?? "DRAFT",
      visibility: options.visibility ?? "SCHOOL",
      projectDate: new Date("2026-03-22T12:00:00.000Z"),
      year: 2026,
      schoolId: options.schoolId,
      createdById: options.owner.id,
      members: {
        create: [
          { userId: options.owner.id, role: "Backend", isOwner: true },
          ...(options.memberIds ?? []).map((userId) => ({ userId, role: "Dados" })),
        ],
      },
      evidences: options.withEvidence
        ? {
            create: {
              type: "GITHUB" as const,
              title: "Repositório",
              url: "https://github.com/exemplo/teste",
            },
          }
        : undefined,
    },
    select: { id: true, slug: true },
  });

  return project;
}

export function formData(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.append(key, value);
  return data;
}

export async function catchRedirect<T>(promise: Promise<T>): Promise<string | null> {
  try {
    await promise;
    return null;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith(REDIRECT_PREFIX)) {
      return error.message.slice(REDIRECT_PREFIX.length);
    }
    throw error;
  }
}
