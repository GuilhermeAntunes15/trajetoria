"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { managementNavItems, primaryNavItems, type NavItem } from "@/components/layout/nav-items";
import { brand } from "@/lib/copy";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  role: Role;
  username: string;
};

const EXACT_MATCH_HREFS = ["/dashboard", "/teacher"];

function isActive(pathname: string, href: string): boolean {
  if (EXACT_MATCH_HREFS.includes(href)) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-[var(--radius-control)] px-3 py-2 text-sm transition-colors",
        active ? "bg-brand/10 font-medium text-brand" : "text-muted hover:bg-canvas hover:text-ink",
      )}
    >
      <Icon size={18} strokeWidth={1.75} />
      {item.label}
    </Link>
  );
}

export function AppSidebar({ role, username }: AppSidebarProps) {
  const pathname = usePathname();
  const management = managementNavItems(role);

  return (
    <aside className="hidden w-60 shrink-0 border-r border-line bg-surface md:block">
      <div className="sticky top-0 flex h-dvh flex-col gap-6 px-3 py-5">
        <Link href="/dashboard" className="px-2 font-display text-lg font-semibold text-ink">
          {brand.name}
        </Link>

        <nav className="space-y-1" aria-label="Navegação">
          {primaryNavItems(username).map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>

        {management.length > 0 ? (
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold tracking-[0.08em] text-muted uppercase">Gestão</p>
            <nav className="space-y-1" aria-label="Gestão">
              {management.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} />
              ))}
            </nav>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
