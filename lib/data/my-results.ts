import "server-only";
import { ensureProfileId } from "@/lib/auth/ensure-profile";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type MyResultItem = {
  sessionId: string;
  moodResultId: string | null;
  moodName: string;
  moodKey: string;
  drinkName: string | null;
  foodName: string | null;
  confidenceScore: number;
  createdAt: string;
};

function nameFromPayload(payload: unknown, key: "cocktailName" | "foodName"): string | null {
  if (!payload || typeof payload !== "object") return null;
  const name = (payload as Record<string, unknown>)[key];
  return typeof name === "string" && name.trim() ? name.trim() : null;
}

export async function listMyResults(): Promise<MyResultItem[]> {
  const profileId = await ensureProfileId();
  if (!profileId) return [];

  const sb = getSupabaseAdmin();
  const { data: sessions, error } = await sb
    .from("quiz_sessions")
    .select("id, mood_key, mood_name, confidence_score, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !sessions?.length) return [];

  const sessionIds = sessions.map((s) => s.id);
  const { data: moodResults } = await sb
    .from("mood_results")
    .select("id, quiz_session_id, recommendation_id, recommendation_payload, confidence_score")
    .eq("profile_id", profileId)
    .in("quiz_session_id", sessionIds);

  const bySession = new Map(
    (moodResults ?? []).map((r) => [r.quiz_session_id, r]),
  );

  const recommendationIds = [
    ...new Set(
      (moodResults ?? [])
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
      listingById.set(row.id, {
        cocktail_name: row.cocktail_name,
        food_name: row.food_name,
      });
    }
  }

  return sessions.map((s) => {
    const mr = bySession.get(s.id);
    const payload = mr?.recommendation_payload;
    let drinkName = nameFromPayload(payload, "cocktailName");
    let foodName = nameFromPayload(payload, "foodName");

    if (mr?.recommendation_id) {
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

    return {
      sessionId: s.id,
      moodResultId: mr?.id ?? null,
      moodName: s.mood_name,
      moodKey: s.mood_key,
      drinkName,
      foodName,
      confidenceScore: mr ? Number(mr.confidence_score) : s.confidence_score,
      createdAt: s.created_at,
    };
  });
}
