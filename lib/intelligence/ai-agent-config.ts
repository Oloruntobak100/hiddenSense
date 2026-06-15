import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type AiAgentConfig = {
  enabled: boolean;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxCandidates: number;
  historyLimit: number;
};

export const DEFAULT_AI_SYSTEM_PROMPT = `You are HiddenSense's pairing recommendation agent for Hidden Spirits.

Select the best drink + food pairing from catalog_candidates for the user's current mood session.

You receive:
- current_session: mood, taste lane, emotional scores, alcohol policy
- user_history: past recommendations and feedback (pairing_feedback, mood accuracy, ratings, checkout clicks)
- preference_summary: rolling notes from prior visits
- avoid_pairings_by_mood: pairings rated "not_really" with the mood_key they occurred in
- avoid_for_current_mood_ids: listings to block for the current mood only

Rules:
1. ONLY pick a listing from catalog_candidates using its recommendation_id.
2. Do NOT select listings in avoid_for_current_mood_ids for the current mood.
3. A dislike in one mood does NOT ban that listing in other moods — check mood_key on avoid_pairings_by_mood.
4. Prefer flavors, moods, and categories that received "absolutely" or checkout clicks.
5. If user_history is empty, rely on current_session and catalog metadata only.
6. Write emotionalReasoning in warm, concise second-person voice (2–4 sentences).
7. Return valid JSON matching the required schema exactly.`;

type ConfigRow = {
  enabled: boolean;
  system_prompt: string;
  model: string;
  temperature: number;
  max_candidates: number;
  history_limit: number;
};

function rowToConfig(row: ConfigRow): AiAgentConfig {
  return {
    enabled: row.enabled,
    systemPrompt: row.system_prompt,
    model: row.model,
    temperature: Number(row.temperature),
    maxCandidates: row.max_candidates,
    historyLimit: row.history_limit,
  };
}

export function getOpenAiApiKey(): string | null {
  const key = process.env.OPENAI_API_KEY;
  return key && key.trim().length > 0 ? key.trim() : null;
}

export function isAiRecommendationAvailable(config: AiAgentConfig): boolean {
  return config.enabled && getOpenAiApiKey() !== null;
}

export async function getAiAgentConfig(): Promise<AiAgentConfig> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("ai_agent_config").select("*").eq("id", 1).maybeSingle();

  if (error || !data) {
    return {
      enabled: false,
      systemPrompt: DEFAULT_AI_SYSTEM_PROMPT,
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxCandidates: 20,
      historyLimit: 12,
    };
  }

  return rowToConfig(data as ConfigRow);
}

export async function saveAiAgentConfig(input: AiAgentConfig): Promise<{ ok: true } | { ok: false; error: string }> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("ai_agent_config").upsert(
    {
      id: 1,
      enabled: input.enabled,
      system_prompt: input.systemPrompt.trim(),
      model: input.model.trim() || "gpt-4o-mini",
      temperature: input.temperature,
      max_candidates: input.maxCandidates,
      history_limit: input.historyLimit,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
