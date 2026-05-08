"use client";

import { useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { submitQuiz } from "@/app/actions/quiz";
import type { AnswerLetter, QuizAnswers } from "@/lib/mood/types";

type SectionId = "energy" | "social" | "flavor";
type ScaleValue = -2 | -1 | 0 | 1 | 2;

type MoodQuestion = {
  id: string;
  section: SectionId;
  prompt: string;
  left: string;
  right: string;
};

const QUESTIONS: MoodQuestion[] = [
  { id: "m1", section: "energy", prompt: "What’s your pace tonight?", left: "Quiet Reset", right: "Full Energy" },
  { id: "m2", section: "energy", prompt: "What’s sitting with you right now?", left: "Pressure", right: "Lightness" },
  { id: "m3", section: "energy", prompt: "How loud is your mind tonight?", left: "Heavy & Foggy", right: "Sharp & Clear" },
  { id: "m4", section: "social", prompt: "How social does tonight feel?", left: "Keep to Myself", right: "Outside Energy" },
  { id: "m5", section: "social", prompt: "What do you need most tonight?", left: "Escape", right: "Experience" },
  { id: "m6", section: "flavor", prompt: "What kind of experience sounds best?", left: "Deep & Smooth", right: "Crisp & Refreshing" },
  { id: "m7", section: "flavor", prompt: "Pick the atmosphere that feels closest.", left: "Candlelight & Quiet", right: "Neon Night Energy" },
];

const SECTIONS: Record<SectionId, { title: string; subtitle: string }> = {
  energy: { title: "Read Your Energy", subtitle: "Calibrating your emotional rhythm." },
  social: { title: "Understand Your Vibe", subtitle: "Tuning social intent and mood direction." },
  flavor: { title: "Reveal Your Pairing", subtitle: "Mapping sensory preference and atmosphere." },
};

const SCALE: ScaleValue[] = [-2, -1, 0, 1, 2];

const CARD_STEPS = [
  {
    step: "Step 1",
    title: "Read Your Energy",
    body: "Answer a few fast prompts designed to understand your current emotional rhythm.",
  },
  {
    step: "Step 2",
    title: "Reveal Your Pairing",
    body: "HiddenSense™ matches your mood to a curated cocktail and food experience.",
  },
  {
    step: "Step 3",
    title: "Set the Tone",
    body: "Order your recommendation, explore your vibe, and help HiddenSense™ learn your preferences.",
  },
] as const;

export function QuizFlow() {
  const [stage, setStage] = useState<"overview" | "questions">("overview");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ScaleValue>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const current = QUESTIONS[index];
  const sectionMeta = SECTIONS[current.section];
  const activeSection = current.section;

  const sectionQuestionIndexes = useMemo(
    () => QUESTIONS.map((q, i) => ({ i, section: q.section })).filter((x) => x.section === activeSection).map((x) => x.i),
    [activeSection],
  );
  const sectionEnd = sectionQuestionIndexes[sectionQuestionIndexes.length - 1];
  const isSectionEnd = index === sectionEnd;
  const isFinalQuestion = index === QUESTIONS.length - 1;
  const selected = answers[current.id];

  const handleSelect = (value: ScaleValue) => {
    if (pending) return;
    setError(null);
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const goNext = () => {
    if (selected === undefined || pending) return;
    if (!isSectionEnd) {
      setIndex((i) => i + 1);
      return;
    }
    if (isFinalQuestion) {
      submitMoodCalibration();
      return;
    }
    setIndex((i) => i + 1);
  };

  const submitMoodCalibration = () => {
    const payload = buildQuizPayload(answers);
    if (!payload) {
      setError("Complete each mood prompt to continue.");
      return;
    }
    startTransition(() => {
      void (async () => {
        try {
          const result = await submitQuiz(payload);
          if (result.ok === false) {
            setError(result.error);
          }
        } catch {
          // redirect interrupts
        }
      })();
    });
  };

  return (
    <div className="relative z-10 min-h-[100dvh] px-5 py-8 sm:px-8">
      <AnimatePresence mode="wait">
        {stage === "overview" ? (
          <motion.section
            key="overview"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col justify-center pb-10 pt-16"
          >
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-[family-name:var(--font-serif)] text-[clamp(1.7rem,6vw,3rem)] font-semibold tracking-tight text-white">
                Read your energy before the night begins.
              </p>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-white/70 sm:text-base">
                This is a cinematic mood calibration, not a survey. A few intentional prompts and HiddenSense™ tunes your
                pairing.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {CARD_STEPS.map((card, i) => (
                <motion.article
                  key={card.step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 * i }}
                  className="rounded-2xl border border-white/15 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--hs-accent)]">{card.step}</p>
                  <h3 className="mt-3 font-[family-name:var(--font-serif)] text-xl font-semibold text-white">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{card.body}</p>
                </motion.article>
              ))}
            </div>

            <div className="mt-11 flex justify-center">
              <button
                type="button"
                onClick={() => setStage("questions")}
                className="rounded-2xl bg-gradient-to-r from-[var(--hs-accent-strong)] to-[var(--hs-accent)] px-10 py-3.5 text-[15px] font-semibold text-white shadow-[0_18px_40px_-18px_rgba(124,58,237,0.8)] transition hover:brightness-110"
              >
                Start Mood Calibration
              </button>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="questions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col justify-center pb-8 pt-10"
          >
            <header className="mb-9 text-center">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">{sectionMeta.title}</p>
              <p className="mt-2 text-sm text-white/65">{sectionMeta.subtitle}</p>
              <div className="mt-4 flex justify-center gap-2">
                {QUESTIONS.map((q, i) => (
                  <span
                    key={q.id}
                    className={`h-1.5 w-8 rounded-full transition ${
                      i <= index ? "bg-white/80" : "bg-white/20"
                    } ${q.section === activeSection ? "opacity-100" : "opacity-65"}`}
                  />
                ))}
              </div>
            </header>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="rounded-3xl border border-white/12 bg-white/[0.03] px-5 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm sm:px-8"
              >
                <p className="mx-auto max-w-2xl text-balance text-center font-[family-name:var(--font-serif)] text-[clamp(1.35rem,4.3vw,2.2rem)] font-semibold leading-[1.2] text-white">
                  {current.prompt}
                </p>

                <div className="mx-auto mt-10 max-w-xl">
                  <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.12em] text-white/58 sm:text-sm sm:tracking-[0.16em]">
                    <span>{current.left}</span>
                    <span>{current.right}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-3 sm:gap-5">
                    {SCALE.map((value, i) => {
                      const isActive = selected === value;
                      const size = i === 0 || i === 4 ? "h-14 w-14" : i === 2 ? "h-10 w-10" : "h-12 w-12";
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleSelect(value)}
                          disabled={pending}
                          className={`mx-auto rounded-full border transition duration-200 ${size} ${
                            isActive
                              ? "border-white bg-white/20 shadow-[0_0_0_7px_rgba(255,255,255,0.08),0_0_20px_rgba(124,58,237,0.45)]"
                              : "border-white/40 bg-transparent hover:border-white/70"
                          }`}
                          aria-label={`Select intensity ${value}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {error ? (
              <p className="mx-auto mt-4 w-full max-w-xl rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-2.5 text-sm text-red-100">
                {error}
              </p>
            ) : null}

            <div className="mt-8 flex items-center justify-center">
              <button
                type="button"
                onClick={goNext}
                disabled={selected === undefined || pending}
                className="rounded-2xl border border-white/22 bg-white/[0.04] px-9 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {pending ? "Revealing your pairing…" : isFinalQuestion ? "Reveal My Pairing" : isSectionEnd ? "Next Section" : "Continue"}
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function buildQuizPayload(answers: Record<string, ScaleValue>): QuizAnswers | null {
  const required = QUESTIONS.every((q) => typeof answers[q.id] === "number");
  if (!required) return null;

  const energy = toLetterRightPositive(answers.m1);
  const emotion = toLetterRightPositiveInvertedABC(answers.m2);
  const social = toLetterRightPositiveInvertedABC(answers.m4);
  const mental = toLetterRightPositiveInvertedABC(answers.m3);

  const intentComposite = average([answers.m5, answers.m6, answers.m7]);
  const intent = toLetterRightPositiveInvertedABC(intentComposite);

  return {
    q1: energy,
    q2: emotion,
    q3: social,
    q4: mental,
    q5: intent,
  };
}

function average(values: number[]) {
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}

function toLetterRightPositive(value: number): AnswerLetter {
  if (value <= -0.7) return "A";
  if (value >= 0.7) return "C";
  return "B";
}

// For dimensions where A represents "right/positive" and C "left/negative"
function toLetterRightPositiveInvertedABC(value: number): AnswerLetter {
  if (value <= -0.7) return "C";
  if (value >= 0.7) return "A";
  return "B";
}
