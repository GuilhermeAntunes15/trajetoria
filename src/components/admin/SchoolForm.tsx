"use client";

import { useActionState, useState } from "react";
import { updateSchoolAction, type AdminFormState } from "@/actions/admin.actions";
import { FileUpload } from "@/components/common/FileUpload";
import { SubmitButton } from "@/components/common/SubmitButton";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { admin as adminCopy } from "@/lib/copy";

type SchoolFormProps = {
  defaults: {
    name: string;
    description: string;
    city: string;
    state: string;
    logoUrl: string;
  };
};

const initialState: AdminFormState = {};

export function SchoolForm({ defaults }: SchoolFormProps) {
  const [state, formAction] = useActionState(updateSchoolAction, initialState);
  const [logoUrl, setLogoUrl] = useState<string | null>(defaults.logoUrl || null);

  return (
    <form action={formAction} className="space-y-5">
      <Field id="school-name" label="Nome" required>
        <Input id="school-name" name="name" defaultValue={defaults.name} maxLength={120} required />
      </Field>

      <Field id="school-description" label="Descrição">
        <Textarea
          id="school-description"
          name="description"
          rows={3}
          maxLength={500}
          defaultValue={defaults.description}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="school-city" label="Cidade">
          <Input id="school-city" name="city" defaultValue={defaults.city} maxLength={80} />
        </Field>

        <Field id="school-state" label="Estado">
          <Input id="school-state" name="state" defaultValue={defaults.state} maxLength={40} />
        </Field>
      </div>

      <FileUpload
        kind="image"
        label="Logo"
        hint="PNG, JPEG ou WebP até 5 MB."
        name="logoUrl"
        value={logoUrl}
        onChange={(value) => setLogoUrl(value)}
      />

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <SubmitButton pendingLabel="Salvando...">{adminCopy.saveSchool}</SubmitButton>
    </form>
  );
}
