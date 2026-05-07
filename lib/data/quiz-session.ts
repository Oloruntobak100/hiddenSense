import "server-only";
import { getCurrentProfileId } from "@/lib/auth/current-profile";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface QuizSessionRow {
  id: string;
  profile_id: string;
  answers: unknown;
  attribute_profile: unknown;
  mood_key: string;
  mood_name: string;
  confidence_score: number;
  created_at: string;
}

export async function getQuizSessionForProfile(
  sessionId: string,
): Promise<QuizSessionRow | null> {
  const profileId = await getCurrentProfileId();
  if (!profileId) return null;

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("quiz_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error || !data) return null;
  return data as QuizSessionRow;
}
