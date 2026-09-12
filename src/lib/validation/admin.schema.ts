import { z } from "zod";
import { idSchema, mediaUrlSchema, optionalText } from "@/lib/validation/project.schema";

const roleSchema = z.enum(["STUDENT", "TEACHER", "ADMIN"]);

const passwordSchema = z.union([
  z.literal(""),
  z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(72),
]);

export const userCreateSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome completo.").max(120),
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido.").max(160),
  role: roleSchema,
  classroomId: idSchema,
  password: passwordSchema,
});

export const userUpdateSchema = z.object({
  userId: idSchema.min(1),
  name: z.string().trim().min(3, "Informe o nome completo.").max(120),
  role: roleSchema,
  classroomId: idSchema,
});

export const userStatusSchema = z.object({
  userId: idSchema.min(1),
  active: z.enum(["true", "false"]),
});

export const userIdSchema = z.object({ userId: idSchema.min(1) });

export const classroomFormSchema = z.object({
  classroomId: idSchema,
  name: z.string().trim().min(2, "Informe o nome da turma.").max(80),
  year: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Informe o ano com quatro dígitos."),
});

export const classroomIdSchema = z.object({ classroomId: idSchema.min(1) });

export const classroomMembersSchema = z.object({
  classroomId: idSchema.min(1),
  studentIds: z.array(idSchema).max(300),
  teacherIds: z.array(idSchema).max(100),
});

export const schoolFormSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome da escola.").max(120),
  description: optionalText(500),
  city: optionalText(80),
  state: optionalText(40),
  logoUrl: mediaUrlSchema,
});

export const skillFormSchema = z.object({
  skillId: idSchema,
  name: z.string().trim().min(2, "Informe o nome da competência.").max(60),
  category: z.enum(["TECHNICAL", "SOFT_SKILL", "ACADEMIC"]),
});

export const skillIdSchema = z.object({ skillId: idSchema.min(1) });

export const projectVisibilityModerationSchema = z.object({
  projectId: idSchema.min(1),
  visibility: z.enum(["PRIVATE", "SCHOOL", "PUBLIC"]),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type ClassroomFormInput = z.infer<typeof classroomFormSchema>;
export type SchoolFormInput = z.infer<typeof schoolFormSchema>;
export type SkillFormInput = z.infer<typeof skillFormSchema>;
