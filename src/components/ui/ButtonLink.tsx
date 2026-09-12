import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonBase, buttonSizes, buttonVariants, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
      {...props}
    />
  );
}
