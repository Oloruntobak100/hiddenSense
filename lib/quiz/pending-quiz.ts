export const PENDING_QUIZ_STORAGE_KEY = "hs_pending_quiz_v1";

export type PendingQuizV1 = {
  v: 1;
  legacyAnswers: import("@/lib/mood/types").QuizAnswers;
  calibrationAnswers: Record<string, number>;
  tasteLane: import("@/lib/intelligence/taste-lane").TasteLane;
  sessionDurationSeconds: number;
};
