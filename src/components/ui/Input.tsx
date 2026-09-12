import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const controlClass =
  "w-full rounded-[var(--radius-control)] border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted/70 transition-colors hover:border-muted/40 focus:border-brand aria-[invalid=true]:border-danger disabled:bg-canvas disabled:text-muted";

export function Input({ className, type = "text", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type={type} className={cn(controlClass, "h-10", className)} {...props} />;
}
