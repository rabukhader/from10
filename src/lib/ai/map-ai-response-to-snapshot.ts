import type {
  AiGradingResponse,
  ExamQuestion,
  QuestionGradingSnapshot,
} from "@/src/domain";

export function mapAiResponseToQuestionSnapshot(
  question: ExamQuestion,
  ai: AiGradingResponse,
): QuestionGradingSnapshot {
  const gradeById = new Map(
    ai.criterionGrades.map((grade) => [grade.criterionId, grade]),
  );

  const criteria = question.criteria.map((criterion) => {
    const grade = gradeById.get(criterion.id);
    return {
      criterionId: criterion.id,
      awardedMark: grade?.awardedMark ?? 0,
      maxMark: criterion.mark,
      reasoning: grade?.reasoning,
    };
  });

  const sum = criteria.reduce((total, row) => total + row.awardedMark, 0);

  return {
    questionId: question.id,
    totalAwardedMark: sum,
    maxMark: question.totalMark,
    criteria,
    feedback: ai.feedback,
    gradedAt: new Date().toISOString(),
    source: "ai",
  };
}
