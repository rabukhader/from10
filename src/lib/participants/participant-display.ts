import type { Participant } from "@/src/domain";

export function participantHasIdentity(participant: Participant): boolean {
  const name = participant.name?.trim();
  const universityId = participant.universityId?.trim();
  const email = participant.email?.trim();
  return Boolean(name || universityId || email);
}

/** Prefer display name, then university ID, then email. */
export function participantPrimaryLabel(participant: Participant): string {
  const name = participant.name?.trim();
  if (name) return name;
  const universityId = participant.universityId?.trim();
  if (universityId) return universityId;
  const email = participant.email?.trim();
  if (email) return email;
  return "";
}
