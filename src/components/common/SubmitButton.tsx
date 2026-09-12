"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export function SubmitButton({
  children,
  pendingLabel = "Salvando...",
  variant = "primary",
  size = "md",
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} size={size} className={className} disabled={pending}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
