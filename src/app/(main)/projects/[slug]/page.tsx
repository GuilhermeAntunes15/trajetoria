import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowUp, GraduationCap } from "lucide-react";
import { deleteProject, setProjectVisibility, submitProject } from "@/actions/project.actions";
import { removeEvidence, reorderEvidence } from "@/actions/evidence.actions";
import { removeMember } from "@/actions/member.actions";
import { removeProjectSkill } from "@/actions/skill.actions";
import { GrantBadgeDialog } from "@/components/badge/GrantBadgeDialog";
import { IssueCertificateDialog } from "@/components/certificate/IssueCertificateDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Notice } from "@/components/common/Notice";
import { SectionTitle } from "@/components/common/SectionTitle";
import { SubmitButton } from "@/components/common/SubmitButton";
import { DerivedProjects, type DerivedProject } from "@/components/project/DerivedProjects";
import { EvidenceCard } from "@/components/project/EvidenceCard";
import { EvidenceForm } from "@/components/project/EvidenceForm";
import { MemberContributionForm, MemberForm } from "@/components/project/MemberForm";
import { ForkNotice } from "@/components/project/ForkNotice";
import { MemberList, type MemberListItem } from "@/components/project/MemberList";
import { QrCodeDialog } from "@/components/project/QrCodeDialog";
import { ProjectStatusBadge } from "@/components/project/ProjectStatusBadge";
import { TeacherReviewPanel } from "@/components/project/TeacherReviewPanel";
import { SkillBadge } from "@/components/project/SkillBadge";
import { SkillPicker } from "@/components/project/SkillPicker";
import { VerifiedBadge } from "@/components/project/VerifiedBadge";
import { VisibilityBadge } from "@/components/project/VisibilityBadge";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { VISIBILITY_LABELS } from "@/lib/constants";
import {
  actions as actionsCopy,
  fork as forkCopy,
  project as projectCopy,
  projectManage,
} from "@/lib/copy";
import { env } from "@/lib/env";
import { formatDate } from "@/lib/format";
import {
  canArchiveProject,
  canCreateProject,
  canDeleteProject,
  canEditProjectContent,
  canFeatureProject,
  canForkProject,
  canPublishProject,
  canReviewProject,
  canSubmitProject,
  canViewProfile,
  canViewProject,
  isProjectMember,
  type ProjectCtx,
} from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/session";

export const dynamic = "force-dynamic";

async function loadProject(slug: string) {
  return prisma.project.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      description: true,
      problem: true,
      solution: true,
      learnings: true,
      area: true,
      status: true,
      visibility: true,
      allowFork: true,
      isFeatured: true,
      coverImageUrl: true,
      projectDate: true,
      year: true,
      schoolId: true,
      createdById: true,
      advisorId: true,
      school: { select: { name: true } },
      parentProject: {
        select: {
          id: true,
          slug: true,
          title: true,
          year: true,
          status: true,
          visibility: true,
          allowFork: true,
          schoolId: true,
          createdById: true,
          advisorId: true,
          members: { select: { userId: true } },
        },
      },
      derivedProjects: {
        orderBy: [{ projectDate: "desc" }],
        select: {
          id: true,
          slug: true,
          title: true,
          year: true,
          status: true,
          visibility: true,
          allowFork: true,
          schoolId: true,
          createdById: true,
          advisorId: true,
          members: { select: { userId: true } },
        },
      },
      advisor: {
        select: {
          name: true,
          teacherProfile: { select: { title: true, subject: true } },
        },
      },
      eventEntries: {
        select: { id: true, isHighlight: true, event: { select: { name: true, slug: true } } },
      },
      members: {
        orderBy: [{ isOwner: "desc" }, { createdAt: "asc" }],
        select: {
          id: true,
          role: true,
          contribution: true,
          isOwner: true,
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              schoolId: true,
              role: true,
              profileVisibility: true,
            },
          },
        },
      },
      skills: {
        orderBy: [{ validatedByTeacher: "desc" }],
        select: {
          id: true,
          validatedByTeacher: true,
          skill: { select: { id: true, name: true } },
        },
      },
      evidences: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          type: true,
          title: true,
          description: true,
          url: true,
          fileUrl: true,
        },
      },
      validations: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          action: true,
          comment: true,
          strengths: true,
          improvements: true,
          generalComment: true,
          createdAt: true,
          reviewer: { select: { name: true } },
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
    select: {
      title: true,
      summary: true,
      schoolId: true,
      createdById: true,
      advisorId: true,
      status: true,
      visibility: true,
      allowFork: true,
      members: { select: { userId: true } },
    },
  });

  if (!project) return { title: "Projeto" };

  const viewer = await getViewer();
  const visible = canViewProject(
    viewer ? { id: viewer.id, role: viewer.role, schoolId: viewer.schoolId } : null,
    {
      id: slug,
      schoolId: project.schoolId,
      createdById: project.createdById,
      advisorId: project.advisorId,
      status: project.status,
      visibility: project.visibility,
      allowFork: project.allowFork,
      memberIds: project.members.map((member) => member.userId),
    },
  );

  if (!visible) return { title: "Projeto" };
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ slug }, { saved }] = await Promise.all([params, searchParams]);
  const [viewer, project] = await Promise.all([getViewer(), loadProject(slug)]);

  if (!project) notFound();

  const permissionViewer = viewer
    ? { id: viewer.id, role: viewer.role, schoolId: viewer.schoolId }
    : null;

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

  if (!canViewProject(permissionViewer, projectCtx)) notFound();

  const isMember = isProjectMember(permissionViewer, projectCtx);
  const isStaff =
    (viewer?.role === "TEACHER" || viewer?.role === "ADMIN") &&
    viewer.schoolId === project.schoolId;
  const canEdit = canEditProjectContent(permissionViewer, projectCtx);

  const submitCtx = {
    id: project.id,
    schoolId: project.schoolId,
    createdById: project.createdById,
    memberIds: projectCtx.memberIds,
    status: project.status,
    title: project.title,
    summary: project.summary,
    problem: project.problem,
    solution: project.solution,
    evidenceCount: project.evidences.length,
  };

  const canSubmit = canSubmitProject(permissionViewer, submitCtx);
  /**
   * A faixa de acoes so existe quando tem o que mostrar. Sem isto, um projeto
   * aprovado renderizava um adesivo vazio no meio da pagina.
   */
  const pendingRevision =
    project.status === "DRAFT" || project.status === "CHANGES_REQUESTED";
  const canDelete = canDeleteProject(permissionViewer, {
    ...projectCtx,
    otherMemberCount: projectCtx.memberIds.filter((id) => id !== project.createdById).length,
  });

  const missing = [
    project.problem?.trim() ? null : projectCopy.sections.problem,
    project.solution?.trim() ? null : projectCopy.sections.solution,
    project.evidences.length > 0 ? null : "Pelo menos uma evidência",
  ].filter((item): item is string => item !== null);

  const lineageCtx = (row: {
    id: string;
    schoolId: string;
    createdById: string;
    advisorId: string | null;
    status: ProjectCtx["status"];
    visibility: ProjectCtx["visibility"];
    allowFork: boolean;
    members: { userId: string }[];
  }): ProjectCtx => ({
    id: row.id,
    schoolId: row.schoolId,
    createdById: row.createdById,
    advisorId: row.advisorId,
    status: row.status,
    visibility: row.visibility,
    allowFork: row.allowFork,
    memberIds: row.members.map((member) => member.userId),
  });

  const parent = project.parentProject;
  const parentVisible = parent ? canViewProject(permissionViewer, lineageCtx(parent)) : false;

  const derived: DerivedProject[] = project.derivedProjects
    .filter((row) => canViewProject(permissionViewer, lineageCtx(row)))
    .map((row) => ({ slug: row.slug, title: row.title, year: row.year }));

  const canFork =
    canForkProject(permissionViewer, projectCtx) && canCreateProject(permissionViewer);

  const showQr =
    (project.visibility === "PUBLIC" && project.status === "APPROVED") ||
    ((isMember || isStaff) && project.visibility === "SCHOOL");

  const studentMembers = project.members
    .filter((member) => member.user.role === "STUDENT")
    .map((member) => ({ id: member.userId, name: member.user.name }));

  const schoolBadges = isStaff
    ? await prisma.badge.findMany({
        where: { schoolId: project.schoolId },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      })
    : [];

  const eventEntry = project.eventEntries[0] ?? null;
  const event = eventEntry?.event ?? null;
  const lastValidation = project.validations[0] ?? null;
  const canReview = canReviewProject(permissionViewer, projectCtx);
  const canArchive = canArchiveProject(permissionViewer, projectCtx);
  const canPublish = canPublishProject(permissionViewer, projectCtx);

  const members: MemberListItem[] = project.members.map((member) => ({
    id: member.id,
    userId: member.userId,
    name: member.user.name,
    avatarUrl: member.user.avatarUrl,
    role: member.role,
    contribution: member.contribution,
    isOwner: member.isOwner,
    profileHref: canViewProfile(permissionViewer, {
      id: member.user.id,
      schoolId: member.user.schoolId,
      profileVisibility: member.user.profileVisibility,
    })
      ? `/u/${member.user.username}`
      : null,
  }));

  const viewerMember = viewer
    ? project.members.find((member) => member.userId === viewer.id)
    : undefined;

  const schoolSkills = canEdit
    ? await prisma.skill.findMany({
        where: { schoolId: project.schoolId },
        orderBy: [{ category: "asc" }, { name: "asc" }],
        select: { id: true, name: true, category: true },
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      {saved === "1" ? <Notice tone="success" title={actionsCopy.projectSaved} /> : null}

      {project.status === "CHANGES_REQUESTED" && lastValidation && (isMember || isStaff) ? (
        <Notice tone="warning" title={projectManage.changesRequestedTitle}>
          <p className="whitespace-pre-wrap">
            {lastValidation.comment ?? lastValidation.generalComment ?? ""}
          </p>
        </Notice>
      ) : null}

      <article className="space-y-10">
        {/* Capa em adesivo: a pagina do projeto abre como a pagina de um caderno. */}
        <header className="lp-sticker overflow-hidden bg-surface">
          {project.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.coverImageUrl}
              alt={`Capa do projeto ${project.title}`}
              className="aspect-[16/7] w-full border-b-2 border-ink object-cover"
            />
          ) : null}

          <div className="space-y-4 p-5 sm:p-7">
            {isMember || isStaff ? (
              <div className="flex flex-wrap items-center gap-2">
                <ProjectStatusBadge status={project.status} />
                <VisibilityBadge visibility={project.visibility} />
                {project.area ? <Badge tone="neutral">{project.area}</Badge> : null}
              </div>
            ) : project.area ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{project.area}</Badge>
              </div>
            ) : null}

            <h1 className="font-display text-[1.875rem] leading-[1.05] font-bold text-ink sm:text-[2.75rem]">
              {project.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              {event ? (
                <Link
                  href={`/events/${event.slug}`}
                  className="font-semibold text-brand hover:text-brand-hover"
                >
                  {event.name}
                </Link>
              ) : null}
              <span>{project.school.name}</span>
              <span>{formatDate(project.projectDate)}</span>
            </div>

            {project.status === "APPROVED" ? (
              <div className="flex flex-wrap items-center gap-2">
                <VerifiedBadge />
                {project.isFeatured ? (
                  <Badge tone="warning" variant="ink">
                    {projectCopy.featuredLabel}
                  </Badge>
                ) : null}
              </div>
            ) : null}

            {parent ? (
              <ForkNotice
                parent={{
                  title: parent.title,
                  year: parent.year,
                  slug: parentVisible ? parent.slug : null,
                }}
              />
            ) : null}
          </div>
        </header>

        {showQr || canFork || isStaff ? (
          <div className="flex flex-wrap items-center gap-2">
            {showQr ? (
              <QrCodeDialog
                slug={project.slug}
                title={project.title}
                schoolName={project.school.name}
                shareUrl={`${env.APP_URL}/projects/${project.slug}`}
                restricted={project.visibility === "SCHOOL"}
              />
            ) : null}

            {canFork ? (
              <ButtonLink href={`/projects/${project.slug}/fork`} variant="secondary" size="sm">
                {forkCopy.action}
              </ButtonLink>
            ) : null}

            {isStaff && studentMembers.length > 0 ? (
              <>
                <GrantBadgeDialog
                  badges={schoolBadges}
                  students={studentMembers}
                  projectId={project.id}
                />
                <IssueCertificateDialog
                  students={studentMembers}
                  projectId={project.id}
                  defaultTitle={project.title}
                />
              </>
            ) : null}
          </div>
        ) : null}

        {isMember && (canEdit || canSubmit || pendingRevision || project.status === "SUBMITTED") ? (
          <div className="lp-sticker lp-sticker-flat flex flex-wrap items-center gap-3 bg-lp-paper p-4">
            {canEdit ? (
              <ButtonLink href={`/projects/${project.slug}/edit`} variant="secondary" size="sm">
                {projectManage.edit}
              </ButtonLink>
            ) : null}

            {canSubmit ? (
              <form action={submitProject}>
                <input type="hidden" name="projectId" value={project.id} />
                <SubmitButton size="sm" pendingLabel="Enviando...">
                  {projectManage.submitAction}
                </SubmitButton>
              </form>
            ) : null}

            {!canSubmit && pendingRevision ? (
              <p className="text-sm text-muted">
                {projectManage.submitMissingTitle} {missing.join(", ")}.
              </p>
            ) : null}

            {project.status === "SUBMITTED" ? (
              <p className="text-sm text-muted">{projectManage.submitDone}</p>
            ) : null}
          </div>
        ) : null}

        <section className="space-y-3">
          <SectionTitle variant="display" number={1} accent="var(--color-brand)">
            {projectCopy.sections.summary}
          </SectionTitle>
          <p className="text-base leading-relaxed whitespace-pre-wrap text-ink sm:text-lg">
            {project.summary}
          </p>
          {project.description ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted">
              {project.description}
            </p>
          ) : null}
        </section>

        {project.problem ? (
          <section className="space-y-3">
            <SectionTitle variant="display" number={2} accent="var(--color-info)">
              {projectCopy.sections.problem}
            </SectionTitle>
            <p className="leading-relaxed whitespace-pre-wrap text-ink">{project.problem}</p>
          </section>
        ) : null}

        {project.solution ? (
          <section className="space-y-3">
            <SectionTitle variant="display" number={3} accent="var(--color-warning)">
              {projectCopy.sections.solution}
            </SectionTitle>
            <p className="leading-relaxed whitespace-pre-wrap text-ink">{project.solution}</p>
          </section>
        ) : null}

        {project.learnings ? (
          <section className="space-y-3">
            <SectionTitle variant="display" number={4} accent="var(--color-accent)">
              {projectCopy.sections.learnings}
            </SectionTitle>
            <p className="leading-relaxed whitespace-pre-wrap text-ink">{project.learnings}</p>
          </section>
        ) : null}

        <section className="space-y-4">
          <SectionTitle variant="display">{projectCopy.sections.team}</SectionTitle>
          <MemberList members={members} />
        </section>

        {project.skills.length > 0 ? (
          <section className="space-y-4">
            <SectionTitle variant="display">{projectCopy.sections.skills}</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((projectSkill) => (
                <SkillBadge
                  key={projectSkill.id}
                  name={projectSkill.skill.name}
                  verified={projectSkill.validatedByTeacher}
                />
              ))}
            </div>
          </section>
        ) : null}

        {project.evidences.length > 0 ? (
          <section className="space-y-4">
            <SectionTitle variant="display">{projectCopy.sections.evidences}</SectionTitle>
            <div className="space-y-3">
              {project.evidences.map((evidence) => (
                <EvidenceCard key={evidence.id} evidence={evidence} />
              ))}
            </div>
          </section>
        ) : null}

        <DerivedProjects projects={derived} />

        {project.advisor ? (
          <section className="space-y-4">
            <SectionTitle variant="display">{projectCopy.sections.advisor}</SectionTitle>
            <div className="lp-sticker lp-sticker-flat flex items-center gap-3.5 bg-lp-sky p-4">
              <span
                className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-ink bg-surface text-ink"
                aria-hidden
              >
                <GraduationCap size={20} strokeWidth={2.25} />
              </span>
              <p className="font-display text-base leading-tight font-bold text-ink sm:text-lg">
                {project.advisor.teacherProfile?.title ? `${project.advisor.teacherProfile.title} ` : ""}
                {project.advisor.name}
                {project.advisor.teacherProfile?.subject
                  ? ` — ${project.advisor.teacherProfile.subject}`
                  : ""}
              </p>
            </div>
          </section>
        ) : null}
      </article>

      {canEdit ? (
        <section className="space-y-4">
          <div className="space-y-1">
            <SectionTitle>{projectManage.title}</SectionTitle>
            <p className="text-sm text-muted">{projectManage.subtitle}</p>
          </div>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-ink">{projectManage.teamTitle}</h3>
            </CardHeader>
            <CardBody className="space-y-5">
              <MemberList members={members} removeAction={removeMember} />
              <p className="text-xs text-muted">{projectManage.ownerNote}</p>
              {viewerMember ? (
                <div className="border-t border-line pt-4">
                  <MemberContributionForm
                    memberId={viewerMember.id}
                    role={viewerMember.role}
                    contribution={viewerMember.contribution}
                  />
                </div>
              ) : null}
              <div className="border-t border-line pt-4">
                <MemberForm projectId={project.id} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-ink">{projectManage.evidencesTitle}</h3>
            </CardHeader>
            <CardBody className="space-y-5">
              {project.evidences.length > 0 ? (
                <div className="space-y-2">
                  {project.evidences.map((evidence) => (
                    <EvidenceCard
                      key={evidence.id}
                      evidence={evidence}
                      actions={
                        <div className="flex items-center gap-1">
                          <form action={reorderEvidence}>
                            <input type="hidden" name="evidenceId" value={evidence.id} />
                            <input type="hidden" name="direction" value="up" />
                            <SubmitButton variant="ghost" size="sm" pendingLabel="...">
                              <ArrowUp size={16} strokeWidth={1.75} />
                              <span className="sr-only">Mover para cima</span>
                            </SubmitButton>
                          </form>
                          <form action={reorderEvidence}>
                            <input type="hidden" name="evidenceId" value={evidence.id} />
                            <input type="hidden" name="direction" value="down" />
                            <SubmitButton variant="ghost" size="sm" pendingLabel="...">
                              <ArrowDown size={16} strokeWidth={1.75} />
                              <span className="sr-only">Mover para baixo</span>
                            </SubmitButton>
                          </form>
                          <form action={removeEvidence}>
                            <input type="hidden" name="evidenceId" value={evidence.id} />
                            <SubmitButton variant="ghost" size="sm" pendingLabel="Removendo...">
                              Remover
                            </SubmitButton>
                          </form>
                        </div>
                      }
                    />
                  ))}
                </div>
              ) : null}
              <div className="border-t border-line pt-4">
                <EvidenceForm projectId={project.id} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-ink">{projectManage.skillsTitle}</h3>
            </CardHeader>
            <CardBody className="space-y-5">
              {project.skills.length > 0 ? (
                <ul className="flex flex-wrap items-center gap-2">
                  {project.skills.map((projectSkill) => (
                    <li key={projectSkill.id} className="flex items-center gap-1">
                      <SkillBadge
                        name={projectSkill.skill.name}
                        verified={projectSkill.validatedByTeacher}
                      />
                      {projectSkill.validatedByTeacher ? null : (
                        <form action={removeProjectSkill}>
                          <input type="hidden" name="projectSkillId" value={projectSkill.id} />
                          <SubmitButton variant="ghost" size="sm" pendingLabel="...">
                            Remover
                          </SubmitButton>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="text-xs text-muted">{projectManage.skillVerifiedNote}</p>
              <div className="border-t border-line pt-4">
                <SkillPicker
                  projectId={project.id}
                  skills={schoolSkills}
                  selectedIds={project.skills.map((projectSkill) => projectSkill.skill.id)}
                />
              </div>
            </CardBody>
          </Card>

          {canDelete ? (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-ink">{projectManage.deleteTitle}</h3>
              </CardHeader>
              <CardBody>
                <ConfirmDialog
                  triggerLabel={projectManage.deleteAction}
                  title={projectManage.deleteTitle}
                  description={projectManage.deleteConfirm}
                  confirmLabel={projectManage.deleteAction}
                  action={deleteProject}
                  hiddenFields={{ projectId: project.id }}
                />
              </CardBody>
            </Card>
          ) : null}
        </section>
      ) : null}

      {canPublish ? (
        <section className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-ink">{projectManage.visibilityTitle}</h3>
            </CardHeader>
            <CardBody>
              <form action={setProjectVisibility} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="projectId" value={project.id} />
                <div className="space-y-1.5">
                  <Label htmlFor="visibility">Quem pode ver este projeto</Label>
                  <Select
                    key={project.visibility}
                    id="visibility"
                    name="visibility"
                    defaultValue={project.visibility}
                  >
                    {(["PRIVATE", "SCHOOL", "PUBLIC"] as const).map((value) => (
                      <option key={value} value={value}>
                        {VISIBILITY_LABELS[value]}
                      </option>
                    ))}
                  </Select>
                </div>
                <SubmitButton size="sm" variant="secondary" pendingLabel="Salvando...">
                  Salvar visibilidade
                </SubmitButton>
              </form>
              {project.status === "APPROVED" ? null : (
                <p className="mt-2 text-xs text-muted">{projectCopy.publishNote}</p>
              )}
            </CardBody>
          </Card>
        </section>
      ) : null}

      {canReview || canArchive ? (
        <TeacherReviewPanel
          projectId={project.id}
          status={project.status}
          skills={project.skills.map((projectSkill) => ({
            id: projectSkill.id,
            name: projectSkill.skill.name,
            verified: projectSkill.validatedByTeacher,
          }))}
          isFeatured={project.isFeatured}
          canFeature={canFeatureProject(permissionViewer, projectCtx)}
          canArchive={canArchive}
          eventEntry={
            eventEntry
              ? {
                  id: eventEntry.id,
                  eventName: eventEntry.event.name,
                  isHighlight: eventEntry.isHighlight,
                }
              : null
          }
        />
      ) : null}

      {(isMember || isStaff) && project.validations.length > 0 ? (
        <section className="space-y-3">
          <SectionTitle>{projectManage.historyTitle}</SectionTitle>
          <ul className="space-y-3">
            {project.validations.map((validation) => (
              <li key={validation.id} className="lp-sticker lp-sticker-soft bg-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink">
                    {validation.action === "APPROVED" ? "Projeto aprovado" : "Ajustes solicitados"}
                    <span className="font-normal text-muted"> — {validation.reviewer.name}</span>
                  </p>
                  <span className="text-xs text-muted">{formatDate(validation.createdAt)}</span>
                </div>
                {validation.comment ? (
                  <p className="mt-2 text-sm whitespace-pre-wrap text-ink">{validation.comment}</p>
                ) : null}
                {validation.strengths ? (
                  <p className="mt-2 text-sm whitespace-pre-wrap text-muted">
                    Pontos fortes: {validation.strengths}
                  </p>
                ) : null}
                {validation.improvements ? (
                  <p className="mt-1 text-sm whitespace-pre-wrap text-muted">
                    O que pode melhorar: {validation.improvements}
                  </p>
                ) : null}
                {validation.generalComment ? (
                  <p className="mt-1 text-sm whitespace-pre-wrap text-muted">
                    {validation.generalComment}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
