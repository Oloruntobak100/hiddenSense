import "server-only";
import { isAlcoholCategoryAllowedForMinor } from "@/lib/admin/alcohol-categories";
import { pickAdminFoodListing } from "@/lib/admin/pick-food-listing";
import { isUsableUploadedImageUrl } from "@/lib/images/uploaded-url";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { MoodArchetype } from "@/lib/intelligence/mood-archetypes";
import type { EmotionalScores } from "@/lib/intelligence/scoring";
import { getRecommendation } from "@/lib/catalog/recommendations";
import type { TasteLane } from "@/lib/intelligence/taste-lane";

export type AlcoholPolicy = "adult" | "minor";

export type RecommendationEngineResult = {
  source: "admin" | "internal" | "external" | "ai_fallback" | "ai";
  recommendationId: string | null;
  cocktailName: string;
  alcoholCategory: string;
  imageUrl: string | null;
  flavorNotes: string;
  foodPairings: string[];
  /** Primary food label for dual-card result UI */
  foodName: string | null;
  foodImageUrl: string | null;
  description: string;
  squareCheckoutUrl: string | null;
  emotionalReasoning: string;
  tasteLane: TasteLane;
  secondary: Array<{ cocktailName: string; flavorNotes: string; source: string }>;
};

export async function getRecommendationForMood({
  mood,
  scores,
  tasteLane,
  alcoholPolicy = "adult",
}: {
  mood: MoodArchetype;
  scores: EmotionalScores;
  tasteLane: TasteLane;
  alcoholPolicy?: AlcoholPolicy;
}): Promise<RecommendationEngineResult> {
  if (alcoholPolicy === "minor") {
    const adminNa = await findAdminRecommendation(mood, scores, tasteLane, { minorOnly: true });
    if (adminNa) return adminNa;
    const internalNa = minorInternalFromCatalog(mood, scores, tasteLane);
    if (internalNa) return internalNa;
    return minorAiFallback(mood, scores, tasteLane);
  }

  const adminFirst = await findAdminRecommendation(mood, scores, tasteLane, { minorOnly: false });
  if (adminFirst) return adminFirst;

  const internal = getRecommendation(mood.key);
  if (internal) {
    return {
      source: "internal",
      recommendationId: null,
      cocktailName: internal.cocktailName,
      alcoholCategory: "curated-house",
      imageUrl: internal.cocktailImage,
      flavorNotes: mood.flavor_profile,
      foodPairings: [internal.foodName],
      foodName: internal.foodName,
      foodImageUrl: internal.foodImage,
      description: internal.pairingLine,
      squareCheckoutUrl: null,
      emotionalReasoning: buildReasoning(mood, scores, tasteLane),
      tasteLane,
      secondary: [
        { cocktailName: internal.foodName, flavorNotes: "food pairing", source: "internal" },
      ],
    };
  }

  const external = await fetchCocktailDbFallback(mood, tasteLane);
  if (external) return external;

  return {
    source: "ai_fallback",
    recommendationId: null,
    cocktailName: "HiddenSense Signature Nightcap",
    alcoholCategory: "adaptive",
    imageUrl: null,
    flavorNotes: mood.flavor_profile,
    foodPairings: ["Chef's seasonal small plate"],
    foodName: "Chef's seasonal small plate",
    foodImageUrl: null,
    description: "Custom-curated based on your emotional profile.",
    squareCheckoutUrl: null,
    emotionalReasoning: buildReasoning(mood, scores, tasteLane),
    tasteLane,
    secondary: [],
  };
}

type AdminPickOpts = { minorOnly?: boolean };

async function findAdminRecommendation(
  mood: MoodArchetype,
  scores: EmotionalScores,
  tasteLane: TasteLane,
  opts: AdminPickOpts = {},
): Promise<RecommendationEngineResult | null> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("cocktail_recommendations")
    .select("*")
    .eq("active", true)
    .order("priority_score", { ascending: false })
    .limit(16);

  if (!data?.length) return null;

  let pool = data;
  if (opts.minorOnly) {
    pool = data.filter((r) => isAlcoholCategoryAllowedForMinor(String(r.alcohol_category ?? "")));
  }
  if (!pool.length) return null;

  const primary = pickByTaste(pool, tasteLane) ?? pool[0];
  const alternatePool = pool.filter((r) => r.id !== primary.id);

  let foodPairings =
    primary.food_pairings?.length && primary.food_pairings.some((s) => String(s).trim())
      ? primary.food_pairings.filter((s) => String(s).trim())
      : [];

  let foodNameRaw =
    typeof primary.food_name === "string" && primary.food_name.trim()
      ? primary.food_name.trim()
      : null;

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
    source: "admin",
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
    emotionalReasoning: buildReasoning(mood, scores, tasteLane),
    tasteLane,
    secondary: alternatePool.slice(0, 2).map((r) => ({
      cocktailName: r.cocktail_name,
      flavorNotes: r.flavor_profile,
      source: "admin",
    })),
  };
}

function minorInternalFromCatalog(
  mood: MoodArchetype,
  scores: EmotionalScores,
  tasteLane: TasteLane,
): RecommendationEngineResult | null {
  const internal = getRecommendation(mood.key);
  if (!internal) return null;
  return {
    source: "internal",
    recommendationId: null,
    cocktailName: `Zero-proof palette · ${mood.name}`,
    alcoholCategory: "non-alcoholic",
    imageUrl: internal.foodImage,
    flavorNotes: mood.flavor_profile,
    foodPairings: [internal.foodName],
    foodName: internal.foodName,
    foodImageUrl: internal.foodImage,
    description: `${internal.pairingLine} Alcohol-free serves and food-forward calm for tonight.`,
    squareCheckoutUrl: null,
    emotionalReasoning: buildReasoning(mood, scores, tasteLane),
    tasteLane,
    secondary: [],
  };
}

function minorAiFallback(mood: MoodArchetype, scores: EmotionalScores, tasteLane: TasteLane): RecommendationEngineResult {
  return {
    source: "ai_fallback",
    recommendationId: null,
    cocktailName: "HiddenSense NA wind-down",
    alcoholCategory: "non-alcoholic",
    imageUrl: null,
    flavorNotes: mood.flavor_profile,
    foodPairings: ["Seasonal fruit, herbs, and light bites"],
    foodName: "Seasonal fruit, herbs, and light bites",
    foodImageUrl: null,
    description: "A gentle, alcohol-free pairing tuned to your mood.",
    squareCheckoutUrl: null,
    emotionalReasoning: buildReasoning(mood, scores, tasteLane),
    tasteLane,
    secondary: [],
  };
}

async function fetchCocktailDbFallback(mood: MoodArchetype, tasteLane: TasteLane): Promise<RecommendationEngineResult | null> {
  const query = encodeURIComponent(queryByTasteLane(tasteLane));
  try {
    const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${query}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { drinks?: Array<Record<string, string | null>> };
    const drink = json.drinks?.[0];
    if (!drink) return null;

    const name = drink.strDrink ?? "External Signature Cocktail";
    const imageUrl = drink.strDrinkThumb ?? null;
    const category = drink.strCategory ?? "external";
    const instructions = drink.strInstructions ?? "Built from flavor profile match.";

    return {
      source: "external",
      recommendationId: null,
      cocktailName: name,
      alcoholCategory: category,
      imageUrl,
      flavorNotes: mood.flavor_profile,
      foodPairings: ["Chef-selected pairing"],
      foodName: "Chef-selected pairing",
      foodImageUrl: null,
      description: instructions,
      squareCheckoutUrl: null,
      emotionalReasoning: buildReasoning(mood, undefined, tasteLane),
      tasteLane,
      secondary: [],
    };
  } catch {
    return null;
  }
}

function buildReasoning(mood: MoodArchetype, scores?: EmotionalScores, tasteLane?: TasteLane) {
  const tasteHint = tasteLane ? ` Your sensory pull leans ${tasteLane}, so the pairing emphasizes that finish.` : "";
  if (!scores) {
    return `You’re showing a ${mood.social_tendency} social tendency with ${mood.energy_level} energy. ${mood.name} aligns with your tone tonight and supports a ${mood.atmosphere} atmosphere.${tasteHint}`;
  }

  const pressureTone = scores.emotional_weight < 0 ? "carrying emotional pressure" : "moving with emotional lightness";
  const paceTone = scores.energy_score > 0.5 ? "higher momentum" : scores.energy_score < -0.5 ? "a slower reset pace" : "steady tempo";
  return `You’re ${pressureTone} with ${paceTone}. ${mood.name} keeps your night aligned with ${mood.flavor_profile} notes and a ${mood.atmosphere} experience.${tasteHint}`;
}

function queryByTasteLane(tasteLane: TasteLane) {
  if (tasteLane === "lemon") return "lemon";
  if (tasteLane === "apple") return "apple";
  return "strawberry";
}

function pickByTaste<T extends { flavor_profile?: string | null; description?: string | null; cocktail_name?: string | null }>(
  recommendations: T[],
  tasteLane: TasteLane,
) {
  const keywords: Record<TasteLane, string[]> = {
    lemon: ["lemon", "citrus", "tangy", "crisp", "refresh"],
    strawberry: ["strawberry", "berry", "sweet", "juicy", "floral"],
    apple: ["apple", "warm", "smooth", "rich", "spice"],
  };
  const checks = keywords[tasteLane];
  return recommendations.find((item) => {
    const haystack = `${item.flavor_profile ?? ""} ${item.description ?? ""} ${item.cocktail_name ?? ""}`.toLowerCase();
    return checks.some((token) => haystack.includes(token));
  });
}
