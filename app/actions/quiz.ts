"use server";

import { redirect } from "next/navigation";
import { getCurrentProfileId } from "@/lib/auth/current-profile";
import {
  isDemoSession,
  setDemoResultPayload,
} from "@/lib/session/demo";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import { resolveMood } from "@/lib/mood/engine";
import type { QuizAnswers } from "@/lib/mood/types";
import { parseAnswerLetter } from "@/lib/mood/maps";

export type QuizActionState = { ok: false; error: string };

export async function submitQuiz(answersRaw: QuizAnswers): Promise<QuizActionState> {
  const profileId = await getCurrentProfileId();
  if (!profileId) {
    return { ok: false, error: "Session expired — unlock again." };
  }

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

  if (await isDemoSession()) {
    await setDemoResultPayload({
      mood_key: mood.mood_key,
      mood_name: mood.mood_name,
      confidence_score: mood.confidence_score,
    });
    redirect("/result/demo");
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("quiz_sessions")
    .insert({
      profile_id: profileId,
      answers: answers as unknown as Json,
      attribute_profile: mood.attribute_profile as unknown as Json,
      mood_key: mood.mood_key,
      mood_name: mood.mood_name,
      confidence_score: mood.confidence_score,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error(error);
    return { ok: false, error: "Could not save quiz — check Supabase." };
  }

  redirect(`/result/${data.id}`);
}
