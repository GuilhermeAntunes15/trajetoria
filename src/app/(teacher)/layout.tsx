import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/session";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireRole(["TEACHER", "ADMIN"], "/teacher");

  return <AppShell viewer={viewer}>{children}</AppShell>;
}
