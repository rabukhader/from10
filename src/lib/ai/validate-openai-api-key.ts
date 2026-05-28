import { appConfig } from "@/src/config";

import {
  buildOpenAiCompatibleUrl,
  isValidOpenAiCompatibleBaseUrl,
  normalizeOpenAiCompatibleBaseUrl,
} from "./openai-compatible";

export type ApiKeyErrorCode =
  | "empty"
  | "format"
  | "base_url"
  | "model"
  | "auth"
  | "http"
  | "network";

export type ValidateApiKeyResult =
  | { ok: true }
  | { ok: false; code: ApiKeyErrorCode };

/** Lightweight check: GET /models against any OpenAI-compatible provider. */
export async function validateOpenAiApiKey(
  apiKey: string,
  options?: {
    baseUrl?: string;
    gradingModel?: string;
    examExtractionModel?: string;
  },
): Promise<ValidateApiKeyResult> {
  const key = apiKey.trim();
  if (!key) {
    return { ok: false, code: "empty" };
  }

  const baseUrl = normalizeOpenAiCompatibleBaseUrl(
    options?.baseUrl ?? appConfig.openAi.defaultBaseUrl,
  );
  if (!isValidOpenAiCompatibleBaseUrl(baseUrl)) {
    return { ok: false, code: "base_url" };
  }

  const gradingModel =
    options?.gradingModel?.trim() ?? appConfig.openAi.gradingModel;
  const examExtractionModel =
    options?.examExtractionModel?.trim() ?? appConfig.openAi.examExtractionModel;
  if (!gradingModel || !examExtractionModel) {
    return { ok: false, code: "model" };
  }

  try {
    const response = await fetch(
      buildOpenAiCompatibleUrl(baseUrl, appConfig.openAi.modelsPath),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${key}`,
        },
      },
    );

    if (response.ok) {
      return { ok: true };
    }

    if (response.status === 401 || response.status === 403) {
      return { ok: false, code: "auth" };
    }

    return { ok: false, code: "http" };
  } catch {
    return { ok: false, code: "network" };
  }
}
