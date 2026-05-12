import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { LogoMark } from "@/components/brand/Logo";
import { MoodAccuracyFeedback } from "@/components/feedback/MoodAccuracyFeedback";
import { BackNavButton } from "@/components/navigation/BackNavButton";
import { DEMO_SESSION_ID } from "@/lib/session/constants";
import { getQuizSessionForProfile } from "@/lib/data/quiz-session";
import { getCurrentProfileId } from "@/lib/auth/current-profile";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function MoodFeedbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ moodResultId?: string }>;
}) {
  const [{ sessionId }, qs] = await Promise.all([params, searchParams]);
  const profileId = await getCurrentProfileId();
  if (!profileId) {
    notFound();
  }

  if (sessionId === DEMO_SESSION_ID) {
    notFound();
  }

  const session = await getQuizSessionForProfile(sessionId);
  if (!session) {
    notFound();
  }

  let moodResultId: string | null = qs.moodResultId ?? null;
  if (!moodResultId) {
    const sb = getSupabaseAdmin();
    const { data } = await sb
      .from("mood_results")
      .select("id")
      .eq("quiz_session_id", sessionId)
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    moodResultId = data?.id ?? null;
  }

  if (!moodResultId) {
    notFound();
  }

  const resultReturnHref = `/result/${sessionId}?moodResultId=${encodeURIComponent(moodResultId)}`;

  return (
    <main className="relative z-10 mx-auto min-h-[100dvh] max-w-2xl px-6 py-12 pb-24 text-white">
      <div className="mb-6 flex justify-start">
        <Suspense fallback={<div className="h-11 w-24 rounded-full bg-white/10" aria-hidden />}>
          <BackNavButton fallbackHref={resultReturnHref} />
        </Suspense>
      </div>
      <div className="mb-8 flex justify-center">
        <LogoMark />
      </div>
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Quick pulse</p>
      <h1 className="mt-2 text-center font-[family-name:var(--font-serif)] text-3xl font-semibold tracking-tight sm:text-4xl">
        Mood check-in
      </h1>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-white/60">
        You surfaced as <span className="font-medium text-white/90">{session.mood_name}</span>. One tap helps HiddenSense™
        learn.
      </p>

      <div className="mx-auto mt-12 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-10">
        <MoodAccuracyFeedback moodResultId={moodResultId} sessionId={sessionId} />
      </div>

      <p className="mt-10 text-center text-sm text-white/65">
        <Link href={resultReturnHref} className="text-white/85 underline-offset-4 hover:text-white hover:underline">
          Back to result
        </Link>
      </p>
    </main>
  );
}
