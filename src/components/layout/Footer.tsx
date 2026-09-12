import Link from "next/link";
import { brand } from "@/lib/copy";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          {brand.name} — {brand.tagline}
        </p>
        <nav className="flex items-center gap-4" aria-label="Rodapé">
          <Link href="/privacy" className="transition-colors hover:text-ink">
            Privacidade
          </Link>
          <Link href="/login" className="transition-colors hover:text-ink">
            Entrar
          </Link>
        </nav>
      </div>
    </footer>
  );
}
