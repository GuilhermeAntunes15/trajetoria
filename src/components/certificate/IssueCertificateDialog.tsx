"use client";

import { useActionState, useState } from "react";
import { ScrollText } from "lucide-react";
import {
  issueCertificateAction,
  type CertificateFormState,
} from "@/actions/certificate.actions";
import { SubmitButton } from "@/components/common/SubmitButton";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { certificates as certificatesCopy } from "@/lib/copy";

export type CertificateOption = { id: string; name: string };

type IssueCertificateDialogProps = {
  students: CertificateOption[];
  events?: CertificateOption[];
  eventId?: string;
  projectId?: string;
  defaultTitle?: string;
};

const initialState: CertificateFormState = {};

export function IssueCertificateDialog({
  students,
  events,
  eventId,
  projectId,
  defaultTitle,
}: IssueCertificateDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(issueCertificateAction, initialState);
  const singleStudent = students.length === 1 ? students[0] : null;

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <ScrollText size={16} strokeWidth={1.75} />
        {certificatesCopy.issueAction}
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={certificatesCopy.issueTitle}
        description={certificatesCopy.issueDescription}
      >
        {students.length === 0 ? (
          <p className="text-sm text-muted">Nenhum estudante disponível aqui.</p>
        ) : (
          <form action={formAction} className="space-y-4">
            {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}
            {eventId ? <input type="hidden" name="eventId" value={eventId} /> : null}

            {singleStudent ? (
              <>
                <input type="hidden" name="studentId" value={singleStudent.id} />
                <p className="text-sm text-ink">
                  {certificatesCopy.studentLabel}:{" "}
                  <span className="font-medium">{singleStudent.name}</span>
                </p>
              </>
            ) : (
              <Field id="certificate-student" label={certificatesCopy.studentLabel} required>
                <Select id="certificate-student" name="studentId" defaultValue="" required>
                  <option value="">Selecione</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </Select>
              </Field>
            )}

            <Field id="certificate-title" label={certificatesCopy.titleLabel} required>
              <Input
                id="certificate-title"
                name="title"
                defaultValue={defaultTitle}
                maxLength={160}
                required
              />
            </Field>

            {!eventId && events ? (
              <Field id="certificate-event" label={certificatesCopy.eventLabel}>
                <Select id="certificate-event" name="eventId" defaultValue="">
                  <option value="">{certificatesCopy.noEvent}</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : null}

            <Field id="certificate-hours" label={certificatesCopy.hoursLabel}>
              <Input
                id="certificate-hours"
                name="hours"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
              />
            </Field>

            {state.error ? (
              <p role="alert" className="text-sm text-danger">
                {state.error}
              </p>
            ) : null}

            {state.success && state.code ? (
              <p className="text-sm text-success">
                {state.success}{" "}
                <a
                  href={`/certificate/${state.code}`}
                  className="font-medium text-brand hover:text-brand-hover"
                >
                  {state.code}
                </a>
              </p>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                Fechar
              </Button>
              <SubmitButton size="sm" pendingLabel="Emitindo...">
                {certificatesCopy.issueAction}
              </SubmitButton>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
