import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

type StudentAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-lg",
  xl: "size-24 text-3xl sm:size-28",
};

/**
 * Sem foto, a pessoa vira um adesivo de iniciais. A cor sai do próprio nome —
 * é estável entre telas e entre sessões, e não codifica nenhuma informação
 * (não é papel, nem turma, nem desempenho).
 */
const TINTS = [
  "var(--color-lp-mint)",
  "var(--color-lp-sky)",
  "var(--color-lp-sun)",
  "var(--color-lp-tangerine)",
  "var(--color-lp-paper)",
];

function tintFor(name: string): string {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 9973;
  }
  return TINTS[hash % TINTS.length]!;
}

export function StudentAvatar({ name, avatarUrl, size = "md", className }: StudentAvatarProps) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className={cn("shrink-0 rounded-full border-2 border-ink object-cover", sizes[size], className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-ink font-display font-bold text-ink",
        sizes[size],
        className,
      )}
      style={{ backgroundColor: tintFor(name) }}
    >
      {initials(name)}
    </span>
  );
}
