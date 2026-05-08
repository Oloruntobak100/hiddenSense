export type TasteOption = "A" | "B" | "C";
export type TasteLane = "lemon" | "strawberry" | "apple";

export type TasteAnswers = Record<string, TasteOption>;

const TASTE_LANE_BY_OPTION: Record<TasteOption, TasteLane> = {
  A: "lemon",
  B: "strawberry",
  C: "apple",
};

export function deriveTasteLane(answers: TasteAnswers): TasteLane {
  const counts: Record<TasteLane, number> = {
    lemon: 0,
    strawberry: 0,
    apple: 0,
  };

  const values = Object.values(answers);
  for (const value of values) {
    counts[TASTE_LANE_BY_OPTION[value]] += 1;
  }

  const ranked = (Object.entries(counts) as Array<[TasteLane, number]>).sort((a, b) => b[1] - a[1]);
  if (ranked[0][1] !== ranked[1][1]) return ranked[0][0];

  // Deterministic tie-break for split preferences.
  const tieOrder: TasteLane[] = ["strawberry", "lemon", "apple"];
  for (const lane of tieOrder) {
    if (counts[lane] === ranked[0][1]) return lane;
  }

  return "strawberry";
}
