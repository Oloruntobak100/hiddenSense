import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { LogoMark } from "@/components/brand/Logo";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { BackNavButton } from "@/components/navigation/BackNavButton";
import { DEMO_SESSION_ID } from "@/lib/session/constants";
import { getDemoResultPayload, isDemoSession } from "@/lib/session/demo";
import { getQuizSessionForProfile } from "@/lib/data/quiz-session";

export const dynamic = "force-dynamic";

export default async function FeedbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ sessionId }, qs] = await Promise.all([params, searchParams]);
  let moodName: string;

  if (sessionId === DEMO_SESSION_ID) {
    if (!(await isDemoSession())) {
      notFound();
    }
    const demo = await getDemoResultPayload();
    if (!demo) {
      notFound();
    }
    moodName = demo.mood_name;
  } else {
    const session = await getQuizSessionForProfile(sessionId);
    if (!session) {
      notFound();
    }
    moodName = session.mood_name;
  }

  const showErr = qs.error === "1";

  const resultHref = `/result/${sessionId}`;

  return (
    <main className="mx-auto min-h-[100dvh] max-w-lg px-6 py-12">
      <div className="mb-6 flex justify-start">
        <Suspense fallback={<div className="h-11 w-24 rounded-full bg-white/10" aria-hidden />}>
          <BackNavButton fallbackHref={resultHref} />
        </Suspense>
      </div>
      <div className="mb-8 flex justify-center">
        <LogoMark />
      </div>
      <h1 className="text-center font-[family-name:var(--font-serif)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Rate your pairing
      </h1>
      <p className="mt-2 text-center text-sm text-white/70">
        This feedback trains the next iteration of HiddenSense™.
      </p>

      <div className="mx-auto mt-10 rounded-[2rem] bg-[var(--hs-panel)] p-8 shadow-2xl shadow-black/40">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--hs-muted)]">Mood surfaced</p>
        <p className="font-[family-name:var(--font-serif)] text-xl text-[var(--hs-ink)]">{moodName}</p>

        {showErr ? (
          <p className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-800" role="alert">
            Something went wrong saving feedback. Double-check selections and retry.
          </p>
        ) : null}

        <div className="mt-8">
          <FeedbackForm sessionId={sessionId} />
        </div>
      </div>

      <p className="mt-10 text-center text-sm text-white/65">
        <Link href={resultHref} className="text-white/85 underline-offset-4 hover:text-white hover:underline">
          Back to result
        </Link>
      </p>
    </main>
  );
}
