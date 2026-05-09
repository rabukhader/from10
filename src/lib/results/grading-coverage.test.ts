import { describe, expect, it } from "vitest";

import type { GradingSessionDocument } from "@/src/domain";
import { GRADING_SESSION_DOCUMENT_VERSION } from "@/src/domain";

import {
  aggregateSessionGradingCoverage,
  countGradedQuestionsForParticipant,
} from "./grading-coverage";

function minimalDoc(
  overrides: Partial<GradingSessionDocument> = {},
): GradingSessionDocument {
  const base: GradingSessionDocument = {
    id: "s1",
    version: GRADING_SESSION_DOCUMENT_VERSION,
    exam: {
      examTitle: "Ex",
      courseName: "C",
      examDate: "2026-01-01",
      totalMarks: 10,
    },
    preferences: {
      gradingStrictness: "balanced",
      studentLevel: "beginner",
      examLevel: "easy",
      feedbackStyle: "balanced",
    },
    questions: [
      {
        id: "q1",
        questionNumber: 1,
        title: "Q",
        body: "",
        type: "short_answer",
        totalMark: 5,
        criteria: [],
      },
      {
        id: "q2",
        questionNumber: 2,
        title: "Q2",
        body: "",
        type: "short_answer",
        totalMark: 5,
        criteria: [],
      },
    ],
    participants: [{ id: "p1", sessionId: "s1", gradingStatus: "pending", createdAt: "", updatedAt: "" }],
    submissionsByParticipantId: {},
    gradingByParticipantId: {},
    createdAt: "",
    updatedAt: "",
  };
  return { ...base, ...overrides };
}

describe("countGradedQuestionsForParticipant", () => {
  it("returns zero when no grading record", () => {
    const doc = minimalDoc();
    expect(countGradedQuestionsForParticipant(doc, "p1")).toEqual({
      graded: 0,
      total: 2,
    });
  });

  it("counts snapshots present", () => {
    const doc = minimalDoc({
      gradingByParticipantId: {
        p1: {
          participantId: "p1",
          sessionId: "s1",
          questionGrades: {
            q1: {
              questionId: "q1",
              totalAwardedMark: 3,
              maxMark: 5,
              criteria: [],
              feedback: "",
              gradedAt: "",
              source: "manual",
            },
          },
          totalScore: 3,
          updatedAt: "",
        },
      },
    });
    expect(countGradedQuestionsForParticipant(doc, "p1")).toEqual({
      graded: 1,
      total: 2,
    });
  });
});

describe("aggregateSessionGradingCoverage", () => {
  it("computes participant × question slots", () => {
    const doc = minimalDoc({
      participants: [
        { id: "p1", sessionId: "s1", gradingStatus: "pending", createdAt: "", updatedAt: "" },
        { id: "p2", sessionId: "s1", gradingStatus: "pending", createdAt: "", updatedAt: "" },
      ],
      gradingByParticipantId: {
        p1: {
          participantId: "p1",
          sessionId: "s1",
          questionGrades: {
            q1: {
              questionId: "q1",
              totalAwardedMark: 1,
              maxMark: 5,
              criteria: [],
              feedback: "",
              gradedAt: "",
              source: "manual",
            },
          },
          totalScore: 1,
          updatedAt: "",
        },
      },
    });
    expect(aggregateSessionGradingCoverage(doc)).toEqual({
      filledSlots: 1,
      totalSlots: 4,
    });
  });
});
