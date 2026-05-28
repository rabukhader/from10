import type { ApiKeyErrorCode } from "@/src/lib/ai";

import type { MessageKey } from "./messages";

const ERROR_MAP: Record<ApiKeyErrorCode, MessageKey> = {
  empty: "apiKey.error.empty",
  format: "apiKey.error.format",
  base_url: "apiKey.error.baseUrl",
  model: "apiKey.error.model",
  auth: "apiKey.error.auth",
  http: "apiKey.error.http",
  network: "apiKey.error.network",
};

export function messageKeyForApiKeyError(code: ApiKeyErrorCode): MessageKey {
  return ERROR_MAP[code];
}
