import "server-only";

import { getAiAgentConfig } from "@/lib/intelligence/ai-agent-config";
import { getAiRecommendation } from "@/lib/intelligence/ai-recommendation";
import type { MoodArchetype } from "@/lib/intelligence/mood-archetypes";
import {
  getRecommendationForMood,
  type AlcoholPolicy,
  type RecommendationEngineResult,
} from "@/lib/intelligence/recommendation-engine";
import type { EmotionalScores } from "@/lib/intelligence/scoring";
import type { TasteLane } from "@/lib/intelligence/taste-lane";
import { avoidIdsForMood, loadUserRecommendationContext } from "@/lib/intelligence/user-context";
import { getCatalogPolicyConfig } from "@/lib/admin/catalog-policy";

export type ResolveRecommendationInput = {
  profileId: string;
  mood: MoodArchetype;
  scores: EmotionalScores;
  tasteLane: TasteLane;
  alcoholPolicy: AlcoholPolicy;
  flavorProfile: string;
  atmosphereProfile: string;
};

/** Tries AI (with user history + feedback), then falls back to the rule-based engine. */
export async function resolveRecommendation(
  input: ResolveRecommendationInput,
): Promise<RecommendationEngineResult> {
  const [config, catalogPolicy] = await Promise.all([getAiAgentConfig(), getCatalogPolicyConfig()]);
  const minorAllowedCategories = catalogPolicy.minorAllowedCategories;

  const userContext = await loadUserRecommendationContext(input.profileId, config.historyLimit);
  const avoidIds = avoidIdsForMood(userContext.avoidPairingsByMood, input.mood.key);

  if (config.enabled) {
    const aiResult = await getAiRecommendation({
      config,
      mood: input.mood,
      scores: input.scores,
      tasteLane: input.tasteLane,
      alcoholPolicy: input.alcoholPolicy,
      flavorProfile: input.flavorProfile,
      atmosphereProfile: input.atmosphereProfile,
      userContext,
      minorAllowedCategories,
    });

    if (aiResult) return aiResult;
  }

  return getRecommendationForMood({
    mood: input.mood,
    scores: input.scores,
    tasteLane: input.tasteLane,
    alcoholPolicy: input.alcoholPolicy,
    avoidIds,
    minorAllowedCategories,
  });
}
