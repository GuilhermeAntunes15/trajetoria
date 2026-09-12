import { cn } from "@/lib/utils";

export type NoticeTone = "info" | "success" | "warning";

const tones: Record<NoticeTone, string> = {
  info: "border-info/30 bg-info/5 text-ink",
  success: "border-success/30 bg-success/5 text-ink",
  warning: "border-warning/40 bg-warning/5 text-ink",
};

type NoticeProps = {
  tone?: NoticeTone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
};

export function Notice({ tone = "info", title, children, className }: NoticeProps) {
  return (
    <div className={cn("rounded-[var(--radius-card)] border px-4 py-3 text-sm", tones[tone], className)}>
      {title ? <p className="font-medium">{title}</p> : null}
      {children ? <div className={cn("text-muted", title ? "mt-1" : undefined)}>{children}</div> : null}
    </div>
  );
}
