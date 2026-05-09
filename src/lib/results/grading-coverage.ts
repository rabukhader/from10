import type { GradingSessionDocument } from "@/src/domain";

/** Questions sorted by `questionNumber` (stable exam order). */
export function sortedExamQuestions<
  T extends { questionNumber: number },
>(questions: readonly T[]): T[] {
  return [...questions].sort((a, b) => a.questionNumber - b.questionNumber);
}

/** How many exam questions have a saved grading snapshot for this participant. */
export function countGradedQuestionsForParticipant(
  doc: GradingSessionDocument,
  participantId: string,
): { graded: number; total: number } {
  const total = doc.questions.length;
  const grading = doc.gradingByParticipantId[participantId];
  if (total === 0) return { graded: 0, total: 0 };
  if (!grading) return { graded: 0, total };

  const graded = doc.questions.filter(
    (question) => grading.questionGrades[question.id] !== undefined,
  ).length;

  return { graded, total };
}

/**
 * Aggregate “question grading slots” across all participants
 * (each participant × each exam question).
 */
export function aggregateSessionGradingCoverage(
  doc: GradingSessionDocument,
): { filledSlots: number; totalSlots: number } {
  const totalQuestions = doc.questions.length;
  const participantCount = doc.participants.length;
  const totalSlots = participantCount * totalQuestions;

  if (totalSlots === 0) return { filledSlots: 0, totalSlots: 0 };

  let filledSlots = 0;
  for (const participant of doc.participants) {
    filledSlots += countGradedQuestionsForParticipant(
      doc,
      participant.id,
    ).graded;
  }

  return { filledSlots, totalSlots };
}
