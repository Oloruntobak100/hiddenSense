/** Emails allowed to use `/admin` and server admin actions. Keep lowercase in comparisons. */
export const ADMIN_EMAILS = [
  "kaytoba49@gmail.com",
  "hiddenspiritsusa@gmail.com",
] as const;

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  return ADMIN_EMAILS.some((e) => e.toLowerCase() === lower);
}
