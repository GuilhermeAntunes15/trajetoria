import { ArrowUpRight, BadgeCheck, Check } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import {
  FloodCover,
  Kicker,
  Squiggle,
  VerifiedSeal,
  rotateStyle,
} from "@/components/landing/decor";
import { landing } from "@/lib/copy";

export function ProjectShowcase() {
  const project = landing.showcaseProject;
  const lastStep = project.progressSteps.length - 1;

  return (
    <section className="overflow-hidden bg-lp-mint" aria-labelledby="lp-showcase-title">
      <div className="mx-auto grid max-w-5xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <Kicker>{project.event}</Kicker>
          <h2
            id="lp-showcase-title"
            className="mt-5 font-display text-3xl leading-[1.05] font-bold text-ink sm:text-4xl"
          >
            {landing.showcaseTitle}
          </h2>
          <Squiggle className="mt-4" color="var(--color-brand)" />
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            {landing.showcaseText}
          </p>
          <Link
            href="/s/ee-conselheiro-crispiniano"
            className="mt-6 inline-flex items-center gap-1.5 border-b-2 border-ink pb-0.5 text-base font-bold text-ink transition-colors hover:border-brand hover:text-brand"
          >
            {landing.showcaseLink}
            <ArrowUpRight size={18} strokeWidth={2.5} aria-hidden="true" />
          </Link>
        </div>

        <Reveal>
          <div className="lp-item">
            <article className="lp-sticker bg-surface" style={rotateStyle(-1)}>
              <div className="h-28 overflow-hidden rounded-t-[14px] border-b-2 border-ink sm:h-32">
                <FloodCover />
              </div>

              <div className="p-5 sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="rounded-full border-2 border-ink bg-lp-sky px-2.5 py-1 text-xs font-bold text-ink">
                    {project.area}
                  </p>
                  <VerifiedSeal label={project.seal} />
                </div>

                <h3 className="mt-4 font-display text-2xl leading-tight font-bold text-ink sm:text-3xl">
                  {project.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
                  {project.summary}
                </p>

                <div className="mt-6 rounded-[12px] border-2 border-dashed border-ink/25 p-4">
                  <p className="text-[0.7rem] font-bold tracking-[0.14em] text-muted uppercase">
                    {project.roleLabel}
                  </p>
                  <p className="mt-1.5 text-sm text-ink">{project.roleText}</p>
                </div>

                <div className="mt-6">
                  <p className="text-[0.7rem] font-bold tracking-[0.14em] text-muted uppercase">
                    {project.progressLabel}
                  </p>
                  <div
                    className="mt-3 h-3.5 w-full overflow-hidden rounded-full border-2 border-ink bg-lp-paper"
                    aria-hidden="true"
                  >
                    <div className="lp-grow h-full w-full bg-brand" />
                  </div>
                  <ol className="mt-2.5 flex items-center justify-between gap-2 text-xs font-bold text-muted">
                    {project.progressSteps.map((step, index) => (
                      <li
                        key={step}
                        className={
                          index === lastStep
                            ? "inline-flex items-center gap-1 text-brand"
                            : undefined
                        }
                      >
                        {index === lastStep ? (
                          <Check size={14} strokeWidth={3} aria-hidden="true" />
                        ) : null}
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-6">
                  <p className="text-[0.7rem] font-bold tracking-[0.14em] text-muted uppercase">
                    {project.skillsLabel}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {project.skills.map((skill) => (
                      <li key={skill.name}>
                        {skill.verified ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-brand bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
                            <BadgeCheck size={15} strokeWidth={2.25} aria-hidden="true" />
                            {skill.name}
                            <span className="sr-only">— {project.verifiedTag}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-ink/30 px-3 py-1 text-sm font-medium text-muted">
                            {skill.name}
                            <span className="sr-only">— {project.declaredTag}</span>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-muted">{project.skillsNote}</p>
                </div>
              </div>
            </article>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
