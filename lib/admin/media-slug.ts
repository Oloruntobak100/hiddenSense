/** Normalize a filename or label into a unique-friendly slug for media_assets.slug */
export function slugifyMediaLabel(raw: string): string {
  const base = raw
    .replace(/\.[^.]+$/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return base || "asset";
}

export function slugFromUploadFilename(filename: string): string {
  return slugifyMediaLabel(filename);
}
