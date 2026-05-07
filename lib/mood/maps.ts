import type {
  AnswerLetter,
  AttributeProfile,
  EmotionLevel,
  EnergyLevel,
  IntentLevel,
  MentalLevel,
  QuizAnswers,
  SocialLevel,
} from "@/lib/mood/types";

const q1Energy: Record<AnswerLetter, EnergyLevel> = {
  A: "Low",
  B: "Medium",
  C: "High",
};

const q2Emotion: Record<AnswerLetter, EmotionLevel> = {
  A: "Positive",
  B: "Neutral",
  C: "Negative",
};

const q3Social: Record<AnswerLetter, SocialLevel> = {
  A: "Social",
  B: "Selective",
  C: "Alone",
};

const q4Mental: Record<AnswerLetter, MentalLevel> = {
  A: "Clear",
  B: "Anxious",
  C: "Fatigued",
};

const q5Intent: Record<AnswerLetter, IntentLevel> = {
  A: "Celebrate",
  B: "Relax",
  C: "Escape",
};

export function answersToProfile(answers: QuizAnswers): AttributeProfile {
  return {
    energy: q1Energy[answers.q1],
    emotion: q2Emotion[answers.q2],
    social: q3Social[answers.q3],
    mental: q4Mental[answers.q4],
    intent: q5Intent[answers.q5],
  };
}

export function parseAnswerLetter(value: string): AnswerLetter | null {
  if (value === "A" || value === "B" || value === "C") return value;
  return null;
}
