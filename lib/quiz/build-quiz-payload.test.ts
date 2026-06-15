import { describe, expect, it } from "vitest";
import { buildQuizPayload } from "@/lib/quiz/build-quiz-payload";
import { DEFAULT_QUIZ_CONTENT } from "@/lib/quiz/default-quiz-content";

describe("buildQuizPayload", () => {
  it("maps mood calibration answers to legacy quiz letters", () => {
    const payload = buildQuizPayload(
      { m1: 2, m2: 2, m3: 2, m4: 2, m5: 2, m6: 0, m7: 0 },
      DEFAULT_QUIZ_CONTENT.moodQuestions,
    );
    expect(payload).toEqual({ q1: "C", q2: "A", q3: "A", q4: "A", q5: "B" });
  });
});
