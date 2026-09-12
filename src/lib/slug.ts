export function slugify(input: string, maxLength = 80): string {
  const base = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");

  return base.length > 0 ? base : "item";
}

export async function generateUniqueSlug(
  input: string,
  existsFn: (slug: string) => Promise<boolean>,
  maxLength = 80,
): Promise<string> {
  const base = slugify(input, maxLength);
  if (!(await existsFn(base))) return base;

  for (let suffix = 2; suffix <= 200; suffix += 1) {
    const candidate = `${base.slice(0, maxLength - String(suffix).length - 1)}-${suffix}`;
    if (!(await existsFn(candidate))) return candidate;
  }

  return `${base.slice(0, maxLength - 14)}-${Date.now().toString(36)}`;
}
