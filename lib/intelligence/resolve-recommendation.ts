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
import { loadUserRecommendationContext } from "@/lib/intelligence/user-context";

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
  const config = await getAiAgentConfig();

  if (config.enabled) {
    const userContext = await loadUserRecommendationContext(input.profileId, config.historyLimit);

    const aiResult = await getAiRecommendation({
      config,
      mood: input.mood,
      scores: input.scores,
      tasteLane: input.tasteLane,
      alcoholPolicy: input.alcoholPolicy,
      flavorProfile: input.flavorProfile,
      atmosphereProfile: input.atmosphereProfile,
      userContext,
    });

    if (aiResult) return aiResult;
  }

  return getRecommendationForMood({
    mood: input.mood,
    scores: input.scores,
    tasteLane: input.tasteLane,
    alcoholPolicy: input.alcoholPolicy,
  });
}
