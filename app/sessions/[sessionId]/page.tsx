"use client";

import { useParams } from "next/navigation";

import { SessionWorkspace } from "@/components/sessions/session-workspace";

export default function SessionWorkspacePage() {
  const params = useParams();
  const sessionId = typeof params.sessionId === "string" ? params.sessionId : "";

  return <SessionWorkspace sessionId={sessionId} />;
}
