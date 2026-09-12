import { cn } from "@/lib/utils";

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-xs font-semibold tracking-[0.08em] text-muted uppercase", className)}>
      {children}
    </h2>
  );
}
