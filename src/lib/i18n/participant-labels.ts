import type { ParticipantGradingStatus } from "@/src/domain";

import type { MessageKey } from "./messages";
import type { Translate } from "./preference-labels";

const STATUS_LABELS: Record<ParticipantGradingStatus, MessageKey> = {
  pending: "participant.status.pending",
  in_progress: "participant.status.in_progress",
  completed: "participant.status.completed",
};

export function labelParticipantGradingStatus(
  t: Translate,
  status: ParticipantGradingStatus,
): string {
  return t(STATUS_LABELS[status]);
}
