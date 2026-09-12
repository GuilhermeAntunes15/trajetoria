import { z } from "zod";
import type { EvidenceType } from "@prisma/client";
import { EVIDENCE_TYPES, FILE_EVIDENCE_TYPES } from "@/lib/constants";
import {
  externalUrlSchema,
  idSchema,
  mediaUrlSchema,
  optionalText,
} from "@/lib/validation/project.schema";

export function isFileEvidence(type: EvidenceType): boolean {
  return (FILE_EVIDENCE_TYPES as readonly EvidenceType[]).includes(type);
}

const evidenceFields = {
  type: z.enum(EVIDENCE_TYPES),
  title: z.string().trim().min(2, "Dê um nome à evidência.").max(120),
  description: optionalText(500),
  url: z.union([externalUrlSchema, z.literal("")]),
  fileUrl: mediaUrlSchema,
  fileName: optionalText(160),
  fileSize: z.number().int().nonnegative().max(20 * 1024 * 1024).nullable(),
  mimeType: optionalText(100),
};

function withSource<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.superRefine((value, ctx) => {
    const data = value as unknown as { type: EvidenceType; url: string; fileUrl: string };
    if (isFileEvidence(data.type)) {
      if (!data.fileUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fileUrl"],
          message: "Envie o arquivo da evidência.",
        });
      }
      return;
    }
    if (!data.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["url"],
        message: "Informe o endereço da evidência.",
      });
    }
  });
}

export const evidenceCreateSchema = withSource(
  z.object({ projectId: idSchema.min(1), ...evidenceFields }),
);

export const evidenceUpdateSchema = withSource(
  z.object({ evidenceId: idSchema.min(1), ...evidenceFields }),
);

export const evidenceRemoveSchema = z.object({ evidenceId: idSchema.min(1) });

export const evidenceReorderSchema = z.object({
  evidenceId: idSchema.min(1),
  direction: z.enum(["up", "down"]),
});
