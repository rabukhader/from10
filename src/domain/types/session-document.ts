import type { ExamQuestion } from "./question";
import type { ExamSetup } from "./exam-setup";
import type { InstructorPreferences } from "./preferences";
import type { Participant } from "./participant";
import type { ParticipantGradingResult } from "./grading";
import type { Submission } from "./submission";

export const GRADING_SESSION_DOCUMENT_VERSION = 1 as const;

/** Full session persisted as JSON in localStorage (no file blobs). */
export interface GradingSessionDocument {
  id: string;
  version: typeof GRADING_SESSION_DOCUMENT_VERSION;
  exam: ExamSetup;
  preferences: InstructorPreferences;
  questions: ExamQuestion[];
  participants: Participant[];
  submissionsByParticipantId: Record<string, Submission>;
  gradingByParticipantId: Record<string, ParticipantGradingResult>;
  createdAt: string;
  updatedAt: string;
}

export interface SessionsIndex {
  sessionIds: string[];
  /** Last opened session for “continue” UX; optional. */
  lastActiveSessionId?: string;
}
