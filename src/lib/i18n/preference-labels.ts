import type {
  ExamLevel,
  FeedbackStyle,
  GradingStrictness,
  StudentLevel,
} from "@/src/domain";

import type { MessageKey } from "./messages";

export type Translate = (key: MessageKey) => string;

export function labelGradingStrictness(
  t: Translate,
  value: GradingStrictness,
): string {
  const map: Record<GradingStrictness, MessageKey> = {
    easy: "prefs.strictness.easy",
    balanced: "prefs.strictness.balanced",
    strict: "prefs.strictness.strict",
  };
  return t(map[value]);
}

export function labelStudentLevel(t: Translate, value: StudentLevel): string {
  const map: Record<StudentLevel, MessageKey> = {
    beginner: "prefs.student.beginner",
    intermediate: "prefs.student.intermediate",
    advanced: "prefs.student.advanced",
  };
  return t(map[value]);
}

export function labelExamLevelPreference(
  t: Translate,
  value: ExamLevel,
): string {
  const map: Record<ExamLevel, MessageKey> = {
    easy: "prefs.exam.easy",
    medium: "prefs.exam.medium",
    hard: "prefs.exam.hard",
  };
  return t(map[value]);
}

export function labelFeedbackStyle(
  t: Translate,
  value: FeedbackStyle,
): string {
  const map: Record<FeedbackStyle, MessageKey> = {
    short: "prefs.feedback.short",
    balanced: "prefs.feedback.balanced",
    detailed: "prefs.feedback.detailed",
  };
  return t(map[value]);
}
