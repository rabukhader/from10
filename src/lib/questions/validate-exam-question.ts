import type { ExamQuestion } from "@/src/domain";

import type { Translate } from "@/src/lib/i18n/preference-labels";

/** Criteria rows without a title are ignored before validation (draft rows). */
export function sanitizeExamQuestion(question: ExamQuestion): ExamQuestion {
  const criteria = question.criteria
    .map((criterion) => ({
      ...criterion,
      title: criterion.title.trim(),
      description: criterion.description.trim(),
      mark: Number.isFinite(criterion.mark)
        ? Math.max(0, Math.round(Number(criterion.mark)))
        : 0,
    }))
    .filter((criterion) => criterion.title.length > 0);

  const totalMark = Number(question.totalMark);
  const roundedTotal = Number.isFinite(totalMark)
    ? Math.max(1, Math.round(totalMark))
    : NaN;

  return {
    ...question,
    title: question.title.trim(),
    body: question.body.trim(),
    notes: question.notes?.trim() ? question.notes.trim() : undefined,
    modelAnswer: question.modelAnswer?.trim()
      ? question.modelAnswer.trim()
      : undefined,
    totalMark: roundedTotal,
    criteria,
  };
}

export function validateExamQuestionForSave(
  question: ExamQuestion,
  t: Translate,
): string | null {
  if (!question.title.trim()) {
    return t("question.validation.titleRequired");
  }

  if (
    !Number.isFinite(question.totalMark) ||
    question.totalMark <= 0 ||
    !Number.isInteger(question.totalMark)
  ) {
    return t("question.validation.totalMarkInteger");
  }

  if (question.criteria.length === 0) {
    return t("question.validation.criteriaRequired");
  }

  let sum = 0;

  for (const criterion of question.criteria) {
    if (!criterion.title.trim()) {
      return t("question.validation.criterionTitle");
    }

    if (
      !Number.isFinite(criterion.mark) ||
      criterion.mark < 0 ||
      !Number.isInteger(criterion.mark)
    ) {
      return t("question.validation.criterionMarkInvalid");
    }

    sum += criterion.mark;
  }

  if (sum !== question.totalMark) {
    return `${t("question.validation.criteriaSum")} (${sum} / ${question.totalMark})`;
  }

  return null;
}
