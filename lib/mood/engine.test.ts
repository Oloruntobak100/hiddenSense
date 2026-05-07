import { describe, expect, it } from "vitest";
import { resolveMood } from "@/lib/mood/engine";

describe("resolveMood", () => {
  it("matches Let's Make a Scene for high-energy social celebrate pattern", () => {
    const r = resolveMood({
      q1: "C",
      q2: "A",
      q3: "A",
      q4: "A",
      q5: "A",
    });
    expect(r.mood_key).toBe("lets_make_a_scene");
    expect(r.confidence_score).toBe(5);
  });

  it("matches Ready to be Kissed for medium positive selective relax", () => {
    const r = resolveMood({
      q1: "B",
      q2: "A",
      q3: "B",
      q4: "A",
      q5: "B",
    });
    expect(r.mood_key).toBe("ready_to_be_kissed");
    expect(r.confidence_score).toBe(5);
  });

  it("matches Soft Life Loading for low neutral alone fatigue escape pattern", () => {
    const r = resolveMood({
      q1: "A",
      q2: "B",
      q3: "C",
      q4: "C",
      q5: "C",
    });
    expect(r.mood_key).toBe("soft_life_loading");
    expect(r.confidence_score).toBe(5);
  });
});
