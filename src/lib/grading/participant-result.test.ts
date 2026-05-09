import { describe, expect, it } from "vitest";

import type { ExamQuestion, QuestionGradingSnapshot } from "@/src/domain";

import {
  normalizeQuestionGradingSnapshot,
  normalizeSessionDocumentGrading,
} from "./participant-result";

function sampleQuestion(): ExamQuestion {
  return {
    id: "q1",
    questionNumber: 1,
    title: "Q1",
    body: "",
    type: "short_answer",
    totalMark: 10,
    criteria: [
      { id: "c1", title: "A", description: "", mark: 4 },
      { id: "c2", title: "B", description: "", mark: 6 },
    ],
  };
}

describe("normalizeQuestionGradingSnapshot", () => {
  it("keeps one criterion row per rubric entry; last duplicate wins", () => {
    const question = sampleQuestion();
    const snapshot: QuestionGradingSnapshot = {
      questionId: question.id,
      totalAwardedMark: 99,
      maxMark: question.totalMark,
      criteria: [
        {
          criterionId: "c1",
          awardedMark: 1,
          maxMark: 4,
          reasoning: "first",
        },
        {
          criterionId: "c1",
          awardedMark: 3,
          maxMark: 4,
          reasoning: "last",
        },
        {
          criterionId: "c2",
          awardedMark: 5,
          maxMark: 6,
          reasoning: "ok",
        },
      ],
      feedback: "fb",
      gradedAt: "2026-01-01T00:00:00.000Z",
      source: "ai",
    };

    const out = normalizeQuestionGradingSnapshot(question, snapshot);

    expect(out.criteria).toHaveLength(2);
    expect(out.criteria[0]).toMatchObject({
      criterionId: "c1",
      awardedMark: 3,
      maxMark: 4,
      reasoning: "last",
    });
    expect(out.criteria[1]).toMatchObject({
      criterionId: "c2",
      awardedMark: 5,
      maxMark: 6,
    });
    expect(out.totalAwardedMark).toBe(8);
    expect(out.maxMark).toBe(question.totalMark);
  });

  it("clamps awarded marks to each criterion max", () => {
    const question = sampleQuestion();
    const snapshot: QuestionGradingSnapshot = {
      questionId: question.id,
      totalAwardedMark: 0,
      maxMark: question.totalMark,
      criteria: [
        { criterionId: "c1", awardedMark: 99, maxMark: 4, reasoning: "" },
        { criterionId: "c2", awardedMark: -2, maxMark: 6, reasoning: "" },
      ],
      feedback: "",
      gradedAt: "2026-01-01T00:00:00.000Z",
      source: "manual",
    };

    const out = normalizeQuestionGradingSnapshot(question, snapshot);

    expect(out.criteria[0]?.awardedMark).toBe(4);
    expect(out.criteria[1]?.awardedMark).toBe(0);
    expect(out.totalAwardedMark).toBe(4);
  });
});

describe("normalizeSessionDocumentGrading", () => {
  it("normalizes every participant grading snapshot", () => {
    const question = sampleQuestion();
    const dupSnap: QuestionGradingSnapshot = {
      questionId: question.id,
      totalAwardedMark: 1,
      maxMark: question.totalMark,
      criteria: [
        {
          criterionId: "c1",
          awardedMark: 2,
          maxMark: 4,
          reasoning: "x",
        },
        {
          criterionId: "c1",
          awardedMark: 2,
          maxMark: 4,
          reasoning: "y",
        },
      ],
      feedback: "",
      gradedAt: "2026-01-01T00:00:00.000Z",
      source: "mixed",
    };

    const doc = normalizeSessionDocumentGrading({
      id: "s1",
      version: 1,
      exam: {
        examTitle: "",
        courseName: "",
        examDate: "",
        totalMarks: 10,
      },
      preferences: {
        gradingStrictness: "balanced",
        studentLevel: "intermediate",
        examLevel: "medium",
        feedbackStyle: "balanced",
      },
      questions: [question],
      participants: [],
      submissionsByParticipantId: {},
      gradingByParticipantId: {
        p1: {
          participantId: "p1",
          sessionId: "s1",
          questionGrades: { q1: dupSnap },
          overallFeedback: "",
          totalScore: 1,
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      },
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const participantGrading = doc.gradingByParticipantId.p1;
    expect(participantGrading?.totalScore).toBe(2);

    const g = participantGrading?.questionGrades.q1;
    expect(g?.criteria).toHaveLength(2);
    expect(g?.criteria.filter((c) => c.criterionId === "c1")).toHaveLength(1);
    expect(g?.criteria.find((c) => c.criterionId === "c2")?.awardedMark).toBe(
      0,
    );
  });
});
