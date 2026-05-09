export type SubmissionFileKind = "image" | "pdf" | "text" | "attachment";

/** Whole-exam attachments vs one slice per exam question. */
export type SubmissionLayoutMode = "combined" | "per_question";

/** Saved pasted answer for a single question (per-question layout). */
export interface QuestionAnswerDraft {
  pastedText?: string;
}

/** Lightweight reference stored in session JSON; binary lives in IndexedDB. */
export interface SubmissionFileRef {
  id: string;
  kind: SubmissionFileKind;
  originalName: string;
  mimeType: string;
  size: number;
  /** When set, this file belongs to that exam question's answer (per-question layout). */
  questionId?: string;
}

export interface Submission {
  id: string;
  sessionId: string;
  participantId: string;
  /** Combined layout: learner paste for the whole attempt. Ignored when layout is per_question. */
  pastedText?: string;
  files: SubmissionFileRef[];
  /** Defaults to combined-style grading when omitted (legacy sessions). */
  layout?: SubmissionLayoutMode;
  /** Per-question pasted answers when layout is per_question. */
  answersByQuestionId?: Record<string, QuestionAnswerDraft>;
  updatedAt: string;
}
