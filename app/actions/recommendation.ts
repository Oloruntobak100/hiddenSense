"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfileId } from "@/lib/auth/current-profile";
import { refreshProfilePreferenceSummary } from "@/lib/intelligence/preference-summary";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function logRecommendationClick(moodResultId: string, recommendationId?: string | null) {
  const profileId = await getCurrentProfileId();
  if (!profileId) return { ok: false as const, error: "Not authenticated" };

  const sb = getSupabaseAdmin();
  const [{ error: clickErr }, { error: analyticsErr }] = await Promise.all([
    sb.from("recommendation_clicks").insert({
      mood_result_id: moodResultId,
      profile_id: profileId,
      recommendation_id: recommendationId ?? null,
      click_type: "checkout",
    }),
    sb
      .from("mood_analytics")
      .update({ recommendation_clicked: true, purchase_initiated: true })
      .eq("mood_result_id", moodResultId)
      .eq("profile_id", profileId),
  ]);

  if (clickErr || analyticsErr) {
    return { ok: false as const, error: clickErr?.message ?? analyticsErr?.message ?? "Failed to track click." };
  }
  void refreshProfilePreferenceSummary(profileId).catch((err) => console.error("[preference-summary]", err));
  revalidatePath("/result");
  return { ok: true as const };
}

export async function submitResultFeedback(moodResultId: string, response: "absolutely" | "close_enough" | "not_really") {
  const profileId = await getCurrentProfileId();
  if (!profileId) return { ok: false as const, error: "Not authenticated" };
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("feedback_responses").upsert(
    { mood_result_id: moodResultId, profile_id: profileId, response },
    { onConflict: "mood_result_id" },
  );
  if (error) return { ok: false as const, error: error.message };
  void refreshProfilePreferenceSummary(profileId).catch((err) => console.error("[preference-summary]", err));
  revalidatePath("/result");
  return { ok: true as const };
}
