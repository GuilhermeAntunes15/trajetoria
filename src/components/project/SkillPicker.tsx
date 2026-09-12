"use client";

import { useActionState } from "react";
import type { SkillCategory } from "@prisma/client";
import { addProjectSkill, type SkillFormState } from "@/actions/skill.actions";
import { SubmitButton } from "@/components/common/SubmitButton";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { SKILL_CATEGORY_LABELS } from "@/lib/constants";
import { projectManage } from "@/lib/copy";

export type SkillOption = { id: string; name: string; category: SkillCategory };

const initialState: SkillFormState = {};

const CATEGORY_ORDER: SkillCategory[] = ["TECHNICAL", "SOFT_SKILL", "ACADEMIC"];

export function SkillPicker({
  projectId,
  skills,
  selectedIds,
}: {
  projectId: string;
  skills: SkillOption[];
  selectedIds: string[];
}) {
  const [state, formAction] = useActionState(addProjectSkill, initialState);
  const available = skills.filter((skill) => !selectedIds.includes(skill.id));

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />

      <Field id="skillId" label="Competência demonstrada no projeto">
        <Select id="skillId" name="skillId" defaultValue="" disabled={available.length === 0}>
          <option value="">Selecione</option>
          {CATEGORY_ORDER.map((category) => {
            const options = available.filter((skill) => skill.category === category);
            if (options.length === 0) return null;
            return (
              <optgroup key={category} label={SKILL_CATEGORY_LABELS[category]}>
                {options.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </Select>
      </Field>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <SubmitButton size="sm" pendingLabel="Salvando...">
        {projectManage.addSkill}
      </SubmitButton>
    </form>
  );
}
