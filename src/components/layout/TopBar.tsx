import Link from "next/link";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { SearchInput } from "@/components/layout/SearchInput";
import { UserMenu } from "@/components/layout/UserMenu";
import { brand } from "@/lib/copy";
import type { Viewer } from "@/lib/session";

export function TopBar({ viewer }: { viewer: Viewer }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur-[2px]">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/dashboard" className="font-display text-base font-semibold text-ink md:hidden">
          {brand.name}
        </Link>
        <SearchInput className="hidden w-full max-w-sm sm:block" />
        <div className="flex items-center gap-2">
          <NotificationBell userId={viewer.id} />
          <UserMenu name={viewer.name} username={viewer.username} avatarUrl={viewer.avatarUrl} />
        </div>
      </div>
    </header>
  );
}
