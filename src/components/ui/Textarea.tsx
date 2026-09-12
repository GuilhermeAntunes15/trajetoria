import type { TextareaHTMLAttributes } from "react";
import { controlClass } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export function Textarea({ className, rows = 4, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={cn(controlClass, "py-2 leading-relaxed", className)} {...props} />;
}
