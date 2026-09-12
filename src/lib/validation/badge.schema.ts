import { z } from "zod";
import { BADGE_ICON_KEYS } from "@/lib/constants";
import { idSchema, optionalText } from "@/lib/validation/project.schema";

export const grantBadgeSchema = z.object({
  userId: idSchema.min(1, "Selecione um estudante."),
  badgeId: idSchema.min(1, "Selecione uma badge."),
  projectId: idSchema,
  eventId: idSchema,
  note: optionalText(280),
});

export const revokeBadgeSchema = z.object({
  userBadgeId: idSchema.min(1),
});

export const badgeFormSchema = z.object({
  name: z.string().trim().min(2, "O nome precisa ter pelo menos 2 caracteres.").max(60),
  description: optionalText(280),
  icon: z.enum(BADGE_ICON_KEYS),
  type: z.enum(["HIGHLIGHT", "EVENT", "ACADEMIC", "SPECIAL"]),
});

export const badgeIdSchema = z.object({
  badgeId: idSchema.min(1),
});

export type GrantBadgeInput = z.infer<typeof grantBadgeSchema>;
export type BadgeFormInput = z.infer<typeof badgeFormSchema>;
