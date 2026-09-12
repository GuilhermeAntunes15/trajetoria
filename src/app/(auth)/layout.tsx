import Link from "next/link";
import { AuthAside } from "@/components/layout/AuthAside";
import { brand } from "@/lib/copy";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="border-b-2 border-ink bg-lp-paper">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Link href="/" className="font-display text-xl font-bold text-ink">
            {brand.name}
          </Link>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 lg:py-16">
        <main className="w-full max-w-md justify-self-center lg:justify-self-end">{children}</main>
        <AuthAside className="hidden lg:block" />
      </div>

      <footer className="px-4 py-6 text-center text-xs text-muted">
        <Link href="/privacy" className="transition-colors hover:text-ink">
          Privacidade
        </Link>
      </footer>
    </div>
  );
}
