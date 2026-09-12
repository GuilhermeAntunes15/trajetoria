import type { PrismaClient, SkillCategory } from "@prisma/client";
import { slugify } from "@/lib/slug";

export const DEFAULT_SKILLS: { name: string; category: SkillCategory }[] = [
  { name: "Python", category: "TECHNICAL" },
  { name: "JavaScript", category: "TECHNICAL" },
  { name: "SQL", category: "TECHNICAL" },
  { name: "Arduino", category: "TECHNICAL" },
  { name: "APIs", category: "TECHNICAL" },
  { name: "Análise de Dados", category: "TECHNICAL" },
  { name: "Figma", category: "TECHNICAL" },
  { name: "Eletrônica", category: "TECHNICAL" },
  { name: "Comunicação", category: "SOFT_SKILL" },
  { name: "Liderança", category: "SOFT_SKILL" },
  { name: "Trabalho em equipe", category: "SOFT_SKILL" },
  { name: "Criatividade", category: "SOFT_SKILL" },
  { name: "Organização", category: "SOFT_SKILL" },
  { name: "Pesquisa", category: "ACADEMIC" },
  { name: "Pensamento crítico", category: "ACADEMIC" },
  { name: "Resolução de problemas", category: "ACADEMIC" },
];

export async function seedDefaultSkills(
  client: Pick<PrismaClient, "skill">,
  schoolId: string,
): Promise<number> {
  let created = 0;

  for (const skill of DEFAULT_SKILLS) {
    const slug = slugify(skill.name, 60);
    const existing = await client.skill.findUnique({
      where: { schoolId_slug: { schoolId, slug } },
      select: { id: true },
    });

    if (existing) continue;

    await client.skill.create({
      data: { name: skill.name, slug, category: skill.category, schoolId },
    });
    created += 1;
  }

  return created;
}
