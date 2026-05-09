import { openDB, type DBSchema, type IDBPDatabase } from "idb";

import { IDB_NAME, IDB_VERSION } from "./constants";

/** Binary payload + ids for submission uploads (MVP). */
export interface SubmissionFileRecord {
  id: string;
  sessionId: string;
  participantId: string;
  fileName: string;
  mimeType: string;
  size: number;
  blob: Blob;
  createdAt: string;
}

interface From10DbSchema extends DBSchema {
  submissionFiles: {
    key: string;
    value: SubmissionFileRecord;
    indexes: {
      bySession: string;
      bySessionParticipant: [string, string];
    };
  };
}

let dbPromise: Promise<IDBPDatabase<From10DbSchema>> | null = null;

export function hasIndexedDb(): boolean {
  return typeof indexedDB !== "undefined";
}

export function getSubmissionDb(): Promise<IDBPDatabase<From10DbSchema>> {
  if (!hasIndexedDb()) {
    return Promise.reject(
      new Error("IndexedDB is not available in this environment."),
    );
  }

  if (!dbPromise) {
    dbPromise = openDB<From10DbSchema>(IDB_NAME, IDB_VERSION, {
      upgrade(db) {
        if (db.objectStoreNames.contains("submissionFiles")) return;

        const store = db.createObjectStore("submissionFiles", {
          keyPath: "id",
        });
        store.createIndex("bySession", "sessionId");
        store.createIndex("bySessionParticipant", [
          "sessionId",
          "participantId",
        ]);
      },
    });
  }

  return dbPromise;
}

export async function putSubmissionFile(
  record: SubmissionFileRecord,
): Promise<void> {
  const db = await getSubmissionDb();
  await db.put("submissionFiles", record);
}

export async function getSubmissionFile(
  id: string,
): Promise<SubmissionFileRecord | undefined> {
  const db = await getSubmissionDb();
  return db.get("submissionFiles", id);
}

export async function deleteSubmissionFile(id: string): Promise<void> {
  const db = await getSubmissionDb();
  await db.delete("submissionFiles", id);
}

export async function listSubmissionFilesForParticipant(
  sessionId: string,
  participantId: string,
): Promise<SubmissionFileRecord[]> {
  const db = await getSubmissionDb();
  return db.getAllFromIndex(
    "submissionFiles",
    "bySessionParticipant",
    IDBKeyRange.only([sessionId, participantId]),
  );
}

export async function deleteSubmissionFilesForParticipant(
  sessionId: string,
  participantId: string,
): Promise<void> {
  const db = await getSubmissionDb();
  const tx = db.transaction("submissionFiles", "readwrite");
  const keys = await tx.store
    .index("bySessionParticipant")
    .getAllKeys([sessionId, participantId]);

  await Promise.all(keys.map((key) => tx.store.delete(key)));
  await tx.done;
}

export async function deleteSubmissionFilesForSession(
  sessionId: string,
): Promise<void> {
  const db = await getSubmissionDb();
  const tx = db.transaction("submissionFiles", "readwrite");
  const keys = await tx.store.index("bySession").getAllKeys(sessionId);
  await Promise.all(keys.map((key) => tx.store.delete(key)));
  await tx.done;
}
