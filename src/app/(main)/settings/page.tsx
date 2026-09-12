import type { Metadata } from "next";
import { ChangePasswordForm } from "@/app/(main)/settings/ChangePasswordForm";
import { PrivacyForm } from "@/app/(main)/settings/PrivacyForm";
import { ProfileForm } from "@/app/(main)/settings/ProfileForm";
import { PageHeader } from "@/components/common/PageHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { settings } from "@/lib/copy";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Configurações" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const viewer = await requireUser("/settings");

  const [user, classrooms] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: viewer.id },
      select: {
        name: true,
        username: true,
        bio: true,
        avatarUrl: true,
        role: true,
        profileVisibility: true,
        studentProfile: {
          select: { course: true, gradeYear: true, classroomId: true, interests: true },
        },
        teacherProfile: { select: { subject: true, title: true } },
      },
    }),
    prisma.classroom.findMany({
      where: { schoolId: viewer.schoolId },
      orderBy: [{ year: "desc" }, { name: "asc" }],
      select: { id: true, name: true, year: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title={settings.title}
        description={settings.subtitle}
        actions={
          <ButtonLink href={`/u/${user.username}`} variant="secondary" size="sm">
            Ver meu perfil
          </ButtonLink>
        }
      />

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink">{settings.profileTitle}</h2>
          <p className="mt-0.5 text-sm text-muted">{settings.profileSubtitle}</p>
        </CardHeader>
        <CardBody>
          <ProfileForm
            role={user.role}
            name={user.name}
            avatarUrl={user.avatarUrl}
            bio={user.bio ?? ""}
            course={user.studentProfile?.course ?? ""}
            classroomId={user.studentProfile?.classroomId ?? ""}
            gradeYear={user.studentProfile?.gradeYear ?? ""}
            interests={user.studentProfile?.interests ?? []}
            subject={user.teacherProfile?.subject ?? ""}
            title={user.teacherProfile?.title ?? ""}
            classrooms={classrooms}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink">{settings.privacyTitle}</h2>
          <p className="mt-0.5 text-sm text-muted">{settings.privacySubtitle}</p>
        </CardHeader>
        <CardBody>
          <PrivacyForm profileVisibility={user.profileVisibility} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink">{settings.passwordTitle}</h2>
          <p className="mt-0.5 text-sm text-muted">{settings.passwordSubtitle}</p>
        </CardHeader>
        <CardBody>
          <ChangePasswordForm />
        </CardBody>
      </Card>
    </div>
  );
}
