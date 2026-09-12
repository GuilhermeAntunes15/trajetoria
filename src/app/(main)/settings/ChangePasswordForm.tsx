"use client";

import { useActionState } from "react";
import { changePasswordAction, type FormState } from "@/actions/auth.actions";
import { SubmitButton } from "@/components/common/SubmitButton";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

const initialState: FormState = {};

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <Field id="currentPassword" label="Senha atual" required>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="password" label="Nova senha" hint="Pelo menos 8 caracteres." required>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>

        <Field id="confirmPassword" label="Confirmar nova senha" required>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <SubmitButton variant="secondary" pendingLabel="Salvando...">
        Trocar senha
      </SubmitButton>
    </form>
  );
}
