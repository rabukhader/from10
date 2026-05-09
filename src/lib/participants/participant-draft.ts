import type { Participant, ParticipantGradingStatus } from "@/src/domain";

function newParticipantId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createDraftParticipant(
  sessionId: string,
  fields: Readonly<{
    name?: string;
    universityId?: string;
    email?: string;
    section?: string;
    notes?: string;
    gradingStatus?: ParticipantGradingStatus;
  }>,
): Participant {
  const now = new Date().toISOString();

  return {
    id: newParticipantId(),
    sessionId,
    name: fields.name?.trim() ? fields.name.trim() : undefined,
    universityId: fields.universityId?.trim()
      ? fields.universityId.trim()
      : undefined,
    email: fields.email?.trim() ? fields.email.trim() : undefined,
    section: fields.section?.trim() ? fields.section.trim() : undefined,
    notes: fields.notes?.trim() ? fields.notes.trim() : undefined,
    gradingStatus: fields.gradingStatus ?? "pending",
    createdAt: now,
    updatedAt: now,
  };
}
