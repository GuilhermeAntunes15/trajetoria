"use client";

import { useActionState } from "react";
import type { Visibility } from "@prisma/client";
import { updatePrivacy, type ProfileState } from "@/actions/profile.actions";
import { SubmitButton } from "@/components/common/SubmitButton";
import { settings } from "@/lib/copy";

const initialState: ProfileState = {};

const OPTIONS: Visibility[] = ["PRIVATE", "SCHOOL", "PUBLIC"];

export function PrivacyForm({ profileVisibility }: { profileVisibility: Visibility }) {
  const [state, formAction] = useActionState(updatePrivacy, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">Quem pode ver meu perfil</legend>
        <div className="space-y-2">
          {OPTIONS.map((option) => (
            <label key={option} htmlFor={`visibility-${option}`} className="flex items-start gap-2.5">
              <input
                key={profileVisibility}
                id={`visibility-${option}`}
                type="radio"
                name="profileVisibility"
                value={option}
                defaultChecked={profileVisibility === option}
                className="mt-0.5 size-4 accent-brand"
              />
              <span className="text-sm text-ink">{settings.visibilityOptions[option]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className="text-xs text-muted">{settings.privacyNote}</p>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <SubmitButton variant="secondary" pendingLabel="Salvando...">
        Salvar privacidade
      </SubmitButton>
    </form>
  );
}
