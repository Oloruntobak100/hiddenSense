export type MoodScopedAvoid = {
  moodKey: string;
  moodName: string;
  recommendationId: string;
  drinkName: string | null;
  foodName: string | null;
};

export function avoidIdsForMood(avoidPairingsByMood: MoodScopedAvoid[], currentMoodKey: string): string[] {
  return [
    ...new Set(
      avoidPairingsByMood
        .filter((a) => a.moodKey === currentMoodKey)
        .map((a) => a.recommendationId),
    ),
  ];
}
