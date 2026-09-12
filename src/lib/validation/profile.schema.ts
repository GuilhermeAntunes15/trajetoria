import { z } from "zod";
import { GRADE_YEARS, INTERESTS } from "@/lib/constants";
import { mediaUrlSchema, optionalText } from "@/lib/validation/project.schema";

export const profileSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo.").max(120),
  avatarUrl: mediaUrlSchema,
  bio: z.string().trim().max(280, "A bio pode ter até 280 caracteres."),
  course: optionalText(120),
  classroomId: optionalText(40),
  gradeYear: z.union([z.enum(GRADE_YEARS), z.literal("")]),
  interests: z.array(z.enum(INTERESTS)).max(INTERESTS.length),
  subject: optionalText(120),
  title: optionalText(60),
});

export const privacySchema = z.object({
  profileVisibility: z.enum(["PRIVATE", "SCHOOL", "PUBLIC"]),
});

export type ProfileInput = z.infer<typeof profileSchema>;
