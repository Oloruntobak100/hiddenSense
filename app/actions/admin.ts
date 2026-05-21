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

function fileFromFormData(formData: FormData, key: string): File | null {
  const uploaded = formData.get(key);
  if (!(uploaded instanceof File) || uploaded.size === 0) return null;
  return uploaded;
}

async function uploadRecommendationImage(
  file: File,
  storageSubdir: "recommendations" | "recommendations/food" = "recommendations",
): Promise<string | null> {
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

  const drinkImageFile = fileFromFormData(formData, "image_file");
  const foodImageFile = fileFromFormData(formData, "food_image_file");

  const parsed = FormFieldsSchema.safeParse({
    cocktail_name: formData.get("cocktail_name"),
    alcohol_category: formData.get("alcohol_category"),
    square_checkout_url: formData.get("square_checkout_url"),
    food_name: formData.get("food_name"),
  });

  if (!parsed.success) {
    console.error("createRecommendation: validation failed", parsed.error.flatten());
    return;
  }

  const { cocktail_name, alcohol_category, square_checkout_url, food_name } = parsed.data;

  const hasDrink = Boolean(cocktail_name || drinkImageFile);
  const hasFood = Boolean(food_name || foodImageFile);

  if (!hasDrink && !hasFood) {
    console.error("createRecommendation: add at least a drink or a food item");
    return;
  }

  let imageUrl: string | null = null;
  if (drinkImageFile) {
    imageUrl = await uploadRecommendationImage(drinkImageFile);
    if (!imageUrl) return;
  }

  let foodImageUrl: string | null = null;
  if (foodImageFile) {
    foodImageUrl = await uploadRecommendationImage(foodImageFile, "recommendations/food");
    if (!foodImageUrl) return;
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
