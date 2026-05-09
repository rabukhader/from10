import { describe, expect, it } from "vitest";

import type { ExamQuestion } from "@/src/domain";

import {
  parseJsonFromModelContent,
  validateAiGradingResponse,
} from "./validate-ai-grading-response";

function questionTwoCriteria(): ExamQuestion {
  return {
    id: "q1",
    questionNumber: 1,
    title: "Essay",
    body: "Write",
    type: "long_answer",
    totalMark: 5,
    criteria: [
      { id: "c1", title: "Structure", description: "", mark: 2 },
      { id: "c2", title: "Content", description: "", mark: 3 },
    ],
  };
}

describe("validateAiGradingResponse", () => {
  it("accepts valid structured output", () => {
    const parsed = {
      totalAwardedMark: 5,
      criterionGrades: [
        { criterionId: "c1", awardedMark: 2, reasoning: "ok" },
        { criterionId: "c2", awardedMark: 3, reasoning: "ok" },
      ],
      feedback: "Nice work.",
    };
    const result = validateAiGradingResponse(parsed, questionTwoCriteria());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.totalAwardedMark).toBe(5);
    }
  });

  it("rejects wrong sum", () => {
    const parsed = {
      totalAwardedMark: 4,
      criterionGrades: [
        { criterionId: "c1", awardedMark: 2, reasoning: "ok" },
        { criterionId: "c2", awardedMark: 3, reasoning: "ok" },
      ],
      feedback: "x",
    };
    const result = validateAiGradingResponse(parsed, questionTwoCriteria());
    expect(result.ok).toBe(false);
  });
});

describe("parseJsonFromModelContent", () => {
  it("strips markdown fences", () => {
    const raw = "```json\n{\"a\":1}\n```";
    expect(parseJsonFromModelContent(raw)).toEqual({ a: 1 });
  });
});
