import { z } from "zod";
import { GRADE_YEARS, INTERESTS } from "@/lib/constants";
import { mediaUrlSchema } from "@/lib/validation/project.schema";

export const onboardingSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo.").max(120),
  avatarUrl: mediaUrlSchema,
  course: z.string().trim().max(120).optional().or(z.literal("")),
  classroomId: z.string().trim().max(40).optional().or(z.literal("")),
  gradeYear: z.enum(GRADE_YEARS).optional().or(z.literal("")),
  bio: z.string().trim().max(280, "A bio pode ter até 280 caracteres.").optional().or(z.literal("")),
  interests: z.array(z.enum(INTERESTS)).max(INTERESTS.length),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
