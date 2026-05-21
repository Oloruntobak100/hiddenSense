import "server-only";

import { pickAdminFoodListing } from "@/lib/admin/pick-food-listing";
import { getRecommendation } from "@/lib/catalog/recommendations";
import { isUsableUploadedImageUrl } from "@/lib/images/uploaded-url";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { TasteLane } from "@/lib/intelligence/taste-lane";

type Payload = {
  cocktailName?: string;
  foodName?: string | null;
  foodPairings?: string[];
  foodImageUrl?: string | null;
  imageUrl?: string | null;
  flavorNotes?: string;
  description?: string;
  tasteLane?: TasteLane;
} | null | undefined;

export type ResolvedResultAssets = {
  cocktailName: string;
  foodTitle: string;
  foodPairings: string[];
  drinkImage: string | null;
  foodImage: string | null;
  flavorNotes: string;
  description: string;
  tasteLane: TasteLane | null;
};

export async function resolveResultAssets(
  moodKey: string,
  payload: Payload,
  recommendationId: string | null,
): Promise<ResolvedResultAssets> {
  const catalog = getRecommendation(moodKey);
  const tasteLane = payload?.tasteLane ?? null;

  let drinkImage: string | null = isUsableUploadedImageUrl(payload?.imageUrl) ? payload.imageUrl.trim() : null;
  let foodImage: string | null = isUsableUploadedImageUrl(payload?.foodImageUrl)
    ? payload.foodImageUrl.trim()
    : null;

  let cocktailName = payload?.cocktailName ?? catalog.cocktailName;
  let foodTitle =
    typeof payload?.foodName === "string" && payload.foodName.trim()
      ? payload.foodName.trim()
      : catalog.foodName;

  const payloadPairings = payload?.foodPairings;
  let foodPairings =
    Array.isArray(payloadPairings) && payloadPairings.some((x) => typeof x === "string" && x.trim())
      ? payloadPairings.filter((x): x is string => typeof x === "string" && Boolean(x.trim()))
      : [foodTitle];

  if (recommendationId) {
    const sb = getSupabaseAdmin();
    const { data } = await sb
      .from("cocktail_recommendations")
      .select("cocktail_name, image_url, food_name, food_image_url, food_pairings")
      .eq("id", recommendationId)
      .maybeSingle();

    if (data) {
      if (typeof data.cocktail_name === "string" && data.cocktail_name.trim()) {
        cocktailName = data.cocktail_name.trim();
      }
      if (isUsableUploadedImageUrl(data.image_url)) {
        drinkImage = data.image_url.trim();
      }
      if (typeof data.food_name === "string" && data.food_name.trim()) {
        foodTitle = data.food_name.trim();
      }
      if (isUsableUploadedImageUrl(data.food_image_url)) {
        foodImage = data.food_image_url.trim();
      }
      if (data.food_pairings?.length && data.food_pairings.some((s) => String(s).trim())) {
        foodPairings = data.food_pairings.filter((s) => String(s).trim());
      } else if (foodTitle) {
        foodPairings = [foodTitle];
      }
    }
  }

  if (!foodImage) {
    const adminFood = await pickAdminFoodListing(tasteLane, recommendationId);
    if (adminFood) {
      foodImage = adminFood.foodImageUrl;
      foodTitle = adminFood.foodName;
      foodPairings = adminFood.foodPairings;
    }
  }

  if (!drinkImage && isUsableUploadedImageUrl(catalog.cocktailImage)) {
    drinkImage = catalog.cocktailImage;
  }

  if (foodTitle === catalog.foodName && !foodImage) {
    foodTitle = "Chef-selected pairing";
    foodPairings = [foodTitle];
  }

  return {
    cocktailName,
    foodTitle,
    foodPairings,
    drinkImage,
    foodImage,
    flavorNotes: payload?.flavorNotes ?? "Balanced emotional flavor profile",
    description: payload?.description ?? catalog.pairingLine,
    tasteLane,
  };
}
