import "server-only";
import { getCurrentProfileId } from "@/lib/auth/current-profile";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type MyResultItem = {
  sessionId: string;
  moodResultId: string | null;
  moodName: string;
  moodKey: string;
  cocktailName: string | null;
  confidenceScore: number;
  createdAt: string;
};

function cocktailFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const name = (payload as { cocktailName?: unknown }).cocktailName;
  return typeof name === "string" && name.trim() ? name.trim() : null;
}

export async function listMyResults(): Promise<MyResultItem[]> {
  const profileId = await getCurrentProfileId();
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
    .select("id, quiz_session_id, recommendation_payload, confidence_score")
    .eq("profile_id", profileId)
    .in("quiz_session_id", sessionIds);

  const bySession = new Map(
    (moodResults ?? []).map((r) => [r.quiz_session_id, r]),
  );

  return sessions.map((s) => {
    const mr = bySession.get(s.id);
    return {
      sessionId: s.id,
      moodResultId: mr?.id ?? null,
      moodName: s.mood_name,
      moodKey: s.mood_key,
      cocktailName: cocktailFromPayload(mr?.recommendation_payload) ?? null,
      confidenceScore: mr ? Number(mr.confidence_score) : s.confidence_score,
      createdAt: s.created_at,
    };
  });
}
