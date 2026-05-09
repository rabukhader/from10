import type { AiCriterionGrade, AiGradingResponse, ExamQuestion } from "@/src/domain";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type AiParseResult =
  | { ok: true; data: AiGradingResponse }
  | { ok: false; errors: string[] };

export function parseJsonFromModelContent(raw: string): unknown {
  const trimmed = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/im.exec(trimmed);
  const payload = fence ? fence[1]?.trim() ?? "" : trimmed;
  return JSON.parse(payload) as unknown;
}

export function validateAiGradingResponse(
  parsed: unknown,
  question: ExamQuestion,
): AiParseResult {
  const errors: string[] = [];

  if (!isRecord(parsed)) {
    return { ok: false, errors: ["Root JSON must be an object."] };
  }

  const totalAwardedMark = parsed.totalAwardedMark;
  if (
    typeof totalAwardedMark !== "number" ||
    !Number.isFinite(totalAwardedMark) ||
    !Number.isInteger(totalAwardedMark)
  ) {
    errors.push("totalAwardedMark must be a finite integer.");
  } else if (totalAwardedMark < 0 || totalAwardedMark > question.totalMark) {
    errors.push(
      `totalAwardedMark must be between 0 and ${question.totalMark} inclusive.`,
    );
  }

  const gradesRaw = parsed.criterionGrades;
  if (!Array.isArray(gradesRaw)) {
    errors.push("criterionGrades must be an array.");
  }

  const feedback = parsed.feedback;
  if (typeof feedback !== "string") {
    errors.push("feedback must be a string.");
  }

  let overallFeedback: string | undefined;
  if (parsed.overallFeedback !== undefined) {
    if (typeof parsed.overallFeedback !== "string") {
      errors.push("overallFeedback must be a string when present.");
    } else {
      overallFeedback = parsed.overallFeedback;
    }
  }

  if (errors.length > 0 || !Array.isArray(gradesRaw)) {
    return { ok: false, errors };
  }

  if (gradesRaw.length !== question.criteria.length) {
    errors.push(
      `criterionGrades must have ${question.criteria.length} entries (got ${gradesRaw.length}).`,
    );
  }

  const expectedIds = new Set(question.criteria.map((c) => c.id));
  const seen = new Set<string>();
  const typedGrades: AiCriterionGrade[] = [];

  for (const entry of gradesRaw) {
    if (!isRecord(entry)) {
      errors.push("Each criterion grade must be an object.");
      continue;
    }
    const criterionId = entry.criterionId;
    const awardedMark = entry.awardedMark;
    const reasoning = entry.reasoning;

    if (typeof criterionId !== "string" || !expectedIds.has(criterionId)) {
      errors.push(`Unknown or duplicate criterionId: ${String(criterionId)}`);
      continue;
    }
    if (seen.has(criterionId)) {
      errors.push(`Duplicate criterionId in output: ${criterionId}`);
      continue;
    }
    seen.add(criterionId);

    if (
      typeof awardedMark !== "number" ||
      !Number.isFinite(awardedMark) ||
      !Number.isInteger(awardedMark)
    ) {
      errors.push(`Invalid awardedMark for ${criterionId}.`);
      continue;
    }

    const maxForCriterion =
      question.criteria.find((c) => c.id === criterionId)?.mark ?? 0;
    if (awardedMark < 0 || awardedMark > maxForCriterion) {
      errors.push(
        `awardedMark for ${criterionId} must be 0..${maxForCriterion}.`,
      );
    }

    if (typeof reasoning !== "string") {
      errors.push(`reasoning for ${criterionId} must be a string.`);
      continue;
    }

    typedGrades.push({ criterionId, awardedMark, reasoning });
  }

  for (const id of expectedIds) {
    if (!seen.has(id)) {
      errors.push(`Missing criterion grade for id ${id}.`);
    }
  }

  if (
    typeof totalAwardedMark === "number" &&
    Number.isInteger(totalAwardedMark) &&
    typedGrades.length === question.criteria.length &&
    errors.length === 0
  ) {
    const sum = typedGrades.reduce((s, g) => s + g.awardedMark, 0);
    if (sum !== totalAwardedMark) {
      errors.push(
        `Sum of criterion marks (${sum}) must equal totalAwardedMark (${totalAwardedMark}).`,
      );
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const data: AiGradingResponse = {
    totalAwardedMark: totalAwardedMark as number,
    criterionGrades: typedGrades,
    feedback: feedback as string,
    overallFeedback,
  };

  return { ok: true, data };
}
