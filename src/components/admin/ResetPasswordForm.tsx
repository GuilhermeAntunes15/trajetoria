"use client";

import { useActionState } from "react";
import { resetUserPasswordAction, type AdminFormState } from "@/actions/admin.actions";
import { SubmitButton } from "@/components/common/SubmitButton";
import { admin as adminCopy } from "@/lib/copy";

const initialState: AdminFormState = {};

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [state, formAction] = useActionState(resetUserPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="userId" value={userId} />

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      {state.password ? (
        <div className="rounded-[var(--radius-card)] border border-success/30 bg-success/5 px-4 py-3">
          <p className="text-sm font-medium text-ink">{adminCopy.passwordOnce}</p>
          <p className="mt-1 font-mono text-base text-ink">{state.password}</p>
        </div>
      ) : null}

      <SubmitButton size="sm" variant="secondary" pendingLabel="Gerando...">
        {adminCopy.resetPasswordAction}
      </SubmitButton>
    </form>
  );
}
