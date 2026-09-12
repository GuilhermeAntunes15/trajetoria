import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireRole(["ADMIN"], "/admin");

  return <AppShell viewer={viewer}>{children}</AppShell>;
}
