export type ParticipantGradingStatus =
  | "pending"
  | "in_progress"
  | "completed";

/** At least one of name | universityId | email must be non-empty (enforced in UI/validators). */
export interface Participant {
  id: string;
  sessionId: string;
  name?: string;
  universityId?: string;
  email?: string;
  section?: string;
  notes?: string;
  gradingStatus: ParticipantGradingStatus;
  createdAt: string;
  updatedAt: string;
}
