import type { SelectHTMLAttributes } from "react";
import { controlClass } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlClass, "h-10 appearance-none bg-surface pr-8", className)} {...props}>
      {children}
    </select>
  );
}
