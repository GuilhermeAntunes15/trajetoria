import Link from "next/link";
import { GitFork } from "lucide-react";
import { fork as forkCopy } from "@/lib/copy";

export type ForkParent = {
  title: string;
  year: number;
  slug: string | null;
};

export function ForkNotice({ parent }: { parent: ForkParent }) {
  return (
    <p className="inline-flex items-center gap-2 text-sm text-muted">
      <GitFork size={16} strokeWidth={1.75} />
      {parent.slug ? (
        <span>
          Este projeto é uma continuação de{" "}
          <Link href={`/projects/${parent.slug}`} className="font-medium text-brand hover:text-brand-hover">
            {parent.title}
          </Link>{" "}
          — {parent.year}
        </span>
      ) : (
        <span>{forkCopy.notice(parent.title, parent.year)}</span>
      )}
    </p>
  );
}
