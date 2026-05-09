export type GradingStrictness = "easy" | "balanced" | "strict";

export type StudentLevel = "beginner" | "intermediate" | "advanced";

export type ExamLevel = "easy" | "medium" | "hard";

export type FeedbackStyle = "short" | "balanced" | "detailed";

/** Instructor tuning applied to AI prompts and UX defaults for a session. */
export interface InstructorPreferences {
  gradingStrictness: GradingStrictness;
  studentLevel: StudentLevel;
  examLevel: ExamLevel;
  feedbackStyle: FeedbackStyle;
}
