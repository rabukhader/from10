import { describe, expect, it } from "vitest";

import type { ExamQuestion } from "@/src/domain";
import type { Translate } from "@/src/lib/i18n/preference-labels";

import {
  sanitizeExamQuestion,
  validateExamQuestionForSave,
} from "./validate-exam-question";

const echoTranslate: Translate = (key) => key;

function draftQuestion(
  overrides: Partial<ExamQuestion> = {},
): ExamQuestion {
  return {
    id: "q1",
    questionNumber: 1,
    title: "Title",
    body: "Body",
    type: "short_answer",
    totalMark: 6,
    criteria: [
      {
        id: "c1",
        title: "Part A",
        description: "d",
        mark: 3,
      },
      {
        id: "c2",
        title: "Part B",
        description: "d",
        mark: 3,
      },
    ],
    ...overrides,
  };
}

describe("sanitizeExamQuestion", () => {
  it("drops criteria without titles", () => {
    const cleaned = sanitizeExamQuestion(
      draftQuestion({
        criteria: [
          { id: "c1", title: "", description: "", mark: 2 },
          { id: "c2", title: "OK", description: "", mark: 2 },
        ],
      }),
    );
    expect(cleaned.criteria).toHaveLength(1);
    expect(cleaned.criteria[0]?.title).toBe("OK");
  });
});

describe("validateExamQuestionForSave", () => {
  it("requires title", () => {
    expect(
      validateExamQuestionForSave(
        draftQuestion({ title: "" }),
        echoTranslate,
      ),
    ).toBe("question.validation.titleRequired");
  });

  it("requires criterion marks to sum to total", () => {
    const invalid = draftQuestion({
      criteria: [
        { id: "c1", title: "A", description: "", mark: 2 },
        { id: "c2", title: "B", description: "", mark: 2 },
      ],
      totalMark: 6,
    });
    expect(validateExamQuestionForSave(invalid, echoTranslate)).toContain(
      "question.validation.criteriaSum",
    );
  });

  it("accepts valid rubric", () => {
    expect(validateExamQuestionForSave(draftQuestion(), echoTranslate)).toBeNull();
  });
});
