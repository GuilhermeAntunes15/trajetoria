"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { createProject, updateProject } from "@/actions/project.actions";
import { FileUpload } from "@/components/common/FileUpload";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { AREAS, VISIBILITY_LABELS } from "@/lib/constants";
import { project as projectCopy } from "@/lib/copy";
import {
  projectCreateSchema,
  projectEditFormSchema,
  type ProjectCreateInput,
} from "@/lib/validation/project.schema";

export type ProjectFormOption = { id: string; name: string };

type ProjectFormProps = {
  mode: "create" | "edit";
  slug?: string;
  events: ProjectFormOption[];
  teachers: ProjectFormOption[];
  defaults: Partial<ProjectCreateInput>;
};

const RENDERED_ERROR_FIELDS = new Set([
  "title",
  "summary",
  "area",
  "projectDate",
  "problem",
  "solution",
  "learnings",
  "description",
  "ownerRole",
  "ownerContribution",
  "coverImageUrl",
]);

const emptyDefaults: ProjectCreateInput = {
  title: "",
  summary: "",
  description: "",
  problem: "",
  solution: "",
  learnings: "",
  area: "",
  projectDate: "",
  eventId: "",
  advisorId: "",
  parentProjectId: "",
  coverImageUrl: "",
  visibilityScope: "SCHOOL",
  makePublic: false,
  allowFork: true,
  ownerRole: "",
  ownerContribution: "",
};

export function ProjectForm({ mode, slug, events, teachers, defaults }: ProjectFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const schema: z.ZodType<ProjectCreateInput, z.ZodTypeDef, ProjectCreateInput> =
    mode === "create" ? projectCreateSchema : projectEditFormSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectCreateInput>({
    resolver: zodResolver(schema),
    defaultValues: { ...emptyDefaults, ...defaults },
  });

  const coverImageUrl = watch("coverImageUrl");

  const unhandledErrors = Object.entries(errors)
    .filter(([name]) => !RENDERED_ERROR_FIELDS.has(name))
    .map(([, error]) => (error as { message?: string } | undefined)?.message)
    .filter((message): message is string => Boolean(message));

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result =
        mode === "create" ? await createProject(values) : await updateProject(slug ?? "", values);
      if (result?.error) setFormError(result.error);
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Field id="title" label="Título" required error={errors.title?.message}>
        <Input id="title" maxLength={120} aria-invalid={Boolean(errors.title)} {...register("title")} />
      </Field>

      <Field
        id="summary"
        label="Resumo curto"
        hint="Até 280 caracteres."
        required
        error={errors.summary?.message}
      >
        <Textarea
          id="summary"
          rows={2}
          maxLength={280}
          aria-invalid={Boolean(errors.summary)}
          {...register("summary")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="area" label="Área" error={errors.area?.message}>
          <Select id="area" {...register("area")}>
            <option value="">Selecione</option>
            {AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="projectDate" label="Data do projeto" required error={errors.projectDate?.message}>
          <Input
            id="projectDate"
            type="date"
            aria-invalid={Boolean(errors.projectDate)}
            {...register("projectDate")}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="eventId" label="Evento" hint="Feira, hackathon, mostra ou projeto integrador.">
          <Select id="eventId" {...register("eventId")}>
            <option value="">Sem evento</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="advisorId" label="Professor orientador">
          <Select id="advisorId" {...register("advisorId")}>
            <option value="">Sem orientação definida</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <FileUpload
        kind="image"
        label="Imagem de capa"
        hint="PNG, JPEG ou WebP até 5 MB."
        value={coverImageUrl || null}
        onChange={(value) => setValue("coverImageUrl", value ?? "", { shouldDirty: true })}
      />
      <input type="hidden" {...register("coverImageUrl")} />
      <input type="hidden" {...register("parentProjectId")} />
      {errors.coverImageUrl?.message ? (
        <p role="alert" className="text-sm text-danger">
          {errors.coverImageUrl.message}
        </p>
      ) : null}

      <Field
        id="problem"
        label="O problema"
        hint="Qual problema o projeto tentou resolver?"
        error={errors.problem?.message}
      >
        <Textarea id="problem" rows={4} maxLength={4000} {...register("problem")} />
      </Field>

      <Field
        id="solution"
        label="Nossa solução"
        hint="O que vocês construíram e como funciona."
        error={errors.solution?.message}
      >
        <Textarea id="solution" rows={4} maxLength={4000} {...register("solution")} />
      </Field>

      <Field id="learnings" label="O que aprendemos" error={errors.learnings?.message}>
        <Textarea id="learnings" rows={3} maxLength={4000} {...register("learnings")} />
      </Field>

      <Field id="description" label="Descrição complementar" error={errors.description?.message}>
        <Textarea id="description" rows={3} maxLength={4000} {...register("description")} />
      </Field>

      {mode === "create" ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="ownerRole"
            label="Seu papel no projeto"
            hint="Ex.: Backend, UX/UI, Dados."
            required
            error={errors.ownerRole?.message}
          >
            <Input
              id="ownerRole"
              maxLength={80}
              aria-invalid={Boolean(errors.ownerRole)}
              {...register("ownerRole")}
            />
          </Field>

          <Field id="ownerContribution" label="Sua contribuição" error={errors.ownerContribution?.message}>
            <Input id="ownerContribution" maxLength={500} {...register("ownerContribution")} />
          </Field>
        </div>
      ) : null}

      <div className="space-y-4 rounded-[var(--radius-card)] border border-line bg-canvas p-4">
        <Field id="visibilityScope" label="Quem pode ver este projeto">
          <Select id="visibilityScope" {...register("visibilityScope")}>
            <option value="PRIVATE">{VISIBILITY_LABELS.PRIVATE} — só a equipe</option>
            <option value="SCHOOL">{VISIBILITY_LABELS.SCHOOL} — estudantes e professores</option>
          </Select>
        </Field>

        <Checkbox
          id="makePublic"
          label={projectCopy.publishLabel}
          hint={projectCopy.publishNote}
          {...register("makePublic")}
        />

        <Checkbox id="allowFork" label={projectCopy.allowForkLabel} {...register("allowFork")} />
      </div>

      {unhandledErrors.length > 0 ? (
        <p role="alert" className="text-sm text-danger">
          {unhandledErrors.join(" ")}
        </p>
      ) : null}

      {formError ? (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar projeto"}
      </Button>
    </form>
  );
}
