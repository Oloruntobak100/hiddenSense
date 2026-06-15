import { describe, expect, it } from "vitest";
import type { UserHistoryEntry } from "@/lib/intelligence/user-context";

function deriveAvoidIds(history: UserHistoryEntry[]): string[] {
  return [
    ...new Set(
      history
        .filter((h) => h.pairingFeedback === "not_really" && h.recommendationId)
        .map((h) => h.recommendationId as string),
    ),
  ];
}

describe("AI user context helpers", () => {
  it("collects recommendation ids disliked by the user", () => {
    const history: UserHistoryEntry[] = [
      {
        date: "2026-01-01",
        moodKey: "a",
        moodName: "A",
        drinkName: "Drink A",
        foodName: "Food A",
        recommendationId: "11111111-1111-4111-8111-111111111111",
        pairingFeedback: "not_really",
        moodAccurate: true,
        rating: 2,
        comment: null,
        clickedCheckout: false,
      },
      {
        date: "2026-01-02",
        moodKey: "b",
        moodName: "B",
        drinkName: "Drink B",
        foodName: "Food B",
        recommendationId: "22222222-2222-4222-8222-222222222222",
        pairingFeedback: "absolutely",
        moodAccurate: true,
        rating: 5,
        comment: null,
        clickedCheckout: true,
      },
    ];

    expect(deriveAvoidIds(history)).toEqual(["11111111-1111-4111-8111-111111111111"]);
  });
});
