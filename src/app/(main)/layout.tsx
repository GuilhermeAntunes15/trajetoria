import { AppShell } from "@/components/layout/AppShell";
import { PublicShell } from "@/components/layout/PublicShell";
import { getViewer } from "@/lib/session";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();

  if (!viewer) {
    return <PublicShell>{children}</PublicShell>;
  }

  return <AppShell viewer={viewer}>{children}</AppShell>;
}
