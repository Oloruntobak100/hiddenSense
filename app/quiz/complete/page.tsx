"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { submitQuiz } from "@/app/actions/quiz";
import { PENDING_QUIZ_STORAGE_KEY, type PendingQuizV1 } from "@/lib/quiz/pending-quiz";

export default function QuizCompletePage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void Promise.resolve().then(() => {
      const raw = localStorage.getItem(PENDING_QUIZ_STORAGE_KEY);
      if (!raw) {
        setError("No saved quiz found. Retake the quiz from the home page.");
        return;
      }

      let parsed: PendingQuizV1;
      try {
        parsed = JSON.parse(raw) as PendingQuizV1;
        if (parsed.v !== 1 || !parsed.legacyAnswers) throw new Error("bad");
      } catch {
        setError("Saved quiz data is invalid. Retake the quiz.");
        return;
      }

      startTransition(() => {
        void (async () => {
          try {
            const res = await submitQuiz({
              legacyAnswers: parsed.legacyAnswers,
              calibrationAnswers: parsed.calibrationAnswers,
              tasteLane: parsed.tasteLane,
              sessionDurationSeconds: parsed.sessionDurationSeconds,
            });
            if (res && res.ok === false) {
              setError(res.error);
              return;
            }
            localStorage.removeItem(PENDING_QUIZ_STORAGE_KEY);
          } catch {
            /* redirect from server action */
          }
        })();
      });
    });
  }, []);

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-6 py-16 text-white">
      <h1 className="font-[family-name:var(--font-serif)] text-2xl font-semibold">Finishing your pairing…</h1>
      {error ? (
        <>
          <p className="mt-4 text-sm text-red-200">{error}</p>
          <Link href="/quiz" className="mt-8 text-sm text-[var(--hs-accent)] underline-offset-2 hover:underline">
            Back to quiz
          </Link>
        </>
      ) : (
        <p className="mt-4 text-sm text-white/70">{pending ? "Saving your mood and recommendation." : "Almost there…"}</p>
      )}
    </main>
  );
}
