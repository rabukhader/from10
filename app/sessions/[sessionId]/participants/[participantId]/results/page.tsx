"use client";

import { useParams } from "next/navigation";

import { ParticipantResultsScreen } from "@/components/results/participant-results-screen";

export default function ParticipantResultsPage() {
  const params = useParams();
  const sessionId =
    typeof params.sessionId === "string" ? params.sessionId : "";
  const participantId =
    typeof params.participantId === "string" ? params.participantId : "";

  return (
    <ParticipantResultsScreen
      sessionId={sessionId}
      participantId={participantId}
    />
  );
}
