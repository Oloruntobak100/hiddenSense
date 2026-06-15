import "server-only";

import OpenAI from "openai";
import { getOpenAiApiKey } from "@/lib/intelligence/ai-agent-config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { UserHistoryEntry } from "@/lib/intelligence/user-context";

function ruleBasedSummary(history: UserHistoryEntry[], existing: string | null): string {
  const lines: string[] = [];

  const loved = history.filter((h) => h.pairingFeedback === "absolutely");
  const disliked = history.filter((h) => h.pairingFeedback === "not_really");
  const clicked = history.filter((h) => h.clickedCheckout);

  if (loved.length) {
    const names = loved
      .slice(0, 3)
      .map((h) => h.drinkName)
      .filter(Boolean)
      .join(", ");
    if (names) lines.push(`Enjoyed pairings including: ${names}.`);
  }

  if (disliked.length) {
    const names = disliked
      .slice(0, 3)
      .map((h) => `${h.drinkName ?? "pairing"} (${h.moodName})`)
      .filter(Boolean)
      .join(", ");
    if (names) lines.push(`Disliked or rejected for specific moods: ${names}.`);
  }

  if (clicked.length) {
    const names = clicked
      .slice(0, 2)
      .map((h) => h.drinkName)
      .filter(Boolean)
      .join(", ");
    if (names) lines.push(`Clicked checkout for: ${names}.`);
  }

  const moodCounts = new Map<string, number>();
  for (const h of history) {
    moodCounts.set(h.moodName, (moodCounts.get(h.moodName) ?? 0) + 1);
  }
  const topMood = [...moodCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topMood) lines.push(`Often arrives in a "${topMood[0]}" mood.`);

  const generated = lines.join(" ").trim();
  if (!generated) return existing?.trim() ?? "";
  if (existing?.trim()) return `${existing.trim()} ${generated}`.slice(0, 2000);
  return generated.slice(0, 2000);
}

export async function refreshProfilePreferenceSummary(profileId: string): Promise<void> {
  const sb = getSupabaseAdmin();

  const { data: profile } = await sb
    .from("profiles")
    .select("ai_preference_summary")
    .eq("id", profileId)
    .maybeSingle();

  const { data: moodResults } = await sb
    .from("mood_results")
    .select("id, quiz_session_id, mood_key, mood_name, recommendation_id, recommendation_payload, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(12);

  if (!moodResults?.length) return;

  const moodResultIds = moodResults.map((r) => r.id);
  const sessionIds = moodResults.map((r) => r.quiz_session_id);

  const [{ data: pairingFeedback }, { data: sessionFeedback }, { data: clicks }] = await Promise.all([
    sb.from("feedback_responses").select("mood_result_id, response").in("mood_result_id", moodResultIds),
    sb.from("feedback").select("quiz_session_id, mood_accurate, rating, comment").in("quiz_session_id", sessionIds),
    sb.from("recommendation_clicks").select("mood_result_id").in("mood_result_id", moodResultIds),
  ]);

  const feedbackByResult = new Map((pairingFeedback ?? []).map((f) => [f.mood_result_id, f.response]));
  const feedbackBySession = new Map((sessionFeedback ?? []).map((f) => [f.quiz_session_id, f]));
  const clickedResults = new Set((clicks ?? []).map((c) => c.mood_result_id));

  const history: UserHistoryEntry[] = moodResults.map((mr) => {
    const payload = mr.recommendation_payload;
    let drinkName: string | null = null;
    if (payload && typeof payload === "object") {
      const name = (payload as Record<string, unknown>).cocktailName;
      drinkName = typeof name === "string" && name.trim() ? name.trim() : null;
    }
    const sessionFb = feedbackBySession.get(mr.quiz_session_id);
    return {
      date: mr.created_at,
      moodKey: mr.mood_key,
      moodName: mr.mood_name,
      drinkName,
      foodName: null,
      recommendationId: mr.recommendation_id,
      pairingFeedback: (feedbackByResult.get(mr.id) as UserHistoryEntry["pairingFeedback"]) ?? null,
      moodAccurate: sessionFb?.mood_accurate ?? null,
      rating: sessionFb?.rating ?? null,
      comment: sessionFb?.comment ?? null,
      clickedCheckout: clickedResults.has(mr.id),
    };
  });

  const apiKey = getOpenAiApiKey();
  let summary: string;

  if (apiKey) {
    try {
      const client = new OpenAI({ apiKey });
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Summarize this guest's drink/food preferences for a recommendation agent. Output JSON: { \"summary\": \"2-4 concise sentences\" }. Mention likes, dislikes, moods, and checkout behavior. No marketing fluff.",
          },
          {
            role: "user",
            content: JSON.stringify({
              existing_summary: profile?.ai_preference_summary ?? null,
              history,
            }),
          },
        ],
      });
      const raw = completion.choices[0]?.message?.content;
      if (raw) {
        const parsed = JSON.parse(raw) as { summary?: string };
        if (typeof parsed.summary === "string" && parsed.summary.trim()) {
          summary = parsed.summary.trim().slice(0, 2000);
        } else {
          summary = ruleBasedSummary(history, profile?.ai_preference_summary ?? null);
        }
      } else {
        summary = ruleBasedSummary(history, profile?.ai_preference_summary ?? null);
      }
    } catch {
      summary = ruleBasedSummary(history, profile?.ai_preference_summary ?? null);
    }
  } else {
    summary = ruleBasedSummary(history, profile?.ai_preference_summary ?? null);
  }

  if (!summary.trim()) return;

  await sb.from("profiles").update({ ai_preference_summary: summary }).eq("id", profileId);
}
