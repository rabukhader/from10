import type { GradingSessionDocument, SessionsIndex } from "@/src/domain";
import { normalizeSessionDocumentGrading } from "@/src/lib/grading";

import { storageKeys } from "./keys";
import {
  readJson,
  removeLocalStorageItem,
  writeJson,
} from "./local-storage";
import { deleteSubmissionFilesForSession } from "./indexed-db";

export function loadSessionsIndex(): SessionsIndex {
  return readJson<SessionsIndex>(storageKeys.sessionsIndex) ?? {
    sessionIds: [],
  };
}

export function saveSessionsIndex(index: SessionsIndex): void {
  writeJson(storageKeys.sessionsIndex, index);
}

export function loadSession(
  sessionId: string,
): GradingSessionDocument | null {
  const raw = readJson<GradingSessionDocument>(
    storageKeys.session(sessionId),
  );
  return raw ? normalizeSessionDocumentGrading(raw) : null;
}

/** Upserts session JSON and ensures its id appears in the sessions index. */
export function saveSession(doc: GradingSessionDocument): GradingSessionDocument {
  const normalized = normalizeSessionDocumentGrading(doc);
  writeJson(storageKeys.session(normalized.id), normalized);

  const index = loadSessionsIndex();
  if (!index.sessionIds.includes(normalized.id)) {
    saveSessionsIndex({
      ...index,
      sessionIds: [...index.sessionIds, normalized.id],
    });
  }
  return normalized;
}

/** Persists a session and pins it as “last active” for dashboard quick actions. */
export function saveSessionAndActivate(
  doc: GradingSessionDocument,
): GradingSessionDocument {
  const normalized = saveSession(doc);
  setLastActiveSessionId(normalized.id);
  return normalized;
}

export function setLastActiveSessionId(sessionId: string | undefined): void {
  const index = loadSessionsIndex();
  saveSessionsIndex({
    ...index,
    lastActiveSessionId: sessionId,
  });
}

export function removeSessionDocument(sessionId: string): void {
  removeLocalStorageItem(storageKeys.session(sessionId));

  const index = loadSessionsIndex();
  saveSessionsIndex({
    ...index,
    sessionIds: index.sessionIds.filter((id) => id !== sessionId),
    lastActiveSessionId:
      index.lastActiveSessionId === sessionId
        ? undefined
        : index.lastActiveSessionId,
  });
}

/** Removes session JSON from localStorage and deletes all submission blobs for that session in IndexedDB. */
export async function deleteSessionAndFiles(
  sessionId: string,
): Promise<void> {
  await deleteSubmissionFilesForSession(sessionId);
  removeSessionDocument(sessionId);
}
