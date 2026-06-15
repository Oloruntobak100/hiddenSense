import { describe, expect, it } from "vitest";
import { avoidIdsForMood, type MoodScopedAvoid } from "@/lib/intelligence/mood-avoid";

describe("mood-scoped avoid list", () => {
  const avoids: MoodScopedAvoid[] = [
    {
      moodKey: "lets_make_a_scene",
      moodName: "Let's Make a Scene",
      recommendationId: "11111111-1111-4111-8111-111111111111",
      drinkName: "Margarita",
      foodName: "Tuna crudo",
    },
    {
      moodKey: "handle_with_care",
      moodName: "Handle with Care",
      recommendationId: "11111111-1111-4111-8111-111111111111",
      drinkName: "Margarita",
      foodName: "Tuna crudo",
    },
  ];

  it("only blocks disliked listings for the matching mood", () => {
    expect(avoidIdsForMood(avoids, "lets_make_a_scene")).toEqual([
      "11111111-1111-4111-8111-111111111111",
    ]);
    expect(avoidIdsForMood(avoids, "ready_to_be_kissed")).toEqual([]);
  });

  it("allows the same listing in a different mood when only one mood disliked it", () => {
    const singleMood: MoodScopedAvoid[] = [avoids[0]];
    expect(avoidIdsForMood(singleMood, "handle_with_care")).toEqual([]);
    expect(avoidIdsForMood(singleMood, "lets_make_a_scene")).toEqual([
      "11111111-1111-4111-8111-111111111111",
    ]);
  });
});
