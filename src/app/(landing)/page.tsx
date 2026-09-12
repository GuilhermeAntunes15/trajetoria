import { ArrowRight } from "lucide-react";
import { SectionTitle } from "@/components/common/SectionTitle";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { landing } from "@/lib/copy";

export default function LandingPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
      <section className="border-b border-line py-16 sm:py-24">
        <p className="text-xs font-semibold tracking-[0.12em] text-brand uppercase">
          Portfólio acadêmico
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-3xl leading-[1.15] font-semibold text-ink sm:text-5xl">
          {landing.heroTitle}
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted sm:text-lg">{landing.heroSubtitle}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ButtonLink href="/projects">
            {landing.heroCta}
            <ArrowRight size={18} strokeWidth={1.75} />
          </ButtonLink>
          <ButtonLink href="/login" variant="secondary">
            Entrar
          </ButtonLink>
        </div>
      </section>

      <section className="grid gap-6 border-b border-line py-14 sm:grid-cols-[12rem_1fr] sm:py-20">
        <SectionTitle className="sm:pt-2">{landing.problemTitle}</SectionTitle>
        <p className="max-w-2xl font-display text-xl leading-relaxed text-ink sm:text-2xl">
          {landing.problemText}
        </p>
      </section>

      <section className="border-b border-line py-14 sm:py-20">
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          {landing.transformTitle}
        </h2>
        <ol className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {landing.steps.map((step, index) => (
            <li key={step.title} className="bg-surface p-5">
              <span className="text-xs font-semibold tracking-[0.12em] text-brand">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-base font-semibold text-ink">{step.title}</h3>
              <p className="mt-1 text-sm text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-b border-line py-14 sm:py-20">
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          {landing.moreThanGradesTitle}
        </h2>
        <dl className="mt-8 grid gap-8 sm:grid-cols-2">
          {landing.moreThanGrades.map((item) => (
            <div key={item.title} className="border-t border-line pt-4">
              <dt className="text-base font-semibold text-ink">{item.title}</dt>
              <dd className="mt-1 text-sm text-muted">{item.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="py-14 sm:py-20">
        <p className="max-w-2xl font-display text-xl leading-relaxed text-ink sm:text-2xl">
          {landing.closingLines[3]}
        </p>
        <p className="mt-2 max-w-2xl text-sm text-muted">{landing.closingLines[6]}</p>
        <ButtonLink href="/login" className="mt-6">
          Entrar na plataforma
        </ButtonLink>
      </section>
    </div>
  );
}
