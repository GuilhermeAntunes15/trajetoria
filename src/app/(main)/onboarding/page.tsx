import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/app/(main)/onboarding/OnboardingForm";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { onboarding } from "@/lib/copy";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Boas-vindas" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const viewer = await requireUser("/onboarding");

  if (viewer.role !== "STUDENT" || !viewer.mustCompleteOnboarding) {
    redirect("/dashboard");
  }

  const [user, classrooms] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: viewer.id },
      select: {
        name: true,
        bio: true,
        avatarUrl: true,
        studentProfile: {
          select: { course: true, gradeYear: true, classroomId: true, interests: true },
        },
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
      <PageHeader title={onboarding.title} description={onboarding.subtitle} />
      <Card>
        <CardBody>
          <OnboardingForm
            defaultName={user.name}
            defaultAvatarUrl={user.avatarUrl}
            defaultBio={user.bio ?? ""}
            defaultCourse={user.studentProfile?.course ?? ""}
            defaultGradeYear={user.studentProfile?.gradeYear ?? ""}
            defaultClassroomId={user.studentProfile?.classroomId ?? ""}
            defaultInterests={user.studentProfile?.interests ?? []}
            classrooms={classrooms}
          />
        </CardBody>
      </Card>
    </div>
  );
}
