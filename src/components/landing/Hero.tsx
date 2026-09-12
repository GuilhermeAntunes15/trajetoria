import { ArrowRight, BadgeCheck, Trophy } from "lucide-react";
import {
  FloodCover,
  Kicker,
  LandingButton,
  VerifiedSeal,
  delayStyle,
  rotateStyle,
} from "@/components/landing/decor";
import { landing } from "@/lib/copy";

function HeroTitle() {
  const parts = landing.heroTitle.split(landing.heroTitleMark);

  if (parts.length !== 2) {
    return <>{landing.heroTitle}</>;
  }

  return (
    <>
      {parts[0]}
      <span className="lp-mark">{landing.heroTitleMark}</span>
      {parts[1]}
    </>
  );
}

export function Hero() {
  const project = landing.showcaseProject;

  return (
    <section className="relative overflow-hidden bg-lp-paper" aria-labelledby="lp-hero-title">
      <div className="lp-dots pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-5xl gap-14 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-10 lg:py-24">
        <div>
          <div className="lp-enter" style={delayStyle(0)}>
            <Kicker>{landing.kicker}</Kicker>
          </div>

          <h1
            id="lp-hero-title"
            className="lp-enter mt-6 max-w-[13ch] font-display text-[2.5rem] leading-[1] font-bold text-ink sm:text-[3.5rem] lg:text-[4rem]"
            style={delayStyle(80)}
          >
            <HeroTitle />
          </h1>

          <p
            className="lp-enter mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl"
            style={delayStyle(160)}
          >
            {landing.heroSubtitle}
          </p>

          <div className="lp-enter mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center" style={delayStyle(240)}>
            <LandingButton href="/s/ee-horizonte" tone="sun" className="whitespace-nowrap">
              {landing.heroCta}
              <ArrowRight size={20} strokeWidth={2.5} aria-hidden="true" />
            </LandingButton>
            <LandingButton href="/login" tone="paper" className="text-base whitespace-nowrap sm:text-base">
              {landing.heroCtaSecondary}
            </LandingButton>
          </div>

          <p className="lp-enter mt-5 text-sm text-muted" style={delayStyle(320)}>
            {landing.heroNote}
          </p>
        </div>

        {/* Cluster de adesivos: o projeto como ele fica depois de validado. */}
        <div className="relative mx-auto w-full max-w-[22rem] pt-7 pb-12 lg:max-w-none lg:pt-10 lg:pb-16">
          <div className="lp-enter" style={delayStyle(300)}>
            <article className="lp-sticker lp-lift bg-surface" style={rotateStyle(-2)}>
              <div className="h-24 overflow-hidden rounded-t-[14px] border-b-2 border-ink sm:h-28">
                <FloodCover />
              </div>
              <div className="p-4 sm:p-5">
                <p className="text-[0.7rem] font-bold tracking-[0.1em] text-info uppercase">
                  {project.event}
                </p>
                <p className="mt-2 font-display text-xl leading-tight font-bold text-ink sm:text-2xl">
                  {project.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{project.summary}</p>
                <VerifiedSeal label={project.seal} className="mt-4" />
              </div>
            </article>
          </div>

          <div className="lp-enter absolute -bottom-1 -left-1 sm:-left-3" style={delayStyle(460)}>
            <div className="lp-float">
              <p
                className="lp-sticker lp-sticker-flat lp-lift flex items-center gap-2 bg-lp-sun px-3 py-2 text-sm font-bold text-ink"
                style={rotateStyle(5)}
              >
                <Trophy size={18} strokeWidth={2.25} aria-hidden="true" />
                Projeto Destaque
              </p>
            </div>
          </div>

          <div className="lp-enter absolute -top-1 -right-1 sm:-right-3" style={delayStyle(540)}>
            <p
              className="lp-sticker lp-sticker-flat lp-lift flex items-center gap-2 bg-surface px-3 py-2 text-sm font-bold text-ink"
              style={rotateStyle(-6)}
            >
              <BadgeCheck size={18} strokeWidth={2.25} className="text-brand" aria-hidden="true" />
              Python verificado
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
