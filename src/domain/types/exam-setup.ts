/** Primary language expectation for exam content and AI-written grading/extraction text. */
export type ExamPrimaryLanguage = "auto" | "en" | "ar" | "fr" | "mixed";

export function normalizeExamPrimaryLanguage(
  value: ExamPrimaryLanguage | undefined,
): ExamPrimaryLanguage {
  return value ?? "auto";
}

/** Metadata for one grading session / exam (exam setup step). */
export interface ExamSetup {
  examTitle: string;
  courseName: string;
  /** ISO 8601 date (calendar date or full datetime). */
  examDate: string;
  totalMarks: number;
  notes?: string;
  /** When omitted (legacy sessions), treated as `"auto"`. */
  primaryLanguage?: ExamPrimaryLanguage;
}
