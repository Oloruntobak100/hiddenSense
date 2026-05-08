import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { MoodArchetype } from "@/lib/intelligence/mood-archetypes";
import type { EmotionalScores } from "@/lib/intelligence/scoring";
import { getRecommendation } from "@/lib/catalog/recommendations";

export type RecommendationEngineResult = {
  source: "admin" | "internal" | "external" | "ai_fallback";
  recommendationId: string | null;
  cocktailName: string;
  alcoholCategory: string;
  imageUrl: string | null;
  flavorNotes: string;
  foodPairings: string[];
  description: string;
  squareCheckoutUrl: string | null;
  emotionalReasoning: string;
  secondary: Array<{ cocktailName: string; flavorNotes: string; source: string }>;
};

export async function getRecommendationForMood({
  mood,
  scores,
}: {
  mood: MoodArchetype;
  scores: EmotionalScores;
}): Promise<RecommendationEngineResult> {
  const adminFirst = await findAdminRecommendation(mood);
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
      description: internal.pairingLine,
      squareCheckoutUrl: null,
      emotionalReasoning: buildReasoning(mood, scores),
      secondary: [
        { cocktailName: internal.foodName, flavorNotes: "food pairing", source: "internal" },
      ],
    };
  }

  const external = await fetchCocktailDbFallback(mood);
  if (external) return external;

  return {
    source: "ai_fallback",
    recommendationId: null,
    cocktailName: "HiddenSense Signature Nightcap",
    alcoholCategory: "adaptive",
    imageUrl: null,
    flavorNotes: mood.flavor_profile,
    foodPairings: ["Chef's seasonal small plate"],
    description: "Custom-curated based on your emotional profile.",
    squareCheckoutUrl: null,
    emotionalReasoning: buildReasoning(mood, scores),
    secondary: [],
  };
}

async function findAdminRecommendation(mood: MoodArchetype): Promise<RecommendationEngineResult | null> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("cocktail_recommendations")
    .select("*")
    .eq("active", true)
    .contains("mood_tags", [mood.key])
    .order("priority_score", { ascending: false })
    .limit(3);

  if (!data || data.length === 0) return null;
  const primary = data[0];
  return {
    source: "admin",
    recommendationId: primary.id,
    cocktailName: primary.cocktail_name,
    alcoholCategory: primary.alcohol_category,
    imageUrl: primary.image_url,
    flavorNotes: primary.flavor_profile,
    foodPairings: primary.food_pairings,
    description: primary.description,
    squareCheckoutUrl: primary.square_checkout_url,
    emotionalReasoning: buildReasoning(mood),
    secondary: data.slice(1, 3).map((r) => ({
      cocktailName: r.cocktail_name,
      flavorNotes: r.flavor_profile,
      source: "admin",
    })),
  };
}

async function fetchCocktailDbFallback(mood: MoodArchetype): Promise<RecommendationEngineResult | null> {
  const query = encodeURIComponent(mood.flavor_profile.split("-")[0] || "cocktail");
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
      description: instructions,
      squareCheckoutUrl: null,
      emotionalReasoning: buildReasoning(mood),
      secondary: [],
    };
  } catch {
    return null;
  }
}

function buildReasoning(mood: MoodArchetype, scores?: EmotionalScores) {
  if (!scores) {
    return `You’re showing a ${mood.social_tendency} social tendency with ${mood.energy_level} energy. ${mood.name} aligns with your tone tonight and supports a ${mood.atmosphere} atmosphere.`;
  }

  const pressureTone = scores.emotional_weight < 0 ? "carrying emotional pressure" : "moving with emotional lightness";
  const paceTone = scores.energy_score > 0.5 ? "higher momentum" : scores.energy_score < -0.5 ? "a slower reset pace" : "steady tempo";
  return `You’re ${pressureTone} with ${paceTone}. ${mood.name} keeps your night aligned with ${mood.flavor_profile} notes and a ${mood.atmosphere} experience.`;
}
