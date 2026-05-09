import type { ExamQuestion, QuestionType } from "@/src/domain";

function newQuestionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Minimal draft used until T17/T18 flesh out full editor fields. */
export function createDraftQuestion(
  index: number,
  defaults?: Partial<
    Pick<ExamQuestion, "title" | "type" | "totalMark">
  >,
): ExamQuestion {
  const order = index + 1;
  return {
    id: newQuestionId(),
    questionNumber: order,
    title: defaults?.title?.trim() || `Question ${order}`,
    body: "",
    type: (defaults?.type ?? "short_answer") as QuestionType,
    totalMark:
      typeof defaults?.totalMark === "number" && defaults.totalMark > 0
        ? defaults.totalMark
        : 1,
    criteria: [],
  };
}

export function renumberQuestions(questions: ExamQuestion[]): ExamQuestion[] {
  return questions.map((question, index) => ({
    ...question,
    questionNumber: index + 1,
  }));
}

export function moveQuestionAt(
  questions: ExamQuestion[],
  index: number,
  direction: -1 | 1,
): ExamQuestion[] {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= questions.length) {
    return questions;
  }
  const copy = [...questions];
  const tmp = copy[index];
  const swap = copy[nextIndex];
  if (!tmp || !swap) return questions;
  copy[index] = swap;
  copy[nextIndex] = tmp;
  return renumberQuestions(copy);
}

export function removeQuestionById(
  questions: ExamQuestion[],
  id: string,
): ExamQuestion[] {
  return renumberQuestions(questions.filter((question) => question.id !== id));
}
