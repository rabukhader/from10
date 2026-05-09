import type {
  CriterionGradingSnapshot,
  ExamQuestion,
  GradingSessionDocument,
  ParticipantGradingResult,
  QuestionGradingSnapshot,
} from "@/src/domain";

/**
 * Aligns a persisted snapshot with the exam rubric: one row per criterion (exam order),
 * duplicate criterionIds collapsed so regrades / legacy data cannot multiply Excel rows.
 */
export function normalizeQuestionGradingSnapshot(
  question: ExamQuestion,
  snapshot: QuestionGradingSnapshot,
): QuestionGradingSnapshot {
  const byCriterionId = new Map<
    string,
    Pick<CriterionGradingSnapshot, "awardedMark" | "reasoning">
  >();
  for (const row of snapshot.criteria) {
    byCriterionId.set(row.criterionId, {
      awardedMark: row.awardedMark,
      reasoning: row.reasoning,
    });
  }

  const criteria: CriterionGradingSnapshot[] = question.criteria.map(
    (criterion) => {
      const row = byCriterionId.get(criterion.id);
      const raw = row?.awardedMark ?? 0;
      const safe = Number.isFinite(raw) && !Number.isNaN(raw) ? raw : 0;
      const awardedMark = Math.min(Math.max(0, safe), criterion.mark);
      return {
        criterionId: criterion.id,
        awardedMark,
        maxMark: criterion.mark,
        reasoning: row?.reasoning,
      };
    },
  );

  const totalAwardedMark = criteria.reduce(
    (sum, criterion) => sum + criterion.awardedMark,
    0,
  );

  return {
    ...snapshot,
    questionId: question.id,
    maxMark: question.totalMark,
    criteria,
    totalAwardedMark,
  };
}

export function normalizeParticipantGradingResult(
  questions: ExamQuestion[],
  result: ParticipantGradingResult,
): ParticipantGradingResult {
  const questionById = new Map(questions.map((q) => [q.id, q]));
  const questionGrades = { ...result.questionGrades };

  for (const questionId of Object.keys(questionGrades)) {
    const question = questionById.get(questionId);
    if (!question) continue;
    questionGrades[questionId] = normalizeQuestionGradingSnapshot(
      question,
      questionGrades[questionId]!,
    );
  }

  const totalScore = Object.values(questionGrades).reduce(
    (sum, grade) => sum + grade.totalAwardedMark,
    0,
  );

  return {
    ...result,
    questionGrades,
    totalScore,
  };
}

export function normalizeSessionDocumentGrading(
  doc: GradingSessionDocument,
): GradingSessionDocument {
  const gradingByParticipantId = Object.fromEntries(
    Object.entries(doc.gradingByParticipantId).map(([id, result]) => [
      id,
      normalizeParticipantGradingResult(doc.questions, result),
    ]),
  );
  return { ...doc, gradingByParticipantId };
}

export function emptyQuestionGradingSnapshot(
  question: ExamQuestion,
): QuestionGradingSnapshot {
  const now = new Date().toISOString();
  return {
    questionId: question.id,
    totalAwardedMark: 0,
    maxMark: question.totalMark,
    criteria: question.criteria.map((criterion) => ({
      criterionId: criterion.id,
      awardedMark: 0,
      maxMark: criterion.mark,
      reasoning: undefined,
    })),
    feedback: "",
    gradedAt: now,
    source: "manual",
  };
}

export function emptyParticipantGradingResult(
  participantId: string,
  sessionId: string,
): ParticipantGradingResult {
  const now = new Date().toISOString();
  return {
    participantId,
    sessionId,
    questionGrades: {},
    overallFeedback: undefined,
    totalScore: 0,
    updatedAt: now,
  };
}

export function mergeQuestionSnapshot(
  previous: ParticipantGradingResult,
  snapshot: QuestionGradingSnapshot,
): ParticipantGradingResult {
  const questionGrades = {
    ...previous.questionGrades,
    [snapshot.questionId]: snapshot,
  };
  const totalScore = Object.values(questionGrades).reduce(
    (sum, grade) => sum + grade.totalAwardedMark,
    0,
  );
  return {
    ...previous,
    questionGrades,
    totalScore,
    updatedAt: new Date().toISOString(),
  };
}

export function recomputeQuestionTotal(
  snapshot: QuestionGradingSnapshot,
): QuestionGradingSnapshot {
  const sum = snapshot.criteria.reduce(
    (total, criterion) => total + criterion.awardedMark,
    0,
  );
  return { ...snapshot, totalAwardedMark: sum };
}
