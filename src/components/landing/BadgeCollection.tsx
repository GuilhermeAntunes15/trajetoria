import { Code2, FlaskConical, Lightbulb, Microscope, Trophy, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";
import { Kicker, delayStyle, rotateStyle } from "@/components/landing/decor";
import { landing } from "@/lib/copy";

const BADGE_ICONS: Record<string, LucideIcon> = {
  trophy: Trophy,
  code: Code2,
  flask: FlaskConical,
  microscope: Microscope,
  lightbulb: Lightbulb,
};

const BADGE_COLORS = [
  "var(--color-lp-sun)",
  "var(--color-lp-sky)",
  "var(--color-lp-mint)",
  "var(--color-lp-tangerine)",
  "var(--color-lp-sun)",
];

const BADGE_ROTATIONS = [-2, 1.5, -1, 2, -1.5];

export function BadgeCollection() {
  return (
    <section className="overflow-hidden bg-lp-sun" aria-labelledby="lp-badges-title">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <Kicker>{landing.badgesKicker}</Kicker>
        <h2
          id="lp-badges-title"
          className="mt-5 max-w-2xl font-display text-3xl leading-[1.05] font-bold text-ink sm:text-5xl"
        >
          {landing.badgesTitle}
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/75 sm:text-lg">
          {landing.badgesText}
        </p>

        <Reveal>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {landing.badgeList.map((badge, index) => {
              const Icon = BADGE_ICONS[badge.icon] ?? Trophy;

              return (
                <li key={badge.name} className="lp-item" style={delayStyle(80 + index * 90)}>
                  <article
                    className="lp-sticker lp-lift flex h-full flex-col bg-surface p-5"
                    style={rotateStyle(BADGE_ROTATIONS[index] ?? 0)}
                  >
                    <span
                      className="grid size-14 shrink-0 place-items-center rounded-full border-2 border-ink text-ink"
                      style={{ backgroundColor: BADGE_COLORS[index] ?? "var(--color-lp-paper)" }}
                    >
                      <Icon size={26} strokeWidth={2} aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 font-display text-xl leading-tight font-bold text-ink">
                      {badge.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{badge.text}</p>
                  </article>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
