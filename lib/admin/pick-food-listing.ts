import "server-only";

import { isUsableUploadedImageUrl } from "@/lib/images/uploaded-url";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { TasteLane } from "@/lib/intelligence/taste-lane";

export type AdminFoodListing = {
  foodImageUrl: string;
  foodName: string;
  foodPairings: string[];
};

type Row = {
  id: string;
  food_name: string | null;
  food_image_url: string | null;
  food_pairings: string[] | null;
  flavor_profile: string | null;
  description: string | null;
  cocktail_name: string | null;
};

function pickByTaste(rows: Row[], tasteLane: TasteLane | null): Row | undefined {
  if (!tasteLane) return undefined;
  const keywords: Record<TasteLane, string[]> = {
    lemon: ["lemon", "citrus", "tangy", "crisp", "refresh"],
    strawberry: ["strawberry", "berry", "sweet", "juicy", "floral"],
    apple: ["apple", "warm", "smooth", "rich", "spice"],
  };
  const checks = keywords[tasteLane];
  return rows.find((item) => {
    const haystack = `${item.flavor_profile ?? ""} ${item.description ?? ""} ${item.cocktail_name ?? ""} ${item.food_name ?? ""}`.toLowerCase();
    return checks.some((token) => haystack.includes(token));
  });
}

/** Best active admin row that has an uploaded food image (may differ from the drink listing). */
export async function pickAdminFoodListing(
  tasteLane: TasteLane | null,
  excludeRecommendationId?: string | null,
): Promise<AdminFoodListing | null> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("cocktail_recommendations")
    .select("id, food_name, food_image_url, food_pairings, flavor_profile, description, cocktail_name")
    .eq("active", true)
    .order("priority_score", { ascending: false })
    .limit(32);

  if (!data?.length) return null;

  const pool: Array<Row & { food_image_url: string }> = [];
  for (const row of data) {
    if (row.id === excludeRecommendationId) continue;
    if (!isUsableUploadedImageUrl(row.food_image_url)) continue;
    pool.push({ ...row, food_image_url: row.food_image_url.trim() });
  }

  if (!pool.length) return null;

  const picked = pickByTaste(pool, tasteLane) ?? pool[0];
  const foodName =
    (typeof picked.food_name === "string" && picked.food_name.trim()) ||
    (picked.food_pairings?.find((s) => String(s).trim()) ?? "") ||
    picked.cocktail_name?.trim() ||
    "Chef-selected pairing";

  const foodPairings =
    picked.food_pairings?.length && picked.food_pairings.some((s) => String(s).trim())
      ? picked.food_pairings.filter((s) => String(s).trim())
      : [foodName];

  return {
    foodImageUrl: picked.food_image_url.trim(),
    foodName,
    foodPairings,
  };
}
