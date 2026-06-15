import type { AnswerLetter, QuizAnswers } from "@/lib/mood/types";
import type { MoodQuestionConfig, QuizContentConfig, TasteQuestionConfig } from "@/lib/quiz/quiz-content-types";
import type { TasteAnswers, TasteOption } from "@/lib/intelligence/taste-lane";

export type ScaleValue = -2 | -1 | 0 | 1 | 2;

export function buildQuizPayload(
  answers: Record<string, ScaleValue>,
  moodQuestions: MoodQuestionConfig[],
): QuizAnswers | null {
  const active = moodQuestions.filter((q) => q.active);

  const energyQ = active.find((q) => q.role === "energy");
  const emotionQ = active.find((q) => q.role === "emotion");
  const mentalQ = active.find((q) => q.role === "mental");
  const socialQ = active.find((q) => q.role === "social");
  const intentQs = active.filter((q) => q.role === "intent");

  if (!energyQ || !emotionQ || !mentalQ || !socialQ || !intentQs.length) return null;

  for (const q of [energyQ, emotionQ, mentalQ, socialQ, ...intentQs]) {
    if (typeof answers[q.id] !== "number") return null;
  }

  const intentComposite = average(intentQs.map((q) => answers[q.id]));

  return {
    q1: toLetterRightPositive(answers[energyQ.id]),
    q2: toLetterRightPositiveInvertedABC(answers[emotionQ.id]),
    q3: toLetterRightPositiveInvertedABC(answers[socialQ.id]),
    q4: toLetterRightPositiveInvertedABC(answers[mentalQ.id]),
    q5: toLetterRightPositiveInvertedABC(intentComposite),
  };
}

export function hasAllTasteAnswers(answers: TasteAnswers, tasteQuestions: TasteQuestionConfig[]) {
  return tasteQuestions
    .filter((q) => q.active)
    .every((q) => answers[q.id] === "A" || answers[q.id] === "B" || answers[q.id] === "C");
}

export function validateQuizContentConfig(config: QuizContentConfig): string | null {
  const roles = ["energy", "emotion", "mental", "social"] as const;
  for (const role of roles) {
    const active = config.moodQuestions.filter((q) => q.active && q.role === role);
    if (active.length !== 1) {
      return `Exactly one active mood question must have role "${role}".`;
    }
  }

  const intentActive = config.moodQuestions.filter((q) => q.active && q.role === "intent");
  if (intentActive.length < 1) {
    return "At least one active mood question must have role \"intent\".";
  }

  const activeTaste = config.tasteQuestions.filter((q) => q.active);
  if (activeTaste.length < 1) {
    return "At least one taste question must be active.";
  }

  for (const q of activeTaste) {
    if (!q.prompt.trim()) return `Taste question ${q.id} needs a prompt.`;
    for (const opt of q.options) {
      if (!opt.text.trim()) return `Taste question ${q.id} option ${opt.key} needs text.`;
    }
  }

  for (const q of config.moodQuestions.filter((m) => m.active)) {
    if (!q.prompt.trim()) return `Mood question ${q.id} needs a prompt.`;
    if (!q.left.trim() || !q.right.trim()) return `Mood question ${q.id} needs left and right labels.`;
  }

  for (const section of Object.values(config.sections)) {
    if (!section.title.trim() || !section.subtitle.trim()) {
      return "Each quiz section needs a title and subtitle.";
    }
  }

  return null;
}

function average(values: number[]) {
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}

function toLetterRightPositive(value: number): AnswerLetter {
  if (value <= -0.7) return "A";
  if (value >= 0.7) return "C";
  return "B";
}

function toLetterRightPositiveInvertedABC(value: number): AnswerLetter {
  if (value <= -0.7) return "C";
  if (value >= 0.7) return "A";
  return "B";
}
