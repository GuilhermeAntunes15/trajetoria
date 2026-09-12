import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function SchoolRedirectPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?redirectTo=%2Fschool");

  const school = await prisma.school.findUniqueOrThrow({
    where: { id: viewer.schoolId },
    select: { slug: true },
  });

  redirect(`/s/${school.slug}`);
}
