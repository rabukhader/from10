import type { Participant } from "@/src/domain";

import type { MessageKey } from "@/src/lib/i18n/messages";

export function validateParticipantIdentity(
  participant: Pick<Participant, "name" | "universityId" | "email">,
): MessageKey | null {
  const name = participant.name?.trim();
  const universityId = participant.universityId?.trim();
  const email = participant.email?.trim();
  if (name || universityId || email) return null;
  return "participant.validation.identityRequired";
}
