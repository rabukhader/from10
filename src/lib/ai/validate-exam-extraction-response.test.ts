import { describe, expect, it } from "vitest";

import { validateExamExtractionResponse } from "./validate-exam-extraction-response";

describe("validateExamExtractionResponse", () => {
  it("accepts a minimal valid payload", () => {
    const parsed = {
      questions: [
        {
          title: "Q1",
          body: "Solve x.",
          type: "short_answer",
          totalMark: 10,
          criteria: [
            { title: "Method", description: "Shows work", mark: 6 },
            { title: "Answer", description: "Correct value", mark: 4 },
          ],
        },
      ],
    };
    const result = validateExamExtractionResponse(parsed);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0]?.questionNumber).toBe(1);
      expect(result.questions[0]?.criteria).toHaveLength(2);
    }
  });

  it("rejects when criterion marks do not sum to totalMark", () => {
    const parsed = {
      questions: [
        {
          title: "Q1",
          body: "A",
          type: "short_answer",
          totalMark: 10,
          criteria: [{ title: "a", description: "d", mark: 5 }],
        },
      ],
    };
    const result = validateExamExtractionResponse(parsed);
    expect(result.ok).toBe(false);
  });
});
