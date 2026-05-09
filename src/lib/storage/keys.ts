import { STORAGE_PREFIX } from "./constants";

export const storageKeys = {
  sessionsIndex: `${STORAGE_PREFIX}:sessions`,
  session: (sessionId: string) => `${STORAGE_PREFIX}:session:${sessionId}`,
  openAiApiKey: `${STORAGE_PREFIX}:openai-api-key`,
} as const;
