import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  pageCount: number;
  buildHref: (page: number) => string;
  className?: string;
};

const linkClass =
  "inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-control)] border border-line bg-surface px-3 text-sm text-ink transition-colors hover:bg-canvas";

export function Pagination({ page, pageCount, buildHref, className }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Paginação" className={cn("flex items-center justify-between gap-3", className)}>
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className={linkClass} rel="prev">
          <ChevronLeft size={16} strokeWidth={1.75} />
          Anterior
        </Link>
      ) : (
        <span aria-hidden />
      )}

      <p className="text-sm text-muted">
        Página {page} de {pageCount}
      </p>

      {page < pageCount ? (
        <Link href={buildHref(page + 1)} className={linkClass} rel="next">
          Próxima
          <ChevronRight size={16} strokeWidth={1.75} />
        </Link>
      ) : (
        <span aria-hidden />
      )}
    </nav>
  );
}
