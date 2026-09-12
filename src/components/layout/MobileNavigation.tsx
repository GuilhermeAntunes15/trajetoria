"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { mobileNavItems } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function MobileNavigation({ username, role }: { username: string; role: Role }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação rápida"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {mobileNavItems(username, role).map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 px-1 py-2 text-[0.68rem] transition-colors",
                  active ? "font-semibold text-ink" : "text-muted",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full border-2 motion-safe:transition-transform motion-safe:duration-200",
                    active
                      ? "-rotate-6 border-ink bg-lp-aqua text-ink"
                      : "border-transparent text-muted",
                  )}
                >
                  <Icon size={19} strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
