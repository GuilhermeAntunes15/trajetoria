import { AppShell } from "@/components/layout/AppShell";
import { PublicShell } from "@/components/layout/PublicShell";
import { getViewer } from "@/lib/session";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();

  if (!viewer) {
    return <PublicShell key="anon">{children}</PublicShell>;
  }

  return (
    <AppShell key={viewer.id} viewer={viewer}>
      {children}
    </AppShell>
  );
}
