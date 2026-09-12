import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

type StudentAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-lg",
};

export function StudentAvatar({ name, avatarUrl, size = "md", className }: StudentAvatarProps) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className={cn("shrink-0 rounded-full border border-line object-cover", sizes[size], className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-brand/20 bg-brand/10 font-medium text-brand",
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
