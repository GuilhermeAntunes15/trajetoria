"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { logoutAction } from "@/actions/auth.actions";
import { StudentAvatar } from "@/components/project/StudentAvatar";
import { settings } from "@/lib/copy";

type UserMenuProps = {
  name: string;
  username: string;
  avatarUrl: string | null;
};

export function UserMenu({ name, username, avatarUrl }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-[var(--radius-control)] border border-line bg-surface py-1 pr-2 pl-1 text-sm text-ink transition-colors hover:bg-canvas"
      >
        <StudentAvatar name={name} avatarUrl={avatarUrl} size="sm" />
        <span className="hidden max-w-32 truncate sm:inline">{name}</span>
        <ChevronDown size={16} strokeWidth={1.75} className="text-muted" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-52 rounded-[var(--radius-card)] border border-line bg-surface p-1 shadow-[var(--shadow-pop)]"
        >
          <Link
            href={`/u/${username}`}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-sm text-ink transition-colors hover:bg-canvas"
          >
            <UserRound size={16} strokeWidth={1.75} />
            Meu perfil
          </Link>
          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-sm text-ink transition-colors hover:bg-canvas"
          >
            <Settings size={16} strokeWidth={1.75} />
            {settings.title}
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-canvas"
            >
              <LogOut size={16} strokeWidth={1.75} />
              Sair
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
