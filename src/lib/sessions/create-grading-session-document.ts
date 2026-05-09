import type {
  ExamSetup,
  GradingSessionDocument,
  InstructorPreferences,
} from "@/src/domain";
import { GRADING_SESSION_DOCUMENT_VERSION } from "@/src/domain";

function newSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createGradingSessionDocument(params: {
  exam: ExamSetup;
  preferences: InstructorPreferences;
  now?: string;
  id?: string;
}): GradingSessionDocument {
  const now = params.now ?? new Date().toISOString();

  return {
    id: params.id ?? newSessionId(),
    version: GRADING_SESSION_DOCUMENT_VERSION,
    exam: params.exam,
    preferences: params.preferences,
    questions: [],
    participants: [],
    submissionsByParticipantId: {},
    gradingByParticipantId: {},
    createdAt: now,
    updatedAt: now,
  };
}
