/** Allowlisted in-app redirect target after email confirmation / magic link. */
export function getSafeInternalNext(next: string | null | undefined, fallback = "/intro"): string {
  if (!next || typeof next !== "string") return fallback;
  const t = next.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return fallback;
  if (t.includes("..")) return fallback;
  const blocked = ["/auth/callback", "/gate", "/login"];
  for (const b of blocked) {
    if (t === b || t.startsWith(`${b}?`)) return fallback;
  }
  return t.length > 512 ? fallback : t;
}
