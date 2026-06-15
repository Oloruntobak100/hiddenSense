"use server";

import { redirect } from "next/navigation";
import { getCurrentProfileId } from "@/lib/auth/current-profile";
import { getAgeAlcoholPolicy } from "@/lib/auth/age-consent-server";
import {
  isDemoSession,
  setDemoResultPayload,
} from "@/lib/session/demo";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import { resolveMood } from "@/lib/mood/engine";
import type { QuizAnswers } from "@/lib/mood/types";
import { parseAnswerLetter } from "@/lib/mood/maps";
import {
  calculateConfidenceScore,
  calculateMoodProfile,
  determineMoodType,
  generateAtmosphereProfile,
  generateFlavorProfile,
} from "@/lib/intelligence/scoring";
import { MOOD_ARCHETYPES } from "@/lib/intelligence/mood-archetypes";
import { resolveRecommendation } from "@/lib/intelligence/resolve-recommendation";
import type { TasteLane } from "@/lib/intelligence/taste-lane";

export type QuizActionState = { ok: false; error: string };

type SubmitQuizInput =
  | QuizAnswers
  | {
      legacyAnswers: QuizAnswers;
      calibrationAnswers?: Record<string, number>;
      tasteLane?: TasteLane;
      sessionDurationSeconds?: number;
    };

export async function submitQuiz(input: SubmitQuizInput): Promise<QuizActionState> {
  const profileId = await getCurrentProfileId();
  if (!profileId) {
    return { ok: false, error: "Session expired — unlock again." };
  }

  const answersRaw = "legacyAnswers" in input ? input.legacyAnswers : input;
  const calibrationAnswers = "legacyAnswers" in input ? input.calibrationAnswers ?? {} : {};
  const tasteLane = "legacyAnswers" in input ? input.tasteLane ?? "strawberry" : "strawberry";
  const sessionDurationSeconds = "legacyAnswers" in input ? input.sessionDurationSeconds ?? 0 : 0;

  const keys = ["q1", "q2", "q3", "q4", "q5"] as const;
  let answers: QuizAnswers;
  try {
    const next = {} as QuizAnswers;
    for (const key of keys) {
      const l = parseAnswerLetter(String(answersRaw[key]));
      if (!l) throw new Error("bad letter");
      next[key] = l;
    }
    answers = next;
  } catch {
    return { ok: false, error: "Complete every question." };
  }

  const mood = resolveMood(answers);
  const scoreProfile = calculateMoodProfile(calibrationAnswers);
  const moodMatch = determineMoodType(scoreProfile);
  const confidencePct = calculateConfidenceScore(scoreProfile, moodMatch.primary.mood, moodMatch.secondary?.mood);
  const chosenMood = moodMatch.primary?.mood ?? MOOD_ARCHETYPES.find((m) => m.key === mood.mood_key) ?? MOOD_ARCHETYPES[0];
  const alcoholPolicy = await getAgeAlcoholPolicy();
  const flavorProfile = generateFlavorProfile(scoreProfile);
  const atmosphereProfile = generateAtmosphereProfile(scoreProfile);
  const recommendation = await resolveRecommendation({
    profileId,
    mood: chosenMood,
    scores: scoreProfile,
    tasteLane,
    alcoholPolicy,
    flavorProfile,
    atmosphereProfile,
  });

  if (await isDemoSession()) {
    await setDemoResultPayload({
      mood_key: chosenMood.key,
      mood_name: chosenMood.name,
      confidence_score: Math.max(1, Math.round(confidencePct / 20)),
    });
    redirect("/result/demo");
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("quiz_sessions")
    .insert({
      profile_id: profileId,
      answers: { ...answers, calibration: calibrationAnswers } as unknown as Json,
      attribute_profile: {
        legacy: mood.attribute_profile,
        emotional_scores: scoreProfile,
        flavor_profile: flavorProfile,
        atmosphere_profile: atmosphereProfile,
        taste_lane: tasteLane,
        alcohol_policy: alcoholPolicy,
      } as unknown as Json,
      mood_key: chosenMood.key,
      mood_name: chosenMood.name,
      confidence_score: Math.max(1, Math.round(confidencePct / 20)),
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error(error);
    return { ok: false, error: "Could not save quiz — check Supabase." };
  }

  const moodResultPayload = {
    quiz_session_id: data.id,
    profile_id: profileId,
    mood_key: chosenMood.key,
    mood_name: chosenMood.name,
    confidence_score: confidencePct,
    secondary_mood_key: moodMatch.secondary?.mood.key ?? null,
    secondary_mood_name: moodMatch.secondary?.mood.name ?? null,
    emotional_profile: scoreProfile as unknown as Json,
    flavor_profile: flavorProfile,
    atmosphere_profile: atmosphereProfile,
    recommendation_source: recommendation.source,
    recommendation_id: recommendation.recommendationId,
    recommendation_payload: recommendation as unknown as Json,
    ai_reasoning: recommendation.emotionalReasoning,
  };

  const { data: moodResult, error: moodResultError } = await sb
    .from("mood_results")
    .insert(moodResultPayload)
    .select("id")
    .single();

  if (moodResultError) {
    console.error(moodResultError);
    redirect(`/result/${data.id}`);
  }

  const [analyticsRes, sessionRes] = await Promise.all([
    sb.from("mood_analytics").insert({
      mood_result_id: moodResult.id,
      profile_id: profileId,
      energy_score: scoreProfile.energy_score,
      emotional_weight: scoreProfile.emotional_weight,
      social_score: scoreProfile.social_score,
      mental_clarity: scoreProfile.mental_clarity,
      behavioral_intent: scoreProfile.behavioral_intent,
      flavor_preference: scoreProfile.flavor_preference,
      atmosphere_preference: scoreProfile.atmosphere_preference,
      recommendation_clicked: false,
      purchase_initiated: false,
    }),
    sb.from("user_sessions").insert({
      profile_id: profileId,
      route: "/quiz",
      session_duration_seconds: Math.max(0, Math.round(sessionDurationSeconds)),
    }),
  ]);

  if (analyticsRes.error || sessionRes.error) {
    console.error(analyticsRes.error ?? sessionRes.error);
  }

  if (moodResult.id) {
    redirect(`/result/${data.id}?moodResultId=${moodResult.id}`);
  }
  redirect(`/result/${data.id}`);
}
