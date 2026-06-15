import "server-only";

import OpenAI from "openai";
import { z } from "zod";
import type { AiAgentConfig } from "@/lib/intelligence/ai-agent-config";
import { getOpenAiApiKey } from "@/lib/intelligence/ai-agent-config";
import {
  listingRowToRecommendationResult,
  loadCatalogCandidates,
  type CatalogCandidate,
} from "@/lib/intelligence/catalog-candidates";
import type { MoodArchetype } from "@/lib/intelligence/mood-archetypes";
import type {
  AlcoholPolicy,
  RecommendationEngineResult,
} from "@/lib/intelligence/recommendation-engine";
import type { EmotionalScores } from "@/lib/intelligence/scoring";
import type { TasteLane } from "@/lib/intelligence/taste-lane";
import type { UserRecommendationContext } from "@/lib/intelligence/user-context";

const AiPickSchema = z.object({
  recommendation_id: z.string().uuid(),
  emotional_reasoning: z.string().min(20).max(1200),
});

export type AiRecommendationInput = {
  config: AiAgentConfig;
  mood: MoodArchetype;
  scores: EmotionalScores;
  tasteLane: TasteLane;
  alcoholPolicy: AlcoholPolicy;
  flavorProfile: string;
  atmosphereProfile: string;
  userContext: UserRecommendationContext;
};

function buildUserMessage(input: AiRecommendationInput, candidates: CatalogCandidate[]) {
  return JSON.stringify(
    {
      current_session: {
        mood_key: input.mood.key,
        mood_name: input.mood.name,
        mood_description: input.mood.emotional_description,
        flavor_profile: input.flavorProfile,
        atmosphere_profile: input.atmosphereProfile,
        taste_lane: input.tasteLane,
        alcohol_policy: input.alcoholPolicy,
        emotional_scores: input.scores,
      },
      preference_summary: input.userContext.preferenceSummary,
      user_history: input.userContext.history,
      avoid_recommendation_ids: input.userContext.avoidRecommendationIds,
      catalog_candidates: candidates,
      required_response_schema: {
        recommendation_id: "uuid from catalog_candidates.recommendationId",
        emotional_reasoning: "2-4 sentences, second person, warm tone",
      },
    },
    null,
    2,
  );
}

export async function getAiRecommendation(
  input: AiRecommendationInput,
): Promise<RecommendationEngineResult | null> {
  const apiKey = getOpenAiApiKey();
  if (!apiKey || !input.config.enabled) return null;

  const { candidates, rowsById } = await loadCatalogCandidates({
    tasteLane: input.tasteLane,
    alcoholPolicy: input.alcoholPolicy,
    maxCandidates: input.config.maxCandidates,
    avoidIds: input.userContext.avoidRecommendationIds,
  });

  if (!candidates.length) return null;

  const client = new OpenAI({ apiKey });
  const userMessage = buildUserMessage(input, candidates);

  try {
    const completion = await client.chat.completions.create({
      model: input.config.model,
      temperature: input.config.temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: input.config.systemPrompt },
        {
          role: "user",
          content: `Recommend one pairing for this user. Respond with JSON only.\n\n${userMessage}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;

    const parsed = AiPickSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;

    const row = rowsById.get(parsed.data.recommendation_id);
    if (!row) return null;

    const alternatePool = [...rowsById.values()].filter((r) => r.id !== row.id);
    return listingRowToRecommendationResult(
      row,
      alternatePool,
      parsed.data.emotional_reasoning.trim(),
      input.tasteLane,
    );
  } catch (err) {
    console.error("[ai-recommendation]", err);
    return null;
  }
}
