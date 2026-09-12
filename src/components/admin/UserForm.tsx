"use client";

import { useActionState, useState } from "react";
import type { Role } from "@prisma/client";
import { createUserAction, updateUserAction, type AdminFormState } from "@/actions/admin.actions";
import { SubmitButton } from "@/components/common/SubmitButton";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ROLE_LABELS } from "@/lib/constants";
import { admin as adminCopy } from "@/lib/copy";

export type ClassroomOption = { id: string; name: string; year: number };

type UserFormProps = {
  mode: "create" | "edit";
  classrooms: ClassroomOption[];
  defaults?: {
    userId: string;
    name: string;
    email: string;
    role: Role;
    classroomId: string;
  };
};

const ROLES: Role[] = ["STUDENT", "TEACHER", "ADMIN"];

const initialState: AdminFormState = {};

export function UserForm({ mode, classrooms, defaults }: UserFormProps) {
  const [state, formAction] = useActionState(
    mode === "create" ? createUserAction : updateUserAction,
    initialState,
  );
  const [role, setRole] = useState<Role>(defaults?.role ?? "STUDENT");

  return (
    <form action={formAction} className="space-y-5">
      {mode === "edit" && defaults ? (
        <input type="hidden" name="userId" value={defaults.userId} />
      ) : null}

      <Field id="user-name" label="Nome completo" required>
        <Input
          id="user-name"
          name="name"
          defaultValue={defaults?.name}
          maxLength={120}
          required
          autoComplete="off"
        />
      </Field>

      {mode === "create" ? (
        <Field id="user-email" label="E-mail" required>
          <Input
            id="user-email"
            name="email"
            type="email"
            maxLength={160}
            required
            autoComplete="off"
          />
        </Field>
      ) : (
        <Field id="user-email" label="E-mail">
          <Input id="user-email" defaultValue={defaults?.email} disabled />
        </Field>
      )}

      <Field id="user-role" label="Papel" required>
        <Select
          id="user-role"
          name="role"
          value={role}
          onChange={(event) => setRole(event.target.value as Role)}
        >
          {ROLES.map((option) => (
            <option key={option} value={option}>
              {ROLE_LABELS[option]}
            </option>
          ))}
        </Select>
      </Field>

      {role === "STUDENT" ? (
        <Field id="user-classroom" label="Turma">
          <Select id="user-classroom" name="classroomId" defaultValue={defaults?.classroomId ?? ""}>
            <option value="">Sem turma</option>
            {classrooms.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name} — {classroom.year}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      {mode === "create" ? (
        <Field
          id="user-password"
          label="Senha inicial"
          hint="Deixe em branco para gerar automaticamente. Mínimo de 8 caracteres."
        >
          <Input id="user-password" name="password" maxLength={72} autoComplete="new-password" />
        </Field>
      ) : null}

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      {state.success && !state.password ? (
        <p className="text-sm text-success">{state.success}</p>
      ) : null}

      {state.password ? (
        <div className="rounded-[var(--radius-card)] border border-success/30 bg-success/5 px-4 py-3">
          <p className="text-sm font-medium text-ink">{adminCopy.passwordOnce}</p>
          <p className="mt-1 font-mono text-base text-ink">{state.password}</p>
        </div>
      ) : null}

      <SubmitButton pendingLabel="Salvando...">
        {mode === "create" ? adminCopy.newUser : "Salvar usuário"}
      </SubmitButton>
    </form>
  );
}
