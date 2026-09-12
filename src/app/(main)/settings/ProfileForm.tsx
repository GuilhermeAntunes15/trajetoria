"use client";

import { useActionState, useState } from "react";
import type { Role } from "@prisma/client";
import { updateProfile, type ProfileState } from "@/actions/profile.actions";
import { FileUpload } from "@/components/common/FileUpload";
import { SubmitButton } from "@/components/common/SubmitButton";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { GRADE_YEARS, INTERESTS } from "@/lib/constants";

const initialState: ProfileState = {};

type ProfileFormProps = {
  role: Role;
  name: string;
  avatarUrl: string | null;
  bio: string;
  course: string;
  classroomId: string;
  gradeYear: string;
  interests: string[];
  subject: string;
  title: string;
  classrooms: { id: string; name: string; year: number }[];
};

export function ProfileForm({
  role,
  name,
  avatarUrl,
  bio,
  course,
  classroomId,
  gradeYear,
  interests,
  subject,
  title,
  classrooms,
}: ProfileFormProps) {
  const [state, formAction] = useActionState(updateProfile, initialState);
  const [photo, setPhoto] = useState<string | null>(avatarUrl);

  return (
    <form action={formAction} className="space-y-5">
      <Field id="name" label="Nome" required>
        <Input id="name" name="name" defaultValue={name} autoComplete="name" required maxLength={120} />
      </Field>

      <FileUpload
        kind="image"
        label="Foto"
        hint="PNG, JPEG ou WebP até 5 MB."
        name="avatarUrl"
        value={photo}
        onChange={(value) => setPhoto(value)}
      />

      <Field id="bio" label="Bio" hint="Até 280 caracteres.">
        <Textarea id="bio" name="bio" defaultValue={bio} maxLength={280} rows={3} />
      </Field>

      {role === "STUDENT" ? (
        <>
          <Field id="course" label="Curso" hint="Ex.: Desenvolvimento de Sistemas, Ensino Médio.">
            <Input id="course" name="course" defaultValue={course} maxLength={120} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="classroomId" label="Turma">
              <Select
                key={classroomId}
                id="classroomId"
                name="classroomId"
                defaultValue={classroomId}
              >
                <option value="">Sem turma</option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name} ({classroom.year})
                  </option>
                ))}
              </Select>
            </Field>

            <Field id="gradeYear" label="Ano / Série">
              <Select key={gradeYear} id="gradeYear" name="gradeYear" defaultValue={gradeYear}>
                <option value="">Selecione</option>
                {GRADE_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

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
                      key={String(interests.includes(interest))}
                      id={id}
                      type="checkbox"
                      name="interests"
                      value={interest}
                      defaultChecked={interests.includes(interest)}
                      className="size-3.5 accent-brand"
                    />
                    {interest}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </>
      ) : null}

      {role === "TEACHER" ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="subject" label="Disciplina">
            <Input id="subject" name="subject" defaultValue={subject} maxLength={120} />
          </Field>
          <Field id="title" label="Título" hint="Ex.: Prof., Profa., Me., Dr.">
            <Input id="title" name="title" defaultValue={title} maxLength={60} />
          </Field>
        </div>
      ) : null}

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <SubmitButton pendingLabel="Salvando...">Salvar perfil</SubmitButton>
    </form>
  );
}
