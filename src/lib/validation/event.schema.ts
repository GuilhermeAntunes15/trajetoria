import { z } from "zod";
import { idSchema, mediaUrlSchema, optionalText } from "@/lib/validation/project.schema";

const dateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida.");

export const eventFormSchema = z
  .object({
    name: z.string().trim().min(3, "O nome precisa ter pelo menos 3 caracteres.").max(120),
    description: optionalText(2000),
    type: z.enum([
      "SCIENCE_FAIR",
      "HACKATHON",
      "CULTURAL_SHOW",
      "INTEGRATED_PROJECT",
      "COMPETITION",
      "OLYMPIAD",
      "OTHER",
    ]),
    startDate: dateSchema,
    endDate: z.union([dateSchema, z.literal("")]),
    location: optionalText(160),
    coverImageUrl: mediaUrlSchema,
  })
  .refine((value) => value.endDate === "" || value.endDate >= value.startDate, {
    message: "A data final não pode ser anterior à data inicial.",
    path: ["endDate"],
  });

export const eventIdSchema = z.object({ eventId: idSchema.min(1) });

export type EventFormInput = z.infer<typeof eventFormSchema>;
