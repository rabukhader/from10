"use client";

import { useParams } from "next/navigation";

import { ParticipantWorkspace } from "@/components/participants/participant-workspace";

export default function ParticipantWorkspacePage() {
  const params = useParams();
  const sessionId =
    typeof params.sessionId === "string" ? params.sessionId : "";
  const participantId =
    typeof params.participantId === "string" ? params.participantId : "";

  return (
    <ParticipantWorkspace sessionId={sessionId} participantId={participantId} />
  );
}
