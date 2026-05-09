import type { ExamQuestion, GradingCriterion, QuestionType } from "@/src/domain";

import { sanitizeExamQuestion } from "@/src/lib/questions/validate-exam-question";

import { createDraftQuestion } from "@/src/lib/sessions/question-draft";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const QUESTION_TYPES = new Set<QuestionType>([
  "multiple_choice",
  "short_answer",
  "long_answer",
  "code",
  "mixed",
  "file_based",
]);

function newCriterionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeType(raw: unknown): QuestionType {
  return typeof raw === "string" && QUESTION_TYPES.has(raw as QuestionType)
    ? (raw as QuestionType)
    : "short_answer";
}

export type ExamExtractionParseResult =
  | { ok: true; questions: ExamQuestion[] }
  | { ok: false; errors: string[] };

function parseOneQuestion(
  entry: unknown,
  index: number,
): { ok: true; question: ExamQuestion } | { ok: false; errors: string[] } {
  const prefix = `questions[${index}]`;
  const errors: string[] = [];

  if (!isRecord(entry)) {
    return { ok: false, errors: [`${prefix} must be an object.`] };
  }

  const title = entry.title;
  const body = entry.body;
  if (typeof title !== "string" || !title.trim()) {
    errors.push(`${prefix}.title must be a non-empty string.`);
  }
  if (typeof body !== "string") {
    errors.push(`${prefix}.body must be a string.`);
  }

  const totalMark = entry.totalMark;
  if (
    typeof totalMark !== "number" ||
    !Number.isFinite(totalMark) ||
    !Number.isInteger(totalMark) ||
    totalMark <= 0
  ) {
    errors.push(`${prefix}.totalMark must be a positive integer.`);
  }

  let notes: string | undefined;
  if (entry.notes !== undefined) {
    if (typeof entry.notes !== "string") {
      errors.push(`${prefix}.notes must be a string when present.`);
    } else {
      notes = entry.notes;
    }
  }

  let modelAnswer: string | undefined;
  if (entry.modelAnswer !== undefined) {
    if (typeof entry.modelAnswer !== "string") {
      errors.push(`${prefix}.modelAnswer must be a string when present.`);
    } else {
      modelAnswer = entry.modelAnswer;
    }
  }

  const criteriaRaw = entry.criteria;
  if (!Array.isArray(criteriaRaw) || criteriaRaw.length === 0) {
    errors.push(`${prefix}.criteria must be a non-empty array.`);
  }

  const type = normalizeType(entry.type);

  const criteria: GradingCriterion[] = [];
  let sum = 0;

  if (Array.isArray(criteriaRaw)) {
    criteriaRaw.forEach((row, j) => {
      const cp = `${prefix}.criteria[${j}]`;
      if (!isRecord(row)) {
        errors.push(`${cp} must be an object.`);
        return;
      }
      const ct = row.title;
      const cd = row.description;
      const cm = row.mark;
      if (typeof ct !== "string" || !ct.trim()) {
        errors.push(`${cp}.title must be a non-empty string.`);
      }
      if (typeof cd !== "string") {
        errors.push(`${cp}.description must be a string.`);
      }
      if (
        typeof cm !== "number" ||
        !Number.isFinite(cm) ||
        !Number.isInteger(cm) ||
        cm < 0
      ) {
        errors.push(`${cp}.mark must be a non-negative integer.`);
        return;
      }
      sum += cm;
      criteria.push({
        id: newCriterionId(),
        title: typeof ct === "string" ? ct.trim() : "",
        description: typeof cd === "string" ? cd.trim() : "",
        mark: cm,
      });
    });
  }

  if (
    typeof totalMark === "number" &&
    Number.isInteger(totalMark) &&
    criteria.length > 0 &&
    sum !== totalMark
  ) {
    errors.push(
      `${prefix}: sum of criterion marks (${sum}) must equal totalMark (${totalMark}).`,
    );
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const safeTitle = typeof title === "string" ? title.trim() : "";
  const safeBody = typeof body === "string" ? body.trim() : "";
  const safeTotal =
    typeof totalMark === "number" && Number.isInteger(totalMark)
      ? totalMark
      : 1;

  const draft = createDraftQuestion(0, {
    title: safeTitle || "Question 1",
    type,
    totalMark: safeTotal,
  });

  const merged: ExamQuestion = sanitizeExamQuestion({
    ...draft,
    questionNumber: 0,
    title: safeTitle || draft.title,
    body: safeBody,
    type,
    totalMark: safeTotal,
    notes,
    modelAnswer,
    criteria,
  });

  return { ok: true, question: merged };
}

export function validateExamExtractionResponse(
  parsed: unknown,
): ExamExtractionParseResult {
  if (!isRecord(parsed)) {
    return { ok: false, errors: ["Root JSON must be an object."] };
  }

  const rawQuestions = parsed.questions;
  if (!Array.isArray(rawQuestions)) {
    return { ok: false, errors: ['Missing or invalid "questions" array.'] };
  }

  if (rawQuestions.length === 0) {
    return { ok: false, errors: ["No questions were extracted from the files."] };
  }

  const errors: string[] = [];
  const questions: ExamQuestion[] = [];

  for (let i = 0; i < rawQuestions.length; i += 1) {
    const parsedOne = parseOneQuestion(rawQuestions[i], i);
    if (!parsedOne.ok) {
      errors.push(...parsedOne.errors);
      continue;
    }
    questions.push(parsedOne.question);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const renumbered = questions.map((question, index) => ({
    ...question,
    questionNumber: index + 1,
  }));

  return { ok: true, questions: renumbered };
}
