"use client";

import { useActionState, useState } from "react";
import type { EvidenceType } from "@prisma/client";
import { addEvidence, type EvidenceFormState } from "@/actions/evidence.actions";
import { FileUpload, type UploadedFile } from "@/components/common/FileUpload";
import { SubmitButton } from "@/components/common/SubmitButton";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { EVIDENCE_TYPES, EVIDENCE_TYPE_LABELS } from "@/lib/constants";
import { projectManage } from "@/lib/copy";
import { isFileEvidence } from "@/lib/validation/evidence.schema";

const initialState: EvidenceFormState = {};

export function EvidenceForm({ projectId }: { projectId: string }) {
  const [state, formAction] = useActionState(addEvidence, initialState);
  const [type, setType] = useState<EvidenceType>("LINK");
  const [file, setFile] = useState<UploadedFile | null>(null);

  const usesFile = isFileEvidence(type);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="evidence-type" label="Tipo" required>
          <Select
            id="evidence-type"
            name="type"
            value={type}
            onChange={(event) => {
              setType(event.target.value as EvidenceType);
              setFile(null);
            }}
          >
            {EVIDENCE_TYPES.map((value) => (
              <option key={value} value={value}>
                {EVIDENCE_TYPE_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="evidence-title" label="Título" required>
          <Input
            id="evidence-title"
            name="title"
            required
            maxLength={120}
            placeholder="Ex.: Repositório no GitHub"
          />
        </Field>
      </div>

      {usesFile ? (
        <>
          <FileUpload
            kind={type === "IMAGE" ? "image" : "document"}
            label="Arquivo"
            hint={projectManage.evidenceFileHint}
            name="fileUrl"
            value={file?.url ?? null}
            onChange={(value, meta) => setFile(value && meta ? meta : null)}
          />
          <input type="hidden" name="fileName" value={file?.fileName ?? ""} />
          <input type="hidden" name="fileSize" value={file?.fileSize ?? ""} />
          <input type="hidden" name="mimeType" value={file?.mimeType ?? ""} />
        </>
      ) : (
        <Field id="evidence-url" label="Endereço" hint="Começando com http ou https." required>
          <Input
            id="evidence-url"
            name="url"
            type="url"
            required
            maxLength={500}
            placeholder="https://"
          />
        </Field>
      )}

      <Field id="evidence-description" label="Descrição">
        <Textarea id="evidence-description" name="description" rows={2} maxLength={500} />
      </Field>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <SubmitButton size="sm" pendingLabel="Adicionando...">
        {projectManage.addEvidence}
      </SubmitButton>
    </form>
  );
}
