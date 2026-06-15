import "server-only";

import { avoidIdsForMood } from "@/lib/intelligence/mood-avoid";
import type { MoodScopedAvoid } from "@/lib/intelligence/mood-avoid";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type { MoodScopedAvoid };
export { avoidIdsForMood };

export type UserHistoryEntry = {
  date: string;
  moodKey: string;
  moodName: string;
  drinkName: string | null;
  foodName: string | null;
  recommendationId: string | null;
  pairingFeedback: "absolutely" | "close_enough" | "not_really" | null;
  moodAccurate: boolean | null;
  rating: number | null;
  comment: string | null;
  clickedCheckout: boolean;
};

export type UserRecommendationContext = {
  preferenceSummary: string | null;
  history: UserHistoryEntry[];
  /** Dislikes tied to the mood they occurred in — not global bans. */
  avoidPairingsByMood: MoodScopedAvoid[];
};

function nameFromPayload(payload: unknown, key: "cocktailName" | "foodName"): string | null {
  if (!payload || typeof payload !== "object") return null;
  const name = (payload as Record<string, unknown>)[key];
  return typeof name === "string" && name.trim() ? name.trim() : null;
}

export async function loadUserRecommendationContext(
  profileId: string,
  historyLimit: number,
): Promise<UserRecommendationContext> {
  const sb = getSupabaseAdmin();

  const [{ data: profile }, { data: moodResults }] = await Promise.all([
    sb.from("profiles").select("ai_preference_summary").eq("id", profileId).maybeSingle(),
    sb
      .from("mood_results")
      .select(
        "id, quiz_session_id, mood_key, mood_name, recommendation_id, recommendation_payload, created_at",
      )
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(historyLimit),
  ]);

  if (!moodResults?.length) {
    return {
      preferenceSummary: profile?.ai_preference_summary ?? null,
      history: [],
      avoidPairingsByMood: [],
    };
  }

  const moodResultIds = moodResults.map((r) => r.id);
  const sessionIds = moodResults.map((r) => r.quiz_session_id);

  const [{ data: pairingFeedback }, { data: sessionFeedback }, { data: clicks }] = await Promise.all([
    sb.from("feedback_responses").select("mood_result_id, response").in("mood_result_id", moodResultIds),
    sb.from("feedback").select("quiz_session_id, mood_accurate, rating, comment").in("quiz_session_id", sessionIds),
    sb.from("recommendation_clicks").select("mood_result_id").in("mood_result_id", moodResultIds),
  ]);

  const feedbackByResult = new Map(
    (pairingFeedback ?? []).map((f) => [f.mood_result_id, f.response as UserHistoryEntry["pairingFeedback"]]),
  );
  const feedbackBySession = new Map((sessionFeedback ?? []).map((f) => [f.quiz_session_id, f]));
  const clickedResults = new Set((clicks ?? []).map((c) => c.mood_result_id));

  const recommendationIds = [
    ...new Set(
      moodResults
        .map((r) => r.recommendation_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  ];

  const listingById = new Map<string, { cocktail_name: string; food_name: string | null }>();
  if (recommendationIds.length > 0) {
    const { data: listings } = await sb
      .from("cocktail_recommendations")
      .select("id, cocktail_name, food_name")
      .in("id", recommendationIds);
    for (const row of listings ?? []) {
      listingById.set(row.id, { cocktail_name: row.cocktail_name, food_name: row.food_name });
    }
  }

  const history: UserHistoryEntry[] = moodResults.map((mr) => {
    const payload = mr.recommendation_payload;
    let drinkName = nameFromPayload(payload, "cocktailName");
    let foodName = nameFromPayload(payload, "foodName");

    if (mr.recommendation_id) {
      const listing = listingById.get(mr.recommendation_id);
      if (listing) {
        if (!drinkName && listing.cocktail_name.trim()) drinkName = listing.cocktail_name.trim();
        if (!foodName && listing.food_name?.trim()) foodName = listing.food_name.trim();
      }
    }

    if (!foodName && payload && typeof payload === "object") {
      const pairings = (payload as { foodPairings?: unknown }).foodPairings;
      if (Array.isArray(pairings)) {
        const first = pairings.find((x) => typeof x === "string" && x.trim());
        if (typeof first === "string") foodName = first.trim();
      }
    }

    const sessionFb = feedbackBySession.get(mr.quiz_session_id);

    return {
      date: mr.created_at,
      moodKey: mr.mood_key,
      moodName: mr.mood_name,
      drinkName,
      foodName,
      recommendationId: mr.recommendation_id,
      pairingFeedback: feedbackByResult.get(mr.id) ?? null,
      moodAccurate: sessionFb?.mood_accurate ?? null,
      rating: sessionFb?.rating ?? null,
      comment: sessionFb?.comment ?? null,
      clickedCheckout: clickedResults.has(mr.id),
    };
  });

  const avoidPairingsByMood: MoodScopedAvoid[] = history
    .filter((h) => h.pairingFeedback === "not_really" && h.recommendationId)
    .map((h) => ({
      moodKey: h.moodKey,
      moodName: h.moodName,
      recommendationId: h.recommendationId as string,
      drinkName: h.drinkName,
      foodName: h.foodName,
    }));

  return {
    preferenceSummary: profile?.ai_preference_summary ?? null,
    history,
    avoidPairingsByMood,
  };
}
