import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Checkbox({ id, label, hint, className, ...props }: CheckboxProps) {
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 rounded-[4px] border border-line accent-brand"
        {...props}
      />
      <div className="space-y-0.5">
        <label htmlFor={id} className="block text-sm text-ink">
          {label}
        </label>
        {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      </div>
    </div>
  );
}
