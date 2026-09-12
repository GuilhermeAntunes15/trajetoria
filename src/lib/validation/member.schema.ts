import { z } from "zod";
import { idSchema, optionalText } from "@/lib/validation/project.schema";

export const memberAddSchema = z.object({
  projectId: idSchema,
  userId: idSchema.min(1, "Selecione um estudante."),
  role: z.string().trim().min(2, "Descreva o papel no projeto.").max(80),
  contribution: optionalText(500),
});

export const memberContributionSchema = z.object({
  memberId: idSchema.min(1),
  role: z.string().trim().min(2, "Descreva o papel no projeto.").max(80),
  contribution: optionalText(500),
});

export const memberRemoveSchema = z.object({
  memberId: idSchema.min(1),
});

export const studentSearchSchema = z
  .string()
  .trim()
  .min(2, "Digite pelo menos 2 letras.")
  .max(80);
