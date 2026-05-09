import type { QuestionType } from "@/src/domain";

import type { MessageKey } from "./messages";
import type { Translate } from "./preference-labels";

const QUESTION_TYPE_LABELS: Record<QuestionType, MessageKey> = {
  multiple_choice: "question.type.multiple_choice",
  short_answer: "question.type.short_answer",
  long_answer: "question.type.long_answer",
  code: "question.type.code",
  mixed: "question.type.mixed",
  file_based: "question.type.file_based",
};

export const QUESTION_TYPES_ORDER: readonly QuestionType[] = [
  "multiple_choice",
  "short_answer",
  "long_answer",
  "code",
  "mixed",
  "file_based",
];

export function labelQuestionType(t: Translate, type: QuestionType): string {
  return t(QUESTION_TYPE_LABELS[type]);
}
