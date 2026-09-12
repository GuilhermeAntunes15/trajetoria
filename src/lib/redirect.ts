const SAFE_PATH = /^\/(?!\/|\\)[^\s]*$/;

export function safeRedirect(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (trimmed === "/") return trimmed;
  if (!SAFE_PATH.test(trimmed)) return fallback;
  return trimmed;
}
