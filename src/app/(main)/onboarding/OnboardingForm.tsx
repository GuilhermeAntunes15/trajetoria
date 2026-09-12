"use client";

import { useActionState, useState } from "react";
import { completeOnboarding, type OnboardingState } from "@/actions/onboarding.actions";
import { FileUpload } from "@/components/common/FileUpload";
import { SubmitButton } from "@/components/common/SubmitButton";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { GRADE_YEARS, INTERESTS } from "@/lib/constants";
import { onboarding } from "@/lib/copy";

const initialState: OnboardingState = {};

type OnboardingFormProps = {
  defaultName: string;
  defaultAvatarUrl: string | null;
  defaultBio: string;
  defaultCourse: string;
  defaultGradeYear: string;
  defaultClassroomId: string;
  defaultInterests: string[];
  classrooms: { id: string; name: string; year: number }[];
};

export function OnboardingForm({
  defaultName,
  defaultAvatarUrl,
  defaultBio,
  defaultCourse,
  defaultGradeYear,
  defaultClassroomId,
  defaultInterests,
  classrooms,
}: OnboardingFormProps) {
  const [state, formAction] = useActionState(completeOnboarding, initialState);
  const [photo, setPhoto] = useState<string | null>(defaultAvatarUrl);

  return (
    <form action={formAction} className="space-y-5">
      <Field id="name" label="Nome" required>
        <Input id="name" name="name" defaultValue={defaultName} autoComplete="name" required />
      </Field>

      <FileUpload
        kind="image"
        label="Foto"
        hint="Opcional. PNG, JPEG ou WebP até 5 MB."
        name="avatarUrl"
        value={photo}
        onChange={(value) => setPhoto(value)}
      />

      <Field id="course" label="Curso" hint="Ex.: Desenvolvimento de Sistemas, Ensino Médio.">
        <Input id="course" name="course" defaultValue={defaultCourse} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="classroomId" label="Turma">
          <Select id="classroomId" name="classroomId" defaultValue={defaultClassroomId}>
            <option value="">Sem turma por enquanto</option>
            {classrooms.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name} ({classroom.year})
              </option>
            ))}
          </Select>
        </Field>

        <Field id="gradeYear" label="Ano / Série">
          <Select id="gradeYear" name="gradeYear" defaultValue={defaultGradeYear}>
            <option value="">Selecione</option>
            {GRADE_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field id="bio" label="Bio" hint="Até 280 caracteres.">
        <Textarea id="bio" name="bio" defaultValue={defaultBio} maxLength={280} rows={3} />
      </Field>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">Interesses</legend>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((interest) => {
            const id = `interest-${interest}`;
            return (
              <label
                key={interest}
                htmlFor={id}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink transition-colors hover:border-brand/40 has-[:checked]:border-brand has-[:checked]:bg-brand/10 has-[:checked]:text-brand"
              >
                <input
                  id={id}
                  type="checkbox"
                  name="interests"
                  value={interest}
                  defaultChecked={defaultInterests.includes(interest)}
                  className="size-3.5 accent-brand"
                />
                {interest}
              </label>
            );
          })}
        </div>
      </fieldset>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <SubmitButton pendingLabel="Salvando...">{onboarding.submit}</SubmitButton>
    </form>
  );
}
