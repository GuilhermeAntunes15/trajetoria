import Link from "next/link";
import { SearchInput } from "@/components/layout/SearchInput";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { brand } from "@/lib/copy";

export function PublicHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="font-display text-xl font-bold text-ink">
          {brand.name}
        </Link>
        <SearchInput id="public-search" className="hidden w-full max-w-xs md:block" />
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Navegação principal">
          <Link
            href="/projects"
            className="rounded-[var(--radius-control)] px-3 py-2 text-sm text-muted transition-colors hover:text-ink"
          >
            Projetos
          </Link>
          <Link
            href="/events"
            className="rounded-[var(--radius-control)] px-3 py-2 text-sm text-muted transition-colors hover:text-ink"
          >
            Eventos
          </Link>
          <ButtonLink href="/login" size="sm">
            Entrar
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
