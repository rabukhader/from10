import type { Submission } from "@/src/domain";

function newSubmissionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptySubmission(
  sessionId: string,
  participantId: string,
): Submission {
  const now = new Date().toISOString();
  return {
    id: newSubmissionId(),
    sessionId,
    participantId,
    files: [],
    updatedAt: now,
  };
}
