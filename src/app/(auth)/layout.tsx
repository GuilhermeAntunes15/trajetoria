import Link from "next/link";
import { brand } from "@/lib/copy";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
          <Link href="/" className="font-display text-lg font-semibold text-ink">
            {brand.name}
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        {children}
      </main>
      <footer className="px-4 py-6 text-center text-xs text-muted">
        <Link href="/privacy" className="transition-colors hover:text-ink">
          Privacidade
        </Link>
      </footer>
    </div>
  );
}
