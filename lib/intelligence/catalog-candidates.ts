import "server-only";

import { isAlcoholCategoryAllowedForMinor } from "@/lib/admin/alcohol-categories";
import { pickAdminFoodListing } from "@/lib/admin/pick-food-listing";
import { isUsableUploadedImageUrl } from "@/lib/images/uploaded-url";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { TasteLane } from "@/lib/intelligence/taste-lane";
import type { AlcoholPolicy } from "@/lib/intelligence/recommendation-engine";

export type CatalogCandidate = {
  recommendationId: string;
  cocktailName: string;
  alcoholCategory: string;
  flavorProfile: string;
  description: string;
  moodTags: string[];
  foodName: string | null;
  priorityScore: number;
};

type ListingRow = {
  id: string;
  cocktail_name: string;
  alcohol_category: string;
  flavor_profile: string;
  description: string;
  mood_tags: string[] | null;
  food_name: string | null;
  food_pairings: string[] | null;
  image_url: string | null;
  food_image_url: string | null;
  square_checkout_url: string;
  priority_score: number;
};

function pickByTaste(rows: ListingRow[], tasteLane: TasteLane): ListingRow | undefined {
  const keywords: Record<TasteLane, string[]> = {
    lemon: ["lemon", "citrus", "tangy", "crisp", "refresh"],
    strawberry: ["strawberry", "berry", "sweet", "juicy", "floral"],
    apple: ["apple", "warm", "smooth", "rich", "spice"],
  };
  const checks = keywords[tasteLane];
  return rows.find((item) => {
    const haystack =
      `${item.flavor_profile ?? ""} ${item.description ?? ""} ${item.cocktail_name ?? ""}`.toLowerCase();
    return checks.some((token) => haystack.includes(token));
  });
}

export async function loadCatalogCandidates({
  tasteLane,
  alcoholPolicy,
  maxCandidates,
  avoidIds = [],
}: {
  tasteLane: TasteLane;
  alcoholPolicy: AlcoholPolicy;
  maxCandidates: number;
  avoidIds?: string[];
}): Promise<{ candidates: CatalogCandidate[]; rowsById: Map<string, ListingRow> }> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("cocktail_recommendations")
    .select("*")
    .eq("active", true)
    .order("priority_score", { ascending: false })
    .limit(64);

  if (!data?.length) return { candidates: [], rowsById: new Map() };

  let pool = data as ListingRow[];
  if (alcoholPolicy === "minor") {
    pool = pool.filter((r) => isAlcoholCategoryAllowedForMinor(String(r.alcohol_category ?? "")));
  }

  const avoid = new Set(avoidIds);
  pool = pool.filter((r) => !avoid.has(r.id));

  const tasteMatch = pickByTaste(pool, tasteLane);
  const ordered = tasteMatch
    ? [tasteMatch, ...pool.filter((r) => r.id !== tasteMatch.id)]
    : pool;

  const sliced = ordered.slice(0, maxCandidates);
  const rowsById = new Map(sliced.map((r) => [r.id, r]));

  const candidates: CatalogCandidate[] = sliced.map((r) => ({
    recommendationId: r.id,
    cocktailName: r.cocktail_name,
    alcoholCategory: r.alcohol_category,
    flavorProfile: r.flavor_profile,
    description: r.description,
    moodTags: r.mood_tags ?? [],
    foodName: r.food_name,
    priorityScore: r.priority_score,
  }));

  return { candidates, rowsById };
}

export async function listingRowToRecommendationResult(
  primary: ListingRow,
  alternatePool: ListingRow[],
  emotionalReasoning: string,
  tasteLane: TasteLane,
): Promise<import("@/lib/intelligence/recommendation-engine").RecommendationEngineResult> {
  let foodPairings =
    primary.food_pairings?.length && primary.food_pairings.some((s) => String(s).trim())
      ? primary.food_pairings.filter((s) => String(s).trim())
      : [];

  let foodNameRaw =
    typeof primary.food_name === "string" && primary.food_name.trim() ? primary.food_name.trim() : null;

  let foodImageUrl = isUsableUploadedImageUrl(primary.food_image_url)
    ? primary.food_image_url.trim()
    : null;

  if (!foodImageUrl) {
    const adminFood = await pickAdminFoodListing(tasteLane, primary.id);
    if (adminFood) {
      foodImageUrl = adminFood.foodImageUrl;
      foodNameRaw = adminFood.foodName;
      foodPairings = adminFood.foodPairings;
    }
  }

  if (!foodNameRaw) {
    foodNameRaw = "Chef-selected pairing for tonight's mood";
    foodPairings = [foodNameRaw];
  } else if (!foodPairings.length) {
    foodPairings = [foodNameRaw];
  }

  return {
    source: "ai",
    recommendationId: primary.id,
    cocktailName: primary.cocktail_name,
    alcoholCategory: primary.alcohol_category,
    imageUrl: primary.image_url,
    flavorNotes: primary.flavor_profile,
    foodPairings,
    foodName: foodNameRaw,
    foodImageUrl,
    description: primary.description,
    squareCheckoutUrl: primary.square_checkout_url,
    emotionalReasoning,
    tasteLane,
    secondary: alternatePool.slice(0, 2).map((r) => ({
      cocktailName: r.cocktail_name,
      flavorNotes: r.flavor_profile,
      source: "admin",
    })),
  };
}
