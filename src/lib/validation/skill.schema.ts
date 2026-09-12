import { z } from "zod";
import { idSchema } from "@/lib/validation/project.schema";

export const projectSkillAddSchema = z.object({
  projectId: idSchema.min(1),
  skillId: idSchema.min(1, "Selecione uma competência."),
});

export const projectSkillRemoveSchema = z.object({
  projectSkillId: idSchema.min(1),
});
