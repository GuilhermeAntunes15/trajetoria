"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type FormState } from "@/actions/auth.actions";
import { SubmitButton } from "@/components/common/SubmitButton";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

const initialState: FormState = {};

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Field id="email" label="E-mail" required>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-sm text-success">
          {state.success}
        </p>
      ) : null}

      <SubmitButton pendingLabel="Enviando..." className="w-full">
        Enviar link
      </SubmitButton>
    </form>
  );
}
