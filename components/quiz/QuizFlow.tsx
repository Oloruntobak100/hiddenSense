"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { submitQuiz } from "@/app/actions/quiz";
import type { AnswerLetter, QuizAnswers } from "@/lib/mood/types";
import { deriveTasteLane, type TasteAnswers, type TasteOption } from "@/lib/intelligence/taste-lane";

type SectionId = "energy" | "social" | "flavor" | "taste";
type ScaleValue = -2 | -1 | 0 | 1 | 2;

type MoodQuestion = {
  kind: "mood";
  id: string;
  section: SectionId;
  prompt: string;
  left: string;
  right: string;
};

type TasteQuestion = {
  kind: "taste";
  id: string;
  section: SectionId;
  prompt: string;
  options: Array<{ key: TasteOption; text: string }>;
};

const QUESTIONS: MoodQuestion[] = [
  { kind: "mood", id: "m1", section: "energy", prompt: "How’s your energy right now?", left: "Low / Drained", right: "High / Energized" },
  { kind: "mood", id: "m2", section: "energy", prompt: "What best describes your mood?", left: "Heavy / Overwhelmed", right: "Light / Happy" },
  { kind: "mood", id: "m3", section: "energy", prompt: "How does your mind feel right now?", left: "Foggy / Tired", right: "Clear / Focused" },
  { kind: "mood", id: "m4", section: "social", prompt: "What are you in the mood for socially?", left: "Be Alone", right: "Be Around People" },
  { kind: "mood", id: "m5", section: "social", prompt: "Right now, what do you want most?", left: "Disconnect / Reset", right: "Go Out / Celebrate" },
  { kind: "mood", id: "m6", section: "flavor", prompt: "What flavor direction feels right tonight?", left: "Deep / Smooth", right: "Crisp / Refreshing" },
  { kind: "mood", id: "m7", section: "flavor", prompt: "What atmosphere matches your energy?", left: "Quiet / Candlelight", right: "Neon / High Energy" },
];

const TASTE_QUESTIONS: TasteQuestion[] = [
  {
    kind: "taste",
    id: "t1",
    section: "taste",
    prompt: "Which flavor hits hardest for you when you’re eating?",
    options: [
      { key: "A", text: "Bright, tangy, citrusy" },
      { key: "B", text: "Sweet, juicy, slightly candy-like" },
      { key: "C", text: "Warm, smooth, slightly spiced" },
    ],
  },
  {
    kind: "taste",
    id: "t2",
    section: "taste",
    prompt: "If you had to pick one, which would you reach for?",
    options: [
      { key: "A", text: "Lemon bar / key lime pie" },
      { key: "B", text: "Strawberry shortcake / fruit tart" },
      { key: "C", text: "Apple pie / baked dessert" },
    ],
  },
  {
    kind: "taste",
    id: "t3",
    section: "taste",
    prompt: "What texture do you enjoy most?",
    options: [
      { key: "A", text: "Crisp and refreshing" },
      { key: "B", text: "Light and juicy" },
      { key: "C", text: "Rich and smooth" },
    ],
  },
  {
    kind: "taste",
    id: "t4",
    section: "taste",
    prompt: "When you want something satisfying, you lean toward…",
    options: [
      { key: "A", text: "Something sharp and refreshing" },
      { key: "B", text: "Something sweet and uplifting" },
      { key: "C", text: "Something comforting and deep" },
    ],
  },
  {
    kind: "taste",
    id: "t5",
    section: "taste",
    prompt: "After you eat, what finish do you prefer?",
    options: [
      { key: "A", text: "Clean and slightly tangy" },
      { key: "B", text: "Sweet and lingering" },
      { key: "C", text: "Warm and rounded" },
    ],
  },
];

const ALL_QUESTIONS = [...QUESTIONS, ...TASTE_QUESTIONS] as const;

const SECTIONS: Record<SectionId, { title: string; subtitle: string }> = {
  energy: { title: "Read Your Energy", subtitle: "Calibrating your emotional rhythm." },
  social: { title: "Understand Your Vibe", subtitle: "Tuning social intent and mood direction." },
  flavor: { title: "Reveal Your Pairing", subtitle: "Mapping sensory preference and atmosphere." },
  taste: { title: "Taste Profiling", subtitle: "Capturing your sensory pull and finish." },
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
  const [stage, setStage] = useState<"overview" | "questions" | "ready">("overview");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ScaleValue>>({});
  const [tasteAnswers, setTasteAnswers] = useState<TasteAnswers>({});
  const [softSelected, setSoftSelected] = useState<ScaleValue | null>(null);
  const [softTasteSelected, setSoftTasteSelected] = useState<TasteOption | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [startedAt] = useState(() => Date.now());
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = ALL_QUESTIONS[index];
  const sectionMeta = SECTIONS[current.section];
  const activeSection = current.section;

  const isFinalQuestion = index === ALL_QUESTIONS.length - 1;
  const selected = current.kind === "mood" ? answers[current.id] : undefined;
  const selectedTaste = current.kind === "taste" ? tasteAnswers[current.id] : undefined;

  const handleSelect = (value: ScaleValue) => {
    if (current.kind !== "mood") return;
    if (pending || isAdvancing) return;
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    setError(null);
    setIsAdvancing(true);
    setSoftSelected(value);
    const nextAnswers = { ...answers, [current.id]: value };
    setAnswers(nextAnswers);

    feedbackTimerRef.current = setTimeout(() => {
      setSoftSelected(null);
      setIsAdvancing(false);
      if (isFinalQuestion) {
        setStage("ready");
        return;
      }
      setIndex((i) => i + 1);
    }, 180);
  };

  const handleTasteSelect = (option: TasteOption) => {
    if (current.kind !== "taste") return;
    if (pending || isAdvancing) return;
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    setError(null);
    setIsAdvancing(true);
    setSoftTasteSelected(option);
    const nextTasteAnswers = { ...tasteAnswers, [current.id]: option };
    setTasteAnswers(nextTasteAnswers);

    feedbackTimerRef.current = setTimeout(() => {
      setSoftTasteSelected(null);
      setIsAdvancing(false);
      if (isFinalQuestion) {
        setStage("ready");
        return;
      }
      setIndex((i) => i + 1);
    }, 180);
  };

  const goPrevious = () => {
    if (pending) return;
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    setSoftSelected(null);
    setSoftTasteSelected(null);
    setIsAdvancing(false);
    if (index > 0) {
      setIndex((i) => i - 1);
    }
  };

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const submitMoodCalibration = (sourceAnswers: Record<string, ScaleValue>, sourceTasteAnswers: TasteAnswers) => {
    const payload = buildQuizPayload(sourceAnswers);
    if (!payload) {
      setError("Complete each mood prompt to continue.");
      return;
    }
    if (!hasAllTasteAnswers(sourceTasteAnswers)) {
      setError("Complete each taste prompt to continue.");
      return;
    }
    const tasteLane = deriveTasteLane(sourceTasteAnswers);
    const sessionDurationSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
    startTransition(() => {
      void (async () => {
        try {
          const result = await submitQuiz({
            legacyAnswers: payload,
            calibrationAnswers: sourceAnswers,
            tasteLane,
            sessionDurationSeconds,
          });
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
      <div className="absolute left-5 top-6 z-20 sm:left-8 sm:top-8">
        <a
          href="/intro"
          className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-white/85 backdrop-blur-sm transition hover:bg-white/[0.1] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hs-accent)]"
        >
          <span aria-hidden className="text-base leading-none">
            ←
          </span>
          Back
        </a>
      </div>
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
        ) : stage === "questions" ? (
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
                {ALL_QUESTIONS.map((q, i) => (
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

                {current.kind === "mood" ? (
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
                            disabled={pending || isAdvancing}
                            className={`mx-auto rounded-full border transition duration-200 ${size} ${
                              isActive
                                ? "border-white bg-white/20 shadow-[0_0_0_7px_rgba(255,255,255,0.08),0_0_20px_rgba(124,58,237,0.45)]"
                                : "border-white/40 bg-transparent hover:border-white/70"
                            } ${softSelected === value ? "scale-110 shadow-[0_0_0_8px_rgba(255,255,255,0.1),0_0_28px_rgba(139,92,246,0.5)]" : ""}`}
                            aria-label={`Select intensity ${value}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto mt-10 grid w-full max-w-2xl gap-3">
                    {current.options.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => handleTasteSelect(option.key)}
                        disabled={pending || isAdvancing}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm text-white/90 transition sm:px-5 sm:py-3.5 ${
                          selectedTaste === option.key
                            ? "border-white/70 bg-white/[0.14] shadow-[0_0_0_6px_rgba(255,255,255,0.08)]"
                            : "border-white/20 bg-white/[0.04] hover:bg-white/[0.08]"
                        } ${softTasteSelected === option.key ? "scale-[1.015] shadow-[0_0_22px_rgba(139,92,246,0.45)]" : ""}`}
                        aria-label={`Select option ${option.key}`}
                      >
                        <span className="mr-2 inline-block rounded-full border border-white/25 px-2 py-0.5 text-[11px] font-semibold text-white/70">
                          {option.key}
                        </span>
                        {option.text}
                      </button>
                    ))}
                  </div>
                )}
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
                onClick={goPrevious}
                disabled={index === 0 || pending || isAdvancing}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.03] text-base text-white/85 transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Previous question"
              >
                ←
              </button>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="ready"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col justify-center pb-8 pt-10"
          >
            <div className="rounded-3xl border border-white/12 bg-white/[0.03] px-6 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm sm:px-10">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">All Set</p>
              <h2 className="mx-auto mt-4 max-w-2xl font-[family-name:var(--font-serif)] text-[clamp(1.5rem,4.6vw,2.4rem)] font-semibold leading-tight text-white">
                All responses received.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">
                Your mood profile is ready. Proceed to see your mood and pairing.
              </p>

              {error ? (
                <p className="mx-auto mt-5 w-full max-w-xl rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-2.5 text-sm text-red-100">
                  {error}
                </p>
              ) : null}

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setStage("questions")}
                  disabled={pending}
                  className="rounded-xl border border-white/20 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Review Answers
                </button>
                <button
                  type="button"
                  onClick={() => submitMoodCalibration(answers, tasteAnswers)}
                  disabled={pending}
                  className="rounded-xl bg-gradient-to-r from-[var(--hs-accent-strong)] to-[var(--hs-accent)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(124,58,237,0.8)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {pending ? "Revealing your mood..." : "Proceed to See Mood"}
                </button>
              </div>
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

function hasAllTasteAnswers(answers: TasteAnswers) {
  return TASTE_QUESTIONS.every((q) => answers[q.id] === "A" || answers[q.id] === "B" || answers[q.id] === "C");
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
