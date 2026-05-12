"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ALCOHOL_CATEGORIES, type AlcoholCategory } from "@/lib/admin/alcohol-categories";
import { requireAdminUser } from "@/lib/auth/admin";
import { MOOD_ARCHETYPES } from "@/lib/intelligence/mood-archetypes";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const COCKTAIL_IMAGE_BUCKET = "cocktail-images";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const ALL_MOOD_KEYS = MOOD_ARCHETYPES.map((m) => m.key);

/** Minimal admin payload: curated rows tagged for every mood so the engine can still serve them via priority_score. */
const simpleCategory = z.string().refine((s): s is AlcoholCategory => (ALCOHOL_CATEGORIES as readonly string[]).includes(s));

const SimpleRecommendationSchema = z.object({
  cocktail_name: z.string().trim().min(2),
  alcohol_category: simpleCategory,
  square_checkout_url: z.string().trim().url(),
});

function flavorSlugFromCategory(category: string) {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "curated-house";
}

function extFromMime(contentType: string) {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/gif") return "gif";
  return "jpg";
}

async function uploadRecommendationImage(file: File, storageSubdir: "recommendations" | "recommendations/food" = "recommendations"): Promise<string | null> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    console.error("Invalid image type:", file.type);
    return null;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    console.error("Image too large:", file.size);
    return null;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.${extFromMime(file.type)}`;
  const path = `${storageSubdir}/${filename}`;
  const sb = getSupabaseAdmin();

  const { data, error } = await sb.storage.from(COCKTAIL_IMAGE_BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("Storage upload failed:", error.message);
    return null;
  }

  const {
    data: { publicUrl },
  } = sb.storage.from(COCKTAIL_IMAGE_BUCKET).getPublicUrl(data.path);
  return publicUrl;
}

export async function createRecommendation(formData: FormData) {
  await requireAdminUser();

  const uploaded = formData.get("image_file");
  if (!(uploaded instanceof File) || uploaded.size === 0) {
    console.error("createRecommendation: image file required");
    return;
  }

  const parsed = SimpleRecommendationSchema.safeParse({
    cocktail_name: formData.get("cocktail_name"),
    alcohol_category: formData.get("alcohol_category"),
    square_checkout_url: formData.get("square_checkout_url"),
  });

  if (!parsed.success) {
    console.error("createRecommendation: validation failed", parsed.error.flatten());
    return;
  }

  const imageUrl = await uploadRecommendationImage(uploaded);
  if (!imageUrl) return;

  const foodNameRaw = String(formData.get("food_name") ?? "").trim();
  const foodName = foodNameRaw.length >= 2 ? foodNameRaw : null;

  const foodUpload = formData.get("food_image_file");
  let foodImageUrl: string | null = null;
  if (foodUpload instanceof File && foodUpload.size > 0) {
    foodImageUrl = await uploadRecommendationImage(foodUpload, "recommendations/food");
    if (!foodImageUrl) return;
  }

  const slug = flavorSlugFromCategory(parsed.data.alcohol_category);
  const description = `${parsed.data.cocktail_name} · ${parsed.data.alcohol_category} serve for Hidden Spirits checkout.`;

  const sb = getSupabaseAdmin();
  const { error } = await sb.from("cocktail_recommendations").insert({
    cocktail_name: parsed.data.cocktail_name,
    alcohol_category: parsed.data.alcohol_category,
    mood_tags: [...ALL_MOOD_KEYS],
    flavor_profile: slug,
    emotional_tags: [],
    atmosphere_tags: [],
    description,
    square_checkout_url: parsed.data.square_checkout_url,
    image_url: imageUrl,
    food_pairings: foodName ? [foodName] : [],
    food_name: foodName,
    food_image_url: foodImageUrl,
    priority_score: 85,
    active: true,
  });

  if (error) {
    console.error("createRecommendation: insert failed", error.message);
    return;
  }
  revalidatePath("/admin");
}

export async function toggleRecommendationActive(id: string, nextActive: boolean) {
  await requireAdminUser();
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("cocktail_recommendations").update({ active: nextActive }).eq("id", id);
  if (error) return;
  revalidatePath("/admin");
}

export async function deleteRecommendation(id: string) {
  await requireAdminUser();
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("cocktail_recommendations").delete().eq("id", id);
  if (error) return;
  revalidatePath("/admin");
}
