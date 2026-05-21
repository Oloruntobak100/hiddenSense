import "server-only";

import { randomUUID } from "crypto";
import { z } from "zod";
import { ALCOHOL_CATEGORIES, type AlcoholCategory } from "@/lib/admin/alcohol-categories";
import { MOOD_ARCHETYPES } from "@/lib/intelligence/mood-archetypes";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const COCKTAIL_IMAGE_BUCKET = "cocktail-images";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const PLACEHOLDER_CHECKOUT_URL = "https://example.com/checkout";

const ALL_MOOD_KEYS = MOOD_ARCHETYPES.map((m) => m.key);

const simpleCategory = z
  .string()
  .trim()
  .optional()
  .transform((s) => (s && s.length > 0 ? s : "Other"))
  .refine((s): s is AlcoholCategory => (ALCOHOL_CATEGORIES as readonly string[]).includes(s), {
    message: "Invalid category",
  });

const optionalName = z
  .string()
  .trim()
  .optional()
  .transform((s) => (s && s.length >= 2 ? s : undefined));

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((s) => {
    if (!s) return undefined;
    const parsed = z.string().url().safeParse(s);
    return parsed.success ? parsed.data : undefined;
  });

const FormFieldsSchema = z.object({
  cocktail_name: optionalName,
  alcohol_category: simpleCategory,
  square_checkout_url: optionalUrl,
  food_name: optionalName,
});

export type CreateListingResult =
  | { ok: true }
  | { ok: false; error: string };

function formString(formData: FormData, key: string): string {
  const v = formData.get(key);
  if (v == null || typeof v !== "string") return "";
  return v;
}

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

function resolveImageMime(file: File): string | null {
  if (file.type && ALLOWED_IMAGE_TYPES.has(file.type)) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return null;
}

function fileFromFormData(formData: FormData, key: string): File | null {
  const uploaded = formData.get(key);
  if (!(uploaded instanceof File) || uploaded.size === 0) return null;
  return uploaded;
}

async function uploadRecommendationImage(
  file: File,
  storageSubdir: "recommendations" | "recommendations/food" = "recommendations",
): Promise<{ url: string } | { error: string }> {
  const contentType = resolveImageMime(file);
  if (!contentType) {
    return { error: "Image must be JPEG, PNG, WebP, or GIF." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "Image must be 5 MB or smaller." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
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
  return { url: publicUrl };
}

export async function processCreateListing(formData: FormData): Promise<CreateListingResult> {
  const drinkImageFile = fileFromFormData(formData, "image_file");
  const foodImageFile = fileFromFormData(formData, "food_image_file");

  const parsed = FormFieldsSchema.safeParse({
    cocktail_name: formString(formData, "cocktail_name"),
    alcohol_category: formString(formData, "alcohol_category"),
    square_checkout_url: formString(formData, "square_checkout_url"),
    food_name: formString(formData, "food_name"),
  });

  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      Object.values(first).flat()[0] ??
      "Could not read the form. Check your entries and try again.";
    return { ok: false, error: msg };
  }

  const { cocktail_name, alcohol_category, square_checkout_url, food_name } = parsed.data;

  const hasDrink = Boolean(cocktail_name || drinkImageFile);
  const hasFood = Boolean(food_name || foodImageFile);

  if (!hasDrink && !hasFood) {
    return {
      ok: false,
      error: "Add at least a drink name or drink image, or a food name or food image.",
    };
  }

  let imageUrl: string | null = null;
  if (drinkImageFile) {
    const uploaded = await uploadRecommendationImage(drinkImageFile);
    if ("error" in uploaded) return { ok: false, error: uploaded.error };
    imageUrl = uploaded.url;
  }

  let foodImageUrl: string | null = null;
  if (foodImageFile) {
    const uploaded = await uploadRecommendationImage(foodImageFile, "recommendations/food");
    if ("error" in uploaded) return { ok: false, error: uploaded.error };
    foodImageUrl = uploaded.url;
  }

  const resolvedFoodName = food_name ?? null;
  const resolvedCocktailName =
    cocktail_name ?? resolvedFoodName ?? (hasDrink ? "House cocktail" : "Food pairing");

  const squareCheckoutUrl = square_checkout_url ?? PLACEHOLDER_CHECKOUT_URL;

  const descriptionParts: string[] = [];
  if (hasDrink) descriptionParts.push(resolvedCocktailName);
  if (resolvedFoodName) descriptionParts.push(resolvedFoodName);
  const description =
    descriptionParts.length > 0
      ? `${descriptionParts.join(" · ")} · ${alcohol_category} listing for Hidden Spirits checkout.`
      : `${alcohol_category} listing for Hidden Spirits checkout.`;

  const slug = flavorSlugFromCategory(alcohol_category);

  const sb = getSupabaseAdmin();
  const { error } = await sb.from("cocktail_recommendations").insert({
    cocktail_name: resolvedCocktailName,
    alcohol_category,
    mood_tags: [...ALL_MOOD_KEYS],
    flavor_profile: slug,
    emotional_tags: [],
    atmosphere_tags: [],
    description,
    square_checkout_url: squareCheckoutUrl,
    image_url: imageUrl,
    food_pairings: resolvedFoodName ? [resolvedFoodName] : [],
    food_name: resolvedFoodName,
    food_image_url: foodImageUrl,
    priority_score: 85,
    active: true,
  });

  if (error) {
    console.error("createRecommendation: insert failed", error.message);
    return { ok: false, error: `Could not save listing: ${error.message}` };
  }

  return { ok: true };
}
