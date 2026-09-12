import Link from "next/link";
import { SectionTitle } from "@/components/common/SectionTitle";
import { fork as forkCopy } from "@/lib/copy";

export type DerivedProject = {
  slug: string;
  title: string;
  year: number;
};

export function DerivedProjects({ projects }: { projects: DerivedProject[] }) {
  if (projects.length === 0) return null;

  return (
    <section className="space-y-3">
      <SectionTitle>{forkCopy.derivedTitle}</SectionTitle>
      <ul className="space-y-2">
        {projects.map((project) => (
          <li key={project.slug} className="text-sm">
            <Link href={`/projects/${project.slug}`} className="font-medium text-ink hover:text-brand">
              {project.title}
            </Link>
            <span className="text-muted"> — {project.year}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
