import "server-only";

import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const COCKTAIL_IMAGE_BUCKET = "cocktail-images";
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function extFromMime(contentType: string) {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/gif") return "gif";
  return "jpg";
}

export function resolveImageMime(file: File): string | null {
  if (file.type && ALLOWED_IMAGE_TYPES.has(file.type)) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return null;
}

export function fileFromFormData(formData: FormData, key: string): File | null {
  const uploaded = formData.get(key);
  if (!(uploaded instanceof File) || uploaded.size === 0) return null;
  return uploaded;
}

export function filesFromFormData(formData: FormData, key: string): File[] {
  return formData
    .getAll(key)
    .filter((item): item is File => item instanceof File && item.size > 0);
}

export async function uploadImageBuffer(
  buffer: Buffer,
  contentType: string,
  storageSubdir: "recommendations" | "recommendations/food" | "media",
): Promise<{ url: string; path: string } | { error: string }> {
  const filename = `${randomUUID()}.${extFromMime(contentType)}`;
  const path = `${storageSubdir}/${filename}`;
  const sb = getSupabaseAdmin();

  const { data, error } = await sb.storage.from(COCKTAIL_IMAGE_BUCKET).upload(path, buffer, {
    contentType,
    upsert: false,
  });

  if (error) {
    console.error("Storage upload failed:", error.message);
    return { error: `Image upload failed: ${error.message}` };
  }

  const {
    data: { publicUrl },
  } = sb.storage.from(COCKTAIL_IMAGE_BUCKET).getPublicUrl(data.path);
  return { url: publicUrl, path: data.path };
}

export async function uploadRecommendationImage(
  file: File,
  storageSubdir: "recommendations" | "recommendations/food" | "media" = "recommendations",
): Promise<{ url: string; path: string } | { error: string }> {
  const contentType = resolveImageMime(file);
  if (!contentType) {
    return { error: "Image must be JPEG, PNG, WebP, or GIF." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "Image must be 5 MB or smaller." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadImageBuffer(buffer, contentType, storageSubdir);
}

export async function deleteStorageObject(path: string): Promise<{ error?: string }> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.storage.from(COCKTAIL_IMAGE_BUCKET).remove([path]);
  if (error) {
    return { error: error.message };
  }
  return {};
}
