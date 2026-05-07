import { MOODS } from "@/lib/mood/definitions";
import { answersToProfile } from "@/lib/mood/maps";
import type {
  AttributeProfile,
  MoodDefinition,
  MoodEngineResult,
  QuizAnswers,
} from "@/lib/mood/types";

function scoreMatch(profile: AttributeProfile, target: AttributeProfile): number {
  let score = 0;
  if (profile.energy === target.energy) score += 1;
  if (profile.emotion === target.emotion) score += 1;
  if (profile.social === target.social) score += 1;
  if (profile.mental === target.mental) score += 1;
  if (profile.intent === target.intent) score += 1;
  return score;
}

function tieBreakSort(a: MoodDefinition, b: MoodDefinition, profile: AttributeProfile): number {
  const ai =
    (a.pattern.intent === profile.intent ? 2 : 0) +
    (a.pattern.energy === profile.energy ? 1 : 0);
  const bi =
    (b.pattern.intent === profile.intent ? 2 : 0) +
    (b.pattern.energy === profile.energy ? 1 : 0);
  if (bi !== ai) return bi - ai;
  return a.key.localeCompare(b.key);
}

export function resolveMood(answers: QuizAnswers): MoodEngineResult {
  const attribute_profile = answersToProfile(answers);
  const scored = MOODS.map((mood) => ({
    mood,
    score: scoreMatch(attribute_profile, mood.pattern),
  }));
  const maxScore = Math.max(...scored.map((s) => s.score));
  const top = scored.filter((s) => s.score === maxScore);
  top.sort((a, b) => tieBreakSort(a.mood, b.mood, attribute_profile));
  const winner = top[0].mood;
  return {
    mood_key: winner.key,
    mood_name: winner.name,
    confidence_score: maxScore,
    user_answers: answers,
    attribute_profile,
  };
}
