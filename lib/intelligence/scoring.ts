import { MOOD_ARCHETYPES, type MoodArchetype } from "@/lib/intelligence/mood-archetypes";
import { QUESTION_MODEL, type QuestionCategory } from "@/lib/intelligence/question-model";

export type CalibrationAnswers = Record<string, number>;

export type EmotionalScores = {
  energy_score: number;
  emotional_weight: number;
  social_score: number;
  mental_clarity: number;
  behavioral_intent: number;
  flavor_preference: number;
  atmosphere_preference: number;
};

export function calculateMoodProfile(answers: CalibrationAnswers): EmotionalScores {
  const base: EmotionalScores = {
    energy_score: 0,
    emotional_weight: 0,
    social_score: 0,
    mental_clarity: 0,
    behavioral_intent: 0,
    flavor_preference: 0,
    atmosphere_preference: 0,
  };

  const counts: Record<QuestionCategory, number> = {
    energy_score: 0,
    emotional_weight: 0,
    social_score: 0,
    mental_clarity: 0,
    behavioral_intent: 0,
    flavor_preference: 0,
    atmosphere_preference: 0,
  };

  for (const q of QUESTION_MODEL) {
    const value = Number(answers[q.id] ?? 0);
    base[q.category] += value;
    counts[q.category] += 1;
  }

  (Object.keys(base) as Array<keyof EmotionalScores>).forEach((k) => {
    if (counts[k] > 0) {
      base[k] = Number((base[k] / counts[k]).toFixed(2));
    }
  });

  return base;
}

export function calculateConfidenceScore(
  user: EmotionalScores,
  primary: MoodArchetype,
  secondary?: MoodArchetype,
) {
  const primarySimilarity = similarity(user, primary);
  const spreadBoost = secondary ? Math.max(0, primarySimilarity - similarity(user, secondary)) * 0.4 : 0.18;
  const confidence = Math.min(0.99, primarySimilarity + spreadBoost);
  return Number((confidence * 100).toFixed(1));
}

export function determineMoodType(user: EmotionalScores) {
  const ranked = MOOD_ARCHETYPES.map((m) => ({
    mood: m,
    similarity: similarity(user, m),
  })).sort((a, b) => b.similarity - a.similarity);

  return {
    primary: ranked[0],
    secondary: ranked[1],
    ranked,
  };
}

export function generateFlavorProfile(scores: EmotionalScores) {
  if (scores.flavor_preference >= 1.1) return "Crisp, bright, and refreshing";
  if (scores.flavor_preference <= -1.1) return "Deep, smooth, and warming";
  return "Balanced, rounded, and versatile";
}

export function generateAtmosphereProfile(scores: EmotionalScores) {
  if (scores.atmosphere_preference >= 1.1) return "Neon night energy";
  if (scores.atmosphere_preference <= -1.1) return "Candlelight and quiet";
  return "Soft lounge glow";
}

function similarity(user: EmotionalScores, mood: MoodArchetype) {
  const totalDiff =
    Math.abs(user.energy_score - mood.target.energy_score) +
    Math.abs(user.emotional_weight - mood.target.emotional_weight) +
    Math.abs(user.social_score - mood.target.social_score) +
    Math.abs(user.mental_clarity - mood.target.mental_clarity) +
    Math.abs(user.behavioral_intent - mood.target.behavioral_intent) +
    Math.abs(user.flavor_preference - mood.target.flavor_preference) +
    Math.abs(user.atmosphere_preference - mood.target.atmosphere_preference);

  const maxDiff = 28;
  return Number((1 - totalDiff / maxDiff).toFixed(4));
}
