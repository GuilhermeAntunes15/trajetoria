import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const buttonVariants: Record<ButtonVariant, string> = {
  primary: "border-brand bg-brand text-white hover:bg-brand-hover",
  secondary: "border-line bg-surface text-ink hover:bg-canvas",
  ghost: "border-transparent bg-transparent text-muted hover:bg-canvas hover:text-ink",
  danger: "border-danger bg-danger text-white hover:opacity-90",
};

export const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
      {...props}
    />
  );
}
