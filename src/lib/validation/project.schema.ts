import { z } from "zod";
import { AREAS } from "@/lib/constants";

export const optionalText = (max: number) => z.string().trim().max(max);

export const idSchema = z.string().trim().max(40);

export const mediaUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => value === "" || value.startsWith("/api/files/") || /^https?:\/\//i.test(value),
    "Endereço de arquivo inválido.",
  );

export const externalUrlSchema = z
  .string()
  .trim()
  .max(500)
  .url("Informe um endereço válido.")
  .refine((value) => /^https?:\/\//i.test(value), "O endereço precisa começar com http ou https.");

export const projectBaseSchema = z.object({
  title: z.string().trim().min(3, "O título precisa ter pelo menos 3 caracteres.").max(120),
  summary: z
    .string()
    .trim()
    .min(10, "Escreva um resumo com pelo menos 10 caracteres.")
    .max(280, "O resumo pode ter até 280 caracteres."),
  description: optionalText(4000),
  problem: optionalText(4000),
  solution: optionalText(4000),
  learnings: optionalText(4000),
  area: z.union([z.enum(AREAS), z.literal("")]),
  projectDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida."),
  eventId: idSchema,
  advisorId: idSchema,
  parentProjectId: idSchema,
  coverImageUrl: mediaUrlSchema,
  visibilityScope: z.enum(["PRIVATE", "SCHOOL"]),
  makePublic: z.boolean(),
  allowFork: z.boolean(),
});

export const projectCreateSchema = projectBaseSchema.extend({
  ownerRole: z.string().trim().min(2, "Descreva seu papel no projeto.").max(80),
  ownerContribution: optionalText(500),
});

export const projectUpdateSchema = projectBaseSchema;

export const projectEditFormSchema = projectBaseSchema.extend({
  ownerRole: optionalText(80),
  ownerContribution: optionalText(500),
});

export const projectVisibilitySchema = z.object({
  visibility: z.enum(["PRIVATE", "SCHOOL", "PUBLIC"]),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
