/** Parsed shape expected from the model (structured JSON only). */
export interface AiCriterionGrade {
  criterionId: string;
  awardedMark: number;
  reasoning: string;
}

export interface AiGradingResponse {
  totalAwardedMark: number;
  criterionGrades: AiCriterionGrade[];
  feedback: string;
  overallFeedback?: string;
}

export type GradingSnapshotSource = "ai" | "manual" | "mixed";

/** One criterion line persisted after AI and/or manual edits. */
export interface CriterionGradingSnapshot {
  criterionId: string;
  awardedMark: number;
  maxMark: number;
  reasoning?: string;
}

/** Persisted result for a single question for one participant. */
export interface QuestionGradingSnapshot {
  questionId: string;
  totalAwardedMark: number;
  maxMark: number;
  criteria: CriterionGradingSnapshot[];
  feedback: string;
  /** ISO timestamp when this snapshot was last saved. */
  gradedAt: string;
  source: GradingSnapshotSource;
}

/** Aggregate grading state for one participant within a session. */
export interface ParticipantGradingResult {
  participantId: string;
  sessionId: string;
  questionGrades: Record<string, QuestionGradingSnapshot>;
  overallFeedback?: string;
  totalScore: number;
  /** ISO timestamp of last grading edit. */
  updatedAt: string;
}
