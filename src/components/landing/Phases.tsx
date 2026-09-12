import { BadgeCheck, LayoutGrid, Paperclip, PenLine } from "lucide-react";
import type { CSSProperties } from "react";
import { Reveal } from "@/components/landing/Reveal";
import { Kicker, Squiggle, delayStyle, rotateStyle } from "@/components/landing/decor";
import { landing } from "@/lib/copy";

const PHASES = [
  { Icon: PenLine, block: "var(--color-lp-mint)", accent: "var(--color-brand)", rot: -1.5 },
  { Icon: Paperclip, block: "var(--color-lp-sky)", accent: "var(--color-info)", rot: 1.5 },
  { Icon: BadgeCheck, block: "var(--color-lp-sun)", accent: "var(--color-warning)", rot: -1 },
  { Icon: LayoutGrid, block: "var(--color-lp-tangerine)", accent: "var(--color-accent)", rot: 2 },
];

export function Phases() {
  return (
    <section className="overflow-hidden bg-canvas" aria-labelledby="lp-phases-title">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <Kicker>{landing.transformKicker}</Kicker>
        <h2
          id="lp-phases-title"
          className="mt-5 max-w-2xl font-display text-3xl leading-[1.05] font-bold text-ink sm:text-5xl"
        >
          {landing.transformTitle}
        </h2>
        <Squiggle className="mt-4" />
        <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">{landing.transformText}</p>

        <Reveal className="relative mt-12">
          <div
            className="absolute top-[4.75rem] right-0 left-0 hidden border-t-2 border-dashed border-ink/25 lg:block"
            aria-hidden="true"
          />
          <ol className="grid gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-5">
            {landing.steps.map((step, index) => {
              const style = PHASES[index];
              const { Icon } = style;

              return (
                <li
                  key={step.title}
                  className="lp-item relative"
                  style={delayStyle(index * 110)}
                >
                  <div
                    className="lp-sticker lp-lift flex h-full flex-col bg-surface p-5"
                    style={rotateStyle(style.rot)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-ink text-ink"
                        style={{ backgroundColor: style.block }}
                      >
                        <Icon size={22} strokeWidth={2.25} aria-hidden="true" />
                      </span>
                      <span
                        className="lp-num font-display text-5xl leading-none font-bold"
                        style={{ "--lp-num-color": style.accent } as CSSProperties}
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <p className="mt-5 text-[0.7rem] font-bold tracking-[0.14em] text-muted uppercase">
                      {step.phase}
                    </p>
                    <h3 className="mt-1 font-display text-2xl leading-tight font-bold text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>

                    <p
                      className="mt-5 inline-flex self-start rounded-full border-2 border-ink px-2.5 py-1 text-xs font-bold text-ink"
                      style={{ backgroundColor: style.block }}
                    >
                      {step.state}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
