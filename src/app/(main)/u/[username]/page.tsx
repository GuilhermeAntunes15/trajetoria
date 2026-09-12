import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revokeBadgeAction } from "@/actions/badge.actions";
import { BadgeCard } from "@/components/badge/BadgeCard";
import { GrantBadgeDialog } from "@/components/badge/GrantBadgeDialog";
import { IssueCertificateDialog } from "@/components/certificate/IssueCertificateDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionTitle } from "@/components/common/SectionTitle";
import { SubmitButton } from "@/components/common/SubmitButton";
import { ProjectCard } from "@/components/project/ProjectCard";
import { SkillBadge } from "@/components/project/SkillBadge";
import { StudentAvatar } from "@/components/project/StudentAvatar";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ROLE_LABELS } from "@/lib/constants";
import { badges as badgesCopy, empty, settings } from "@/lib/copy";
import { formatDate } from "@/lib/format";
import { canViewProfile, canViewProject } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/session";
import {
  projectCardSelect,
  toProjectCardData,
  toProjectCtx,
} from "@/server/services/project.service";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, name: true, schoolId: true, profileVisibility: true, isActive: true },
  });

  if (!user || !user.isActive) return { title: "Perfil" };

  const viewer = await getViewer();
  const visible = canViewProfile(
    viewer ? { id: viewer.id, role: viewer.role, schoolId: viewer.schoolId } : null,
    { id: user.id, schoolId: user.schoolId, profileVisibility: user.profileVisibility },
  );

  return { title: visible ? user.name : "Perfil" };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const viewer = await getViewer();

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      bio: true,
      role: true,
      schoolId: true,
      profileVisibility: true,
      isActive: true,
      school: { select: { name: true } },
      studentProfile: {
        select: {
          course: true,
          gradeYear: true,
          interests: true,
          classroom: { select: { name: true } },
        },
      },
    },
  });

  if (!user || !user.isActive) notFound();

  const permissionViewer = viewer
    ? { id: viewer.id, role: viewer.role, schoolId: viewer.schoolId }
    : null;

  if (
    !canViewProfile(permissionViewer, {
      id: user.id,
      schoolId: user.schoolId,
      profileVisibility: user.profileVisibility,
    })
  ) {
    notFound();
  }

  const isOwner = viewer?.id === user.id;
  const isStaff =
    (viewer?.role === "TEACHER" || viewer?.role === "ADMIN") && viewer.schoolId === user.schoolId;
  const canGrant = isStaff && user.role === "STUDENT";
  const canRevoke = viewer?.role === "ADMIN" && viewer.schoolId === user.schoolId;

  const [rows, skillRows, badges, eventRows, certificates] = await Promise.all([
    prisma.project.findMany({
      where: {
        members: { some: { userId: user.id } },
        ...(isOwner || isStaff ? {} : { status: { not: "ARCHIVED" as const } }),
      },
      orderBy: [{ projectDate: "desc" }],
      take: 24,
      select: projectCardSelect,
    }),
    prisma.projectSkill.findMany({
      where: {
        project: { status: "APPROVED", members: { some: { userId: user.id } } },
      },
      select: {
        validatedByTeacher: true,
        skill: { select: { id: true, name: true } },
      },
    }),
    prisma.userBadge.findMany({
      where: { userId: user.id },
      orderBy: { issuedAt: "desc" },
      select: {
        id: true,
        issuedAt: true,
        note: true,
        badge: { select: { name: true, description: true, icon: true } },
        issuedBy: { select: { name: true } },
      },
    }),
    prisma.eventProject.findMany({
      where: { project: { members: { some: { userId: user.id } } } },
      distinct: ["eventId"],
      orderBy: { event: { startDate: "desc" } },
      select: {
        event: { select: { id: true, name: true, slug: true, startDate: true, location: true } },
      },
    }),
    prisma.certificate.findMany({
      where: { studentId: user.id, revokedAt: null },
      orderBy: { issuedAt: "desc" },
      select: {
        id: true,
        code: true,
        title: true,
        hours: true,
        issuedAt: true,
        event: { select: { name: true } },
      },
    }),
  ]);

  const projects = rows
    .filter((row) => canViewProject(permissionViewer, toProjectCtx(row)))
    .map(toProjectCardData);

  const skills = [
    ...skillRows
      .reduce((acc, row) => {
        const current = acc.get(row.skill.id);
        acc.set(row.skill.id, {
          name: row.skill.name,
          verified: (current?.verified ?? false) || row.validatedByTeacher,
          count: (current?.count ?? 0) + 1,
        });
        return acc;
      }, new Map<string, { name: string; verified: boolean; count: number }>())
      .entries(),
  ]
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => {
      if (a.verified !== b.verified) return a.verified ? -1 : 1;
      if (a.count !== b.count) return b.count - a.count;
      return a.name.localeCompare(b.name, "pt-BR");
    });

  const [schoolBadges, schoolEvents] = canGrant
    ? await Promise.all([
        prisma.badge.findMany({
          where: { schoolId: user.schoolId },
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        }),
        prisma.event.findMany({
          where: { schoolId: user.schoolId },
          orderBy: { startDate: "desc" },
          select: { id: true, name: true },
        }),
      ])
    : [[], []];

  const profile = user.studentProfile;
  const details = [profile?.course, profile?.gradeYear, profile?.classroom?.name].filter(Boolean);

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <StudentAvatar name={user.name} avatarUrl={user.avatarUrl} size="lg" />
          <div className="min-w-0 space-y-2">
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{user.name}</h1>
              <p className="text-sm text-muted">
                {user.school.name}
                {user.role !== "STUDENT" ? ` — ${ROLE_LABELS[user.role]}` : ""}
              </p>
              {details.length > 0 ? (
                <p className="text-sm text-muted">{details.join(" · ")}</p>
              ) : null}
            </div>

            {user.bio ? <p className="max-w-2xl text-sm text-ink">{user.bio}</p> : null}

            {profile?.interests && profile.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {profile.interests.map((interest) => (
                  <Badge key={interest} tone="neutral">
                    {interest}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isOwner ? (
            <ButtonLink href="/settings" variant="secondary" size="sm">
              {settings.editProfile}
            </ButtonLink>
          ) : null}

          {canGrant ? (
            <>
              <GrantBadgeDialog badges={schoolBadges} students={[{ id: user.id, name: user.name }]} />
              <IssueCertificateDialog
                students={[{ id: user.id, name: user.name }]}
                events={schoolEvents}
              />
            </>
          ) : null}
        </div>
      </header>

      <section className="space-y-4">
        <SectionTitle>Projetos</SectionTitle>
        {projects.length === 0 ? (
          <EmptyState
            title={empty.portfolio.title}
            text={empty.portfolio.text}
            actionLabel={isOwner ? empty.portfolio.action : undefined}
            actionHref={isOwner ? "/projects/new" : undefined}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionTitle>Competências</SectionTitle>
        {skills.length === 0 ? (
          <EmptyState title={empty.skills.title} text={empty.skills.text} />
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <SkillBadge key={skill.id} name={skill.name} verified={skill.verified} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionTitle>Badges</SectionTitle>
        {badges.length === 0 ? (
          <EmptyState title={empty.badges.title} text={empty.badges.text} />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {badges.map((userBadge) => (
              <li key={userBadge.id}>
                <BadgeCard
                  badge={{
                    name: userBadge.badge.name,
                    description: userBadge.badge.description,
                    icon: userBadge.badge.icon,
                    note: userBadge.note,
                    issuedAt: userBadge.issuedAt,
                    issuedByName: badgesCopy.issuedBy(userBadge.issuedBy.name),
                  }}
                  actions={
                    canRevoke ? (
                      <form action={revokeBadgeAction}>
                        <input type="hidden" name="userBadgeId" value={userBadge.id} />
                        <SubmitButton variant="ghost" size="sm" pendingLabel="...">
                          {badgesCopy.revokeAction}
                        </SubmitButton>
                      </form>
                    ) : null
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <SectionTitle>Eventos</SectionTitle>
        {eventRows.length === 0 ? (
          <EmptyState title={empty.events.title} text={empty.events.text} />
        ) : (
          <ul className="space-y-2">
            {eventRows.map((entry) => (
              <li key={entry.event.id} className="text-sm">
                <Link href={`/events/${entry.event.slug}`} className="font-medium text-ink hover:text-brand">
                  {entry.event.name}
                </Link>
                <span className="block text-xs text-muted">
                  {[formatDate(entry.event.startDate), entry.event.location]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <SectionTitle>Certificados</SectionTitle>
        {certificates.length === 0 ? (
          <EmptyState title={empty.certificates.title} text={empty.certificates.text} />
        ) : (
          <ul className="space-y-2">
            {certificates.map((certificate) => (
              <li key={certificate.id} className="text-sm">
                <Link
                  href={`/certificate/${certificate.code}`}
                  className="font-medium text-ink hover:text-brand"
                >
                  {certificate.title}
                </Link>
                <span className="block text-xs text-muted">
                  {[
                    certificate.event?.name,
                    certificate.hours ? `${certificate.hours} h` : null,
                    formatDate(certificate.issuedAt),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
