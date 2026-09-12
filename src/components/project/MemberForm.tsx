"use client";

import { useActionState, useState, useTransition } from "react";
import { Search } from "lucide-react";
import {
  addMember,
  searchStudents,
  updateMemberContribution,
  type MemberFormState,
  type StudentOption,
} from "@/actions/member.actions";
import { SubmitButton } from "@/components/common/SubmitButton";
import { StudentAvatar } from "@/components/project/StudentAvatar";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { projectManage } from "@/lib/copy";
import { cn } from "@/lib/utils";

const initialState: MemberFormState = {};

export function MemberForm({ projectId }: { projectId: string }) {
  const [state, formAction] = useActionState(addMember, initialState);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StudentOption[] | null>(null);
  const [selected, setSelected] = useState<StudentOption | null>(null);
  const [searching, startSearch] = useTransition();

  function runSearch() {
    startSearch(async () => {
      const found = await searchStudents(query);
      setResults(found);
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="student-search">{projectManage.searchStudents}</Label>
        <div className="flex gap-2">
          <Input
            id="student-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                runSearch();
              }
            }}
            placeholder="Nome ou usuário"
            maxLength={80}
          />
          <Button variant="secondary" onClick={runSearch} disabled={searching || query.trim().length < 2}>
            <Search size={16} strokeWidth={1.75} />
            Buscar
          </Button>
        </div>
      </div>

      {results && results.length === 0 ? (
        <p className="text-sm text-muted">{projectManage.noStudents}</p>
      ) : null}

      {results && results.length > 0 ? (
        <ul className="space-y-1">
          {results.map((student) => (
            <li key={student.id}>
              <button
                type="button"
                onClick={() => setSelected(student)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[var(--radius-control)] border px-3 py-2 text-left transition-colors",
                  selected?.id === student.id
                    ? "border-brand bg-brand/10"
                    : "border-line bg-surface hover:bg-canvas",
                )}
              >
                <StudentAvatar name={student.name} avatarUrl={student.avatarUrl} size="sm" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{student.name}</span>
                  <span className="block text-xs text-muted">
                    {[student.course, student.classroom].filter(Boolean).join(" · ") ||
                      `@${student.username}`}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {selected ? (
        <form action={formAction} className="space-y-4 border-t border-line pt-4">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="userId" value={selected.id} />

          <p className="text-sm text-ink">
            Adicionando <span className="font-medium">{selected.name}</span>
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="member-role" label="Papel no projeto" required>
              <Input id="member-role" name="role" required maxLength={80} placeholder="Ex.: UX/UI" />
            </Field>
            <Field id="member-contribution" label="Contribuição">
              <Input id="member-contribution" name="contribution" maxLength={500} />
            </Field>
          </div>

          {state.error ? (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          ) : null}

          <SubmitButton size="sm" pendingLabel="Adicionando...">
            {projectManage.addMember}
          </SubmitButton>
        </form>
      ) : null}

      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
    </div>
  );
}

export function MemberContributionForm({
  memberId,
  role,
  contribution,
}: {
  memberId: string;
  role: string;
  contribution: string | null;
}) {
  const [state, formAction] = useActionState(updateMemberContribution, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="memberId" value={memberId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="own-role" label="Seu papel no projeto" required>
          <Input key={role} id="own-role" name="role" defaultValue={role} required maxLength={80} />
        </Field>
        <Field id="own-contribution" label="Sua contribuição">
          <Input
            key={contribution ?? ""}
            id="own-contribution"
            name="contribution"
            defaultValue={contribution ?? ""}
            maxLength={500}
          />
        </Field>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <SubmitButton size="sm" variant="secondary" pendingLabel="Salvando...">
        Salvar contribuição
      </SubmitButton>
    </form>
  );
}
