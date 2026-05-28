import { STORAGE_PREFIX } from "./constants";

export const storageKeys = {
  sessionsIndex: `${STORAGE_PREFIX}:sessions`,
  session: (sessionId: string) => `${STORAGE_PREFIX}:session:${sessionId}`,
  llmCredentials: `${STORAGE_PREFIX}:llm-credentials`,
  /** Legacy key kept so existing browsers can migrate to `llmCredentials`. */
  openAiApiKey: `${STORAGE_PREFIX}:openai-api-key`,
} as const;
