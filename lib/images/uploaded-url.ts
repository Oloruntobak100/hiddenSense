/** True for http(s) URLs that are not Picsum catalog placeholders. */
export function isUsableUploadedImageUrl(raw: unknown): raw is string {
  if (typeof raw !== "string") return false;
  const trimmed = raw.trim();
  if (!trimmed) return false;
  if (trimmed.includes("picsum.photos")) return false;
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}
