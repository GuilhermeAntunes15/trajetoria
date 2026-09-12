"use client";

import { useActionState, useState } from "react";
import { Medal } from "lucide-react";
import { grantBadgeAction, type BadgeFormState } from "@/actions/badge.actions";
import { SubmitButton } from "@/components/common/SubmitButton";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { badges as badgesCopy } from "@/lib/copy";

export type GrantBadgeOption = { id: string; name: string };

type GrantBadgeDialogProps = {
  badges: GrantBadgeOption[];
  students: GrantBadgeOption[];
  projectId?: string;
  eventId?: string;
};

const initialState: BadgeFormState = {};

export function GrantBadgeDialog({ badges, students, projectId, eventId }: GrantBadgeDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(grantBadgeAction, initialState);
  const singleStudent = students.length === 1 ? students[0] : null;

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Medal size={16} strokeWidth={1.75} />
        {badgesCopy.grantAction}
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={badgesCopy.grantTitle}
        description={badgesCopy.grantDescription}
      >
        {badges.length === 0 ? (
          <p className="text-sm text-muted">{badgesCopy.emptyCatalog}</p>
        ) : (
          <form action={formAction} className="space-y-4">
            {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}
            {eventId ? <input type="hidden" name="eventId" value={eventId} /> : null}

            {singleStudent ? (
              <>
                <input type="hidden" name="userId" value={singleStudent.id} />
                <p className="text-sm text-ink">
                  {badgesCopy.studentLabel}:{" "}
                  <span className="font-medium">{singleStudent.name}</span>
                </p>
              </>
            ) : (
              <Field id="grant-user" label={badgesCopy.studentLabel} required>
                <Select id="grant-user" name="userId" defaultValue="" required>
                  <option value="">Selecione</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </Select>
              </Field>
            )}

            <Field id="grant-badge" label={badgesCopy.badgeLabel} required>
              <Select id="grant-badge" name="badgeId" defaultValue="" required>
                <option value="">Selecione</option>
                {badges.map((badge) => (
                  <option key={badge.id} value={badge.id}>
                    {badge.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field id="grant-note" label={badgesCopy.noteLabel} hint={badgesCopy.noteHint}>
              <Input id="grant-note" name="note" maxLength={280} />
            </Field>

            {state.error ? (
              <p role="alert" className="text-sm text-danger">
                {state.error}
              </p>
            ) : null}
            {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                Fechar
              </Button>
              <SubmitButton size="sm" pendingLabel="Concedendo...">
                {badgesCopy.grantAction}
              </SubmitButton>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
