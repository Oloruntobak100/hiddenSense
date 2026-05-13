"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { DEMO_SESSION_ID } from "@/lib/session/constants";
import { getQuizSessionForProfile } from "@/lib/data/quiz-session";
import { getCurrentProfileId } from "@/lib/auth/current-profile";
import {
  getDemoResultPayload,
  isDemoSession,
} from "@/lib/session/demo";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const FeedbackSchema = z.object({
  moodAccurate: z.enum(["yes", "no"]),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z
    .string()
    .max(2000)
    .transform((s) => {
      const trimmed = s.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }),
});

export async function submitFeedback(sessionId: string, formData: FormData) {
  const profileId = await getCurrentProfileId();
  if (!profileId) {
    redirect("/login");
  }

  if (sessionId === DEMO_SESSION_ID) {
    if (!(await isDemoSession())) {
      redirect("/login");
    }
    if (!(await getDemoResultPayload())) {
      redirect("/quiz");
    }

    const parsed = FeedbackSchema.safeParse({
      moodAccurate: formData.get("moodAccurate"),
      rating: formData.get("rating"),
      comment: formData.get("comment") ?? "",
    });

    if (!parsed.success) {
      redirect(`/feedback/${sessionId}?error=1`);
    }

    redirect("/thanks");
  }

  const session = await getQuizSessionForProfile(sessionId);
  if (!session) {
    redirect("/quiz");
  }

  const parsed = FeedbackSchema.safeParse({
    moodAccurate: formData.get("moodAccurate"),
    rating: formData.get("rating"),
    comment: formData.get("comment") ?? "",
  });

  if (!parsed.success) {
    redirect(`/feedback/${sessionId}?error=1`);
  }

  const sb = getSupabaseAdmin();
  const { error } = await sb.from("feedback").upsert(
    {
      quiz_session_id: sessionId,
      mood_accurate: parsed.data.moodAccurate === "yes",
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
    },
    { onConflict: "quiz_session_id" },
  );

  if (error) {
    console.error(error);
    redirect(`/feedback/${sessionId}?error=1`);
  }

  redirect("/thanks");
}
