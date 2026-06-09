import "server-only";

import { slugFromUploadFilename, slugifyMediaLabel } from "@/lib/admin/media-slug";
import { uploadRecommendationImage } from "@/lib/admin/upload-image";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type MediaKind = "drink" | "food" | "general";

export type MediaAsset = {
  id: string;
  label: string;
  slug: string;
  public_url: string;
  storage_path: string;
  kind: MediaKind;
  created_at: string;
};

async function uniqueSlug(base: string): Promise<string> {
  const sb = getSupabaseAdmin();
  let candidate = base;
  let suffix = 2;

  while (true) {
    const { data } = await sb.from("media_assets").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
    if (suffix > 100) {
      candidate = `${base}-${Date.now()}`;
      break;
    }
  }

  return candidate;
}

export async function listMediaAssets(kind?: MediaKind): Promise<MediaAsset[]> {
  const sb = getSupabaseAdmin();
  let query = sb.from("media_assets").select("*").order("created_at", { ascending: false });
  if (kind) query = query.eq("kind", kind);
  const { data, error } = await query;
  if (error) {
    console.error("listMediaAssets:", error.message);
    return [];
  }
  return (data ?? []) as MediaAsset[];
}

export async function getMediaAssetBySlug(slug: string): Promise<MediaAsset | null> {
  const normalized = slugifyMediaLabel(slug);
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("media_assets").select("*").eq("slug", normalized).maybeSingle();
  return (data as MediaAsset | null) ?? null;
}

export async function createMediaAssetFromFile(
  file: File,
  options?: { label?: string; kind?: MediaKind },
): Promise<{ asset: MediaAsset } | { error: string }> {
  const uploaded = await uploadRecommendationImage(file, "media");
  if ("error" in uploaded) return uploaded;

  const label = options?.label?.trim() || file.name.replace(/\.[^.]+$/, "") || "Untitled";
  const baseSlug = slugFromUploadFilename(options?.label || file.name);
  const slug = await uniqueSlug(baseSlug);
  const kind = options?.kind ?? "general";

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("media_assets")
    .insert({
      label,
      slug,
      public_url: uploaded.url,
      storage_path: uploaded.path,
      kind,
    })
    .select("*")
    .single();

  if (error) {
    console.error("createMediaAssetFromFile:", error.message);
    return { error: `Could not save media asset: ${error.message}` };
  }

  return { asset: data as MediaAsset };
}

export async function deleteMediaAsset(id: string): Promise<{ ok: true } | { error: string }> {
  const sb = getSupabaseAdmin();
  const { data: asset, error: fetchError } = await sb
    .from("media_assets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !asset) {
    return { error: "Media asset not found." };
  }

  const url = asset.public_url as string;
  const { count: drinkUsage } = await sb
    .from("cocktail_recommendations")
    .select("*", { count: "exact", head: true })
    .eq("image_url", url);
  const { count: foodUsage } = await sb
    .from("cocktail_recommendations")
    .select("*", { count: "exact", head: true })
    .eq("food_image_url", url);

  if ((drinkUsage ?? 0) > 0 || (foodUsage ?? 0) > 0) {
    return { error: "This image is linked to one or more listings. Remove it from listings first." };
  }

  const { error: storageError } = await sb.storage
    .from("cocktail-images")
    .remove([asset.storage_path as string]);
  if (storageError) {
    console.error("deleteMediaAsset storage:", storageError.message);
  }

  const { error: deleteError } = await sb.from("media_assets").delete().eq("id", id);
  if (deleteError) {
    return { error: deleteError.message };
  }

  return { ok: true };
}

export async function resolveMediaUrlBySlug(slug: string | undefined): Promise<string | null> {
  if (!slug?.trim()) return null;
  const asset = await getMediaAssetBySlug(slug);
  return asset?.public_url ?? null;
}
