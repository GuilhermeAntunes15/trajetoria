"use client";

import { useActionState } from "react";
import type { BadgeType } from "@prisma/client";
import { saveBadgeAction, type AdminFormState } from "@/actions/admin.actions";
import { SubmitButton } from "@/components/common/SubmitButton";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  BADGE_ICON_KEYS,
  BADGE_ICON_LABELS,
  BADGE_TYPE_LABELS,
  type BadgeIconKey,
} from "@/lib/constants";
import { admin as adminCopy } from "@/lib/copy";

const TYPES: BadgeType[] = ["HIGHLIGHT", "EVENT", "ACADEMIC", "SPECIAL"];

const initialState: AdminFormState = {};

export function BadgeForm({
  defaults,
}: {
  defaults?: {
    badgeId: string;
    name: string;
    description: string;
    icon: BadgeIconKey;
    type: BadgeType;
  };
}) {
  const [state, formAction] = useActionState(saveBadgeAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="badgeId" value={defaults?.badgeId ?? ""} />

      <Field id="badge-name" label="Nome" required>
        <Input id="badge-name" name="name" defaultValue={defaults?.name} maxLength={60} required />
      </Field>

      <Field id="badge-description" label="Descrição">
        <Input
          id="badge-description"
          name="description"
          defaultValue={defaults?.description}
          maxLength={280}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="badge-icon" label={adminCopy.badgeIconLabel} required>
          <Select id="badge-icon" name="icon" defaultValue={defaults?.icon ?? "award"}>
            {BADGE_ICON_KEYS.map((key) => (
              <option key={key} value={key}>
                {BADGE_ICON_LABELS[key]}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="badge-type" label={adminCopy.badgeTypeLabel} required>
          <Select id="badge-type" name="type" defaultValue={defaults?.type ?? "SPECIAL"}>
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {BADGE_TYPE_LABELS[type]}
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
        {defaults ? "Salvar badge" : adminCopy.newBadge}
      </SubmitButton>
    </form>
  );
}
