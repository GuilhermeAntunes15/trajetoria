import { z } from "zod";
import { idSchema, optionalText } from "@/lib/validation/project.schema";

const feedbackFields = {
  strengths: optionalText(2000),
  improvements: optionalText(2000),
  generalComment: optionalText(2000),
};

export const approveProjectSchema = z.object({
  projectId: idSchema.min(1),
  ...feedbackFields,
  validatedSkillIds: z.array(idSchema.min(1)).max(50).default([]),
});

export const requestChangesSchema = z.object({
  projectId: idSchema.min(1),
  comment: z
    .string()
    .trim()
    .min(10, "Escreva pelo menos 10 caracteres explicando o que ajustar.")
    .max(2000),
  strengths: optionalText(2000),
  improvements: optionalText(2000),
});

export const addFeedbackSchema = z
  .object({ projectId: idSchema.min(1), ...feedbackFields })
  .refine(
    (value) =>
      value.strengths.length > 0 || value.improvements.length > 0 || value.generalComment.length > 0,
    { message: "Escreva pelo menos um dos campos de feedback.", path: ["generalComment"] },
  );

export const projectSkillValidationSchema = z.object({
  projectSkillId: idSchema.min(1),
  validate: z.enum(["true", "false"]),
});

export const projectIdSchema = z.object({ projectId: idSchema.min(1) });

export const eventProjectIdSchema = z.object({ eventProjectId: idSchema.min(1) });

export type ApproveProjectInput = z.infer<typeof approveProjectSchema>;
export type RequestChangesInput = z.infer<typeof requestChangesSchema>;
export type AddFeedbackInput = z.infer<typeof addFeedbackSchema>;
