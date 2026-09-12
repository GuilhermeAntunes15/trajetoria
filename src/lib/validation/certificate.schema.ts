import { z } from "zod";
import { idSchema, optionalText } from "@/lib/validation/project.schema";

export const issueCertificateSchema = z.object({
  studentId: idSchema.min(1, "Selecione um estudante."),
  title: z.string().trim().min(3, "Escreva o título do certificado.").max(160),
  eventId: idSchema,
  projectId: idSchema,
  hours: z.union([
    z.literal(""),
    z.string().trim().regex(/^\d{1,4}$/, "Informe a carga horária em horas."),
  ]),
});

export const revokeCertificateSchema = z.object({
  certificateId: idSchema.min(1),
});

export const certificateCodeSchema = z
  .string()
  .trim()
  .min(4)
  .max(40)
  .regex(/^[A-Za-z0-9-]+$/, "Código inválido.");

export type IssueCertificateInput = z.infer<typeof issueCertificateSchema>;

export const certificateTitleSchema = optionalText(160);
