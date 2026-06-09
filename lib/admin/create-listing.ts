import "server-only";

import {
  ALL_MOOD_KEYS,
  buildListingDescription,
  flavorSlugFromCategory,
  ListingFieldsSchema,
  PLACEHOLDER_CHECKOUT_URL,
} from "@/lib/admin/listing-fields";
import { fileFromFormData, uploadRecommendationImage } from "@/lib/admin/upload-image";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type CreateListingResult = { ok: true } | { ok: false; error: string };

function formString(formData: FormData, key: string): string {
  const v = formData.get(key);
  if (v == null || typeof v !== "string") return "";
  return v;
}

export async function processCreateListing(formData: FormData): Promise<CreateListingResult> {
  const drinkImageFile = fileFromFormData(formData, "image_file");
  const foodImageFile = fileFromFormData(formData, "food_image_file");

  const parsed = ListingFieldsSchema.safeParse({
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
  const description = buildListingDescription({
    cocktailName: resolvedCocktailName,
    foodName: resolvedFoodName,
    alcoholCategory: alcohol_category,
  });
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
