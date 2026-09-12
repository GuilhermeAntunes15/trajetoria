export function likePattern(value: string): string {
  const escaped = value.trim().replace(/[\\%_]/g, (char) => `\\${char}`);
  return `%${escaped}%`;
}
