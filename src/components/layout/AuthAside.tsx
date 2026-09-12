import { BadgeCheck, FolderOpen, ScrollText } from "lucide-react";
import { Kicker, rotateStyle } from "@/components/common/decor";
import { auth as authCopy, brand } from "@/lib/copy";
import { cn } from "@/lib/utils";

const ICONS = [FolderOpen, BadgeCheck, ScrollText];
const TINTS = ["var(--color-lp-mint)", "var(--color-lp-sun)", "var(--color-lp-sky)"];
const ROTATIONS = [-1.5, 1.5, -1];

/**
 * Painel lateral das telas de acesso. Só aparece a partir do desktop: no
 * celular a pessoa quer entrar, não ler a proposta do produto de novo.
 */
export function AuthAside({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-sticker)] border-2 border-ink bg-lp-forest p-8 text-lp-paper shadow-[6px_6px_0_var(--color-ink)]",
        className,
      )}
    >
      <div className="lp-dots pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />

      <div className="relative space-y-6">
        <Kicker tone="paper">{brand.name}</Kicker>

        <h2 className="font-display text-3xl leading-[1.08] font-bold text-lp-paper">
          {authCopy.asideTitle}
        </h2>
        <p className="max-w-sm text-base leading-relaxed text-lp-paper/80">{authCopy.asideText}</p>

        <ul className="flex flex-col items-start gap-3 pt-1">
          {authCopy.asidePoints.map((point, index) => {
            const Icon = ICONS[index] ?? FolderOpen;

            return (
              <li
                key={point}
                className="lp-sticker lp-sticker-flat inline-flex items-center gap-3 px-4 py-3 text-sm font-bold text-ink"
                style={{ ...rotateStyle(ROTATIONS[index] ?? 0), backgroundColor: TINTS[index] }}
              >
                <Icon size={18} strokeWidth={2.25} aria-hidden="true" />
                {point}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
