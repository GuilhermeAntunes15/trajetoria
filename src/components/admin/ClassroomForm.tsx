"use client";

import { useActionState } from "react";
import { saveClassroomAction, type AdminFormState } from "@/actions/admin.actions";
import { SubmitButton } from "@/components/common/SubmitButton";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { admin as adminCopy } from "@/lib/copy";

const initialState: AdminFormState = {};

export function ClassroomForm({
  defaults,
}: {
  defaults?: { classroomId: string; name: string; year: number };
}) {
  const [state, formAction] = useActionState(saveClassroomAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="classroomId" value={defaults?.classroomId ?? ""} />

      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <Field id="classroom-name" label={adminCopy.classNameLabel} required>
          <Input
            id="classroom-name"
            name="name"
            defaultValue={defaults?.name}
            maxLength={80}
            required
          />
        </Field>

        <Field id="classroom-year" label={adminCopy.classYearLabel} required>
          <Input
            id="classroom-year"
            name="year"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            defaultValue={defaults?.year ?? new Date().getFullYear()}
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

      <SubmitButton size="sm" pendingLabel="Salvando...">
        {defaults ? "Salvar turma" : adminCopy.newClass}
      </SubmitButton>
    </form>
  );
}
