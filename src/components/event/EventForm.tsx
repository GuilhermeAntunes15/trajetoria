"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEvent, updateEvent } from "@/actions/event.actions";
import { FileUpload } from "@/components/common/FileUpload";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { events as eventsCopy } from "@/lib/copy";
import { eventFormSchema, type EventFormInput } from "@/lib/validation/event.schema";

type EventFormProps = {
  mode: "create" | "edit";
  eventId?: string;
  returnTo?: string;
  defaults?: Partial<EventFormInput>;
};

const emptyDefaults: EventFormInput = {
  name: "",
  description: "",
  type: "SCIENCE_FAIR",
  startDate: "",
  endDate: "",
  location: "",
  coverImageUrl: "",
};

const EVENT_TYPES = Object.keys(EVENT_TYPE_LABELS) as (keyof typeof EVENT_TYPE_LABELS)[];

export function EventForm({ mode, eventId, returnTo, defaults }: EventFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormInput>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: { ...emptyDefaults, ...defaults },
  });

  const coverImageUrl = watch("coverImageUrl");

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createEvent(values, returnTo)
          : await updateEvent(eventId ?? "", values, returnTo);
      if (result?.error) setFormError(result.error);
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Field id="event-name" label="Nome do evento" required error={errors.name?.message}>
        <Input
          id="event-name"
          maxLength={120}
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
      </Field>

      <Field id="event-type" label="Tipo" required error={errors.type?.message}>
        <Select id="event-type" {...register("type")}>
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {EVENT_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="event-start" label="Data inicial" required error={errors.startDate?.message}>
          <Input
            id="event-start"
            type="date"
            aria-invalid={Boolean(errors.startDate)}
            {...register("startDate")}
          />
        </Field>

        <Field id="event-end" label="Data final" error={errors.endDate?.message}>
          <Input
            id="event-end"
            type="date"
            aria-invalid={Boolean(errors.endDate)}
            {...register("endDate")}
          />
        </Field>
      </div>

      <Field id="event-location" label="Local" error={errors.location?.message}>
        <Input id="event-location" maxLength={160} {...register("location")} />
      </Field>

      <Field id="event-description" label="Descrição" error={errors.description?.message}>
        <Textarea id="event-description" rows={4} maxLength={2000} {...register("description")} />
      </Field>

      <FileUpload
        kind="image"
        label="Imagem de capa"
        hint="PNG, JPEG ou WebP até 5 MB."
        value={coverImageUrl || null}
        onChange={(value) => setValue("coverImageUrl", value ?? "", { shouldDirty: true })}
      />
      <input type="hidden" {...register("coverImageUrl")} />

      {formError ? (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : eventsCopy.saveAction}
      </Button>
    </form>
  );
}
