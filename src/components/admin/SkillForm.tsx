"use client";

import { useActionState } from "react";
import type { SkillCategory } from "@prisma/client";
import {
  restoreDefaultSkillsAction,
  saveSkillAction,
  type AdminFormState,
} from "@/actions/admin.actions";
import { SubmitButton } from "@/components/common/SubmitButton";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SKILL_CATEGORY_LABELS } from "@/lib/constants";
import { admin as adminCopy } from "@/lib/copy";

const CATEGORIES: SkillCategory[] = ["TECHNICAL", "SOFT_SKILL", "ACADEMIC"];

const initialState: AdminFormState = {};

export function SkillForm({
  defaults,
}: {
  defaults?: { skillId: string; name: string; category: SkillCategory };
}) {
  const [state, formAction] = useActionState(saveSkillAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="skillId" value={defaults?.skillId ?? ""} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="skill-name" label="Nome" required>
          <Input id="skill-name" name="name" defaultValue={defaults?.name} maxLength={60} required />
        </Field>

        <Field id="skill-category" label="Categoria" required>
          <Select
            key={defaults?.category ?? "TECHNICAL"}
            id="skill-category"
            name="category"
            defaultValue={defaults?.category ?? "TECHNICAL"}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {SKILL_CATEGORY_LABELS[category]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <SubmitButton size="sm" pendingLabel="Salvando...">
        {defaults ? "Salvar competência" : adminCopy.newSkill}
      </SubmitButton>
    </form>
  );
}

export function RestoreSkillsForm() {
  const [state, formAction] = useActionState(restoreDefaultSkillsAction, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <p className="text-xs text-muted">{adminCopy.restoreSkillsHint}</p>
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <SubmitButton size="sm" variant="secondary" pendingLabel="Restaurando...">
        {adminCopy.restoreSkills}
      </SubmitButton>
    </form>
  );
}
