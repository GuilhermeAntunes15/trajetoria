import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { TopBar } from "@/components/layout/TopBar";
import { brand } from "@/lib/copy";
import type { Viewer } from "@/lib/session";

export function AppShell({ viewer, children }: { viewer: Viewer; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh">
      <a href="#conteudo" className="skip-link">
        {brand.skipToContent}
      </a>
      <AppSidebar role={viewer.role} username={viewer.username} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar viewer={viewer} />
        <main
          id="conteudo"
          className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-28 sm:px-6 md:pb-10"
        >
          {children}
        </main>
      </div>
      <MobileNavigation username={viewer.username} role={viewer.role} />
    </div>
  );
}
