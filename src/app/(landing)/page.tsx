import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  FolderOpen,
  ListChecks,
  MessageSquareText,
  ScrollText,
} from "lucide-react";
import { BadgeCollection } from "@/components/landing/BadgeCollection";
import { Hero } from "@/components/landing/Hero";
import { Phases } from "@/components/landing/Phases";
import { ProjectShowcase } from "@/components/landing/ProjectShowcase";
import { Reveal } from "@/components/landing/Reveal";
import {
  ArrowDoodle,
  Kicker,
  LandingButton,
  Squiggle,
  delayStyle,
  rotateStyle,
} from "@/components/landing/decor";
import { landing } from "@/lib/copy";

const GRADE_ICONS = [FolderOpen, BadgeCheck, CalendarDays, ScrollText];
const GRADE_COLORS = [
  "var(--color-lp-mint)",
  "var(--color-lp-sun)",
  "var(--color-lp-sky)",
  "var(--color-lp-tangerine)",
];
const GRADE_ROTATIONS = [-1.5, 1, 1.5, -1];
const TEACHER_ICONS = [ListChecks, MessageSquareText, BadgeCheck];

export default function LandingPage() {
  const certificate = landing.certificate;

  return (
    <>
      {/* Sem JavaScript, o estado inicial das revelações é neutralizado. */}
      <noscript>
        <style>{`[data-reveal="pending"] .lp-item{opacity:1;transform:none}[data-reveal="pending"] .lp-grow{transform:scaleX(1)}`}</style>
      </noscript>

      <Hero />

      {/* 2. O problema — bloco cheio, o ponto mais escuro da página. */}
      <section className="overflow-hidden bg-lp-forest text-lp-paper" aria-labelledby="lp-problem-title">
        <div className="mx-auto grid max-w-5xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div>
            <Kicker tone="paper">{landing.problemTitle}</Kicker>
            <h2
              id="lp-problem-title"
              className="mt-6 font-display text-[1.75rem] leading-[1.15] font-bold text-lp-paper sm:text-[2.5rem]"
            >
              {landing.problemText}
            </h2>
            <Squiggle className="mt-6" color="var(--color-lp-sun)" />
          </div>

          <Reveal className="flex flex-col items-start gap-8">
            <div className="lp-item flex w-full items-center gap-4">
              <div
                className="lp-sticker lp-lift bg-surface px-5 py-4 text-ink"
                style={rotateStyle(-3)}
              >
                <p className="text-[0.7rem] font-bold tracking-[0.14em] text-muted uppercase">
                  {landing.problemNoteLabel}
                </p>
                <p className="mt-1 font-display text-4xl leading-none font-bold text-ink">
                  {landing.problemNoteValue}
                </p>
                <p className="mt-1 text-sm text-muted">{landing.problemNoteCaption}</p>
              </div>
              <ArrowDoodle className="h-14 w-14 shrink-0 text-lp-sun" />
            </div>

            <div className="lp-item w-full" style={delayStyle(140)}>
              <div className="lp-sticker lp-lift bg-lp-sun p-5 text-ink" style={rotateStyle(1.5)}>
                <h3 className="font-display text-2xl leading-tight font-bold text-ink sm:text-3xl">
                  {landing.problemAnswer}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/80 sm:text-base">
                  {landing.problemAnswerText}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3. As quatro fases da trajetória. */}
      <Phases />

      {/* 4. Um projeto real, com progresso e competências verificadas. */}
      <ProjectShowcase />

      {/* 5. Mais do que notas + certificado. */}
      <section className="overflow-hidden bg-lp-paper" aria-labelledby="lp-more-title">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <h2
            id="lp-more-title"
            className="font-display text-3xl leading-[1.05] font-bold text-ink sm:text-5xl"
          >
            {landing.moreThanGradesTitle}
          </h2>
          <Squiggle className="mt-4" color="var(--color-info)" />
          <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
            {landing.moreThanGradesText}
          </p>

          <Reveal className="mt-12 grid gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <ul className="grid gap-5 sm:grid-cols-2">
              {landing.moreThanGrades.map((item, index) => {
                const Icon = GRADE_ICONS[index] ?? FolderOpen;

                return (
                  <li key={item.title} className="lp-item" style={delayStyle(index * 90)}>
                    <div
                      className="lp-sticker lp-lift flex h-full flex-col bg-surface p-5"
                      style={rotateStyle(GRADE_ROTATIONS[index] ?? 0)}
                    >
                      <span
                        className="grid size-11 place-items-center rounded-full border-2 border-ink text-ink"
                        style={{ backgroundColor: GRADE_COLORS[index] }}
                      >
                        <Icon size={20} strokeWidth={2.25} aria-hidden="true" />
                      </span>
                      <h3 className="mt-4 font-display text-xl leading-tight font-bold text-ink">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="lp-item" style={delayStyle(300)}>
              <article className="lp-sticker lp-lift bg-surface p-6" style={rotateStyle(1.5)}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[0.7rem] font-bold tracking-[0.14em] text-muted uppercase">
                    {certificate.label}
                  </p>
                  <ScrollText size={20} strokeWidth={2} className="text-brand" aria-hidden="true" />
                </div>

                <div className="mt-4 rounded-[12px] border-2 border-dashed border-ink/25 p-5 text-center">
                  <p className="font-display text-2xl leading-tight font-bold text-ink">
                    {certificate.student}
                  </p>
                  <p className="mt-2 text-sm text-muted">{certificate.title}</p>
                  <p className="mt-3 inline-flex rounded-full border-2 border-ink bg-lp-mint px-3 py-1 text-xs font-bold text-ink">
                    {certificate.hours}
                  </p>
                </div>

                <dl className="mt-4 flex items-baseline justify-between gap-3">
                  <dt className="text-[0.7rem] font-bold tracking-[0.14em] text-muted uppercase">
                    {certificate.codeLabel}
                  </dt>
                  <dd className="font-mono text-sm font-semibold tracking-wider text-ink">
                    {certificate.code}
                  </dd>
                </dl>
                <p className="mt-3 text-xs leading-relaxed text-muted">{certificate.note}</p>
              </article>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6. A coleção de badges da escola. */}
      <BadgeCollection />

      {/* 7. O outro lado: o professor. */}
      <section className="overflow-hidden bg-canvas" aria-labelledby="lp-teacher-title">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <Reveal>
            <div className="lp-item">
              <div className="lp-sticker bg-lp-sky p-6 sm:p-10">
                <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                  <div>
                    <Kicker>{landing.teacherKicker}</Kicker>
                    <h2
                      id="lp-teacher-title"
                      className="mt-5 font-display text-3xl leading-[1.05] font-bold text-ink sm:text-4xl"
                    >
                      {landing.teacherTitle}
                    </h2>
                    <p className="mt-4 max-w-sm text-base leading-relaxed text-ink/75">
                      {landing.teacherText}
                    </p>
                  </div>

                  <ol className="grid gap-4">
                    {landing.teacherItems.map((item, index) => {
                      const Icon = TEACHER_ICONS[index] ?? ListChecks;

                      return (
                        <li
                          key={item.title}
                          className="flex items-start gap-4 rounded-[12px] border-2 border-ink bg-surface p-4"
                        >
                          <span
                            className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink bg-lp-paper text-ink"
                            aria-hidden="true"
                          >
                            <Icon size={18} strokeWidth={2.25} />
                          </span>
                          <div>
                            <h3 className="font-display text-lg leading-tight font-bold text-ink">
                              {item.title}
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-muted">{item.text}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 8. Faixa final em cor cheia. */}
      <section className="relative overflow-hidden bg-brand" aria-labelledby="lp-final-title">
        <div className="lp-dots pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <h2
            id="lp-final-title"
            className="mx-auto max-w-3xl font-display text-[2.25rem] leading-[1.02] font-bold text-white sm:text-6xl"
          >
            {landing.finalTitle}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/85 sm:text-xl">
            {landing.finalText}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LandingButton href="/s/ee-horizonte" tone="sun" className="whitespace-nowrap">
              {landing.finalCta}
              <ArrowRight size={20} strokeWidth={2.5} aria-hidden="true" />
            </LandingButton>
            <LandingButton href="/login" tone="paper" className="text-base whitespace-nowrap sm:text-base">
              {landing.finalCtaSecondary}
            </LandingButton>
          </div>
        </div>
      </section>
    </>
  );
}
