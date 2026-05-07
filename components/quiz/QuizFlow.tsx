"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { submitQuiz } from "@/app/actions/quiz";
import { QUIZ_QUESTIONS } from "@/lib/mood/questions";
import type { AnswerLetter, QuizAnswers } from "@/lib/mood/types";
import { ProgressBar } from "@/components/ui/ProgressBar";

const INITIAL: Partial<QuizAnswers> = {};

const accentRotate = ["#6366f1", "#a855f7", "#ea580c", "#0284c7", "#7c3aed"] as const;

export function QuizFlow() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const q = QUIZ_QUESTIONS[step];
  const progressPct = Math.round(((step + 1) / QUIZ_QUESTIONS.length) * 100);

  const handlePick = (letter: AnswerLetter) => {
    setError(null);
    const next = { ...answers, [q.id]: letter } as Partial<QuizAnswers>;
    setAnswers(next);

    if (step < QUIZ_QUESTIONS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    const complete = next as QuizAnswers;
    startTransition(() => {
      void (async () => {
        try {
          const result = await submitQuiz(complete);
          if (result.ok === false) {
            setError(result.error);
          }
        } catch {
          // redirect() interrupts the action
        }
      })();
    });
  };

  const accentStyle = {
    "--hs-accent": accentRotate[step % accentRotate.length],
  } as CSSProperties;

  return (
    <div
      style={accentStyle}
      className="relative z-10 flex min-h-[100dvh] flex-col gap-8 px-5 pb-10 pt-14 sm:mx-auto sm:max-w-lg"
    >
      <header className="space-y-4">
        <p className="font-[family-name:var(--font-serif)] text-3xl font-semibold tracking-tight text-[var(--hs-accent)] sm:text-4xl">
          Taste Builder
        </p>
        <p className="text-sm leading-relaxed text-[var(--hs-muted)]">
          {q.prompt}
        </p>
        <ProgressBar value={progressPct} />
        <p className="text-xs text-[var(--hs-muted)]">
          Step {step + 1} / {QUIZ_QUESTIONS.length}
        </p>
      </header>

      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid flex-1 gap-4">
        {q.options.map((opt) => (
          <button
            key={opt.letter}
            type="button"
            disabled={pending}
            aria-label={`${opt.label}: ${opt.sublabel}`}
            onClick={() => handlePick(opt.letter)}
            className="group flex flex-row items-center gap-4 rounded-3xl border border-black/10 bg-white p-4 text-left shadow-sm motion-safe:transition motion-safe:active:scale-[0.98] hover:border-[var(--hs-accent)]/40 disabled:opacity-60 sm:gap-5 sm:p-5"
          >
            <span
              className="flex h-[3.25rem] w-[3.25rem] shrink-0 select-none items-center justify-center rounded-2xl bg-gradient-to-br from-black/[0.05] to-black/[0.02] text-[1.85rem] leading-none shadow-inner group-hover:from-[var(--hs-accent)]/10 group-hover:to-[var(--hs-accent)]/5 sm:h-16 sm:w-16 sm:text-[2rem]"
              aria-hidden
            >
              {opt.emoji}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-lg font-semibold text-[var(--hs-ink)]">{opt.label}</span>
              <span className="text-sm text-[var(--hs-muted)]">{opt.sublabel}</span>
            </span>
          </button>
        ))}
      </div>

      {pending ? (
        <p className="text-center text-sm text-[var(--hs-muted)]">Finding your pairing…</p>
      ) : null}
    </div>
  );
}
