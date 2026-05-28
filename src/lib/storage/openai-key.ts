import { storageKeys } from "./keys";
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
} from "./local-storage";
import {
  DEFAULT_OPENAI_COMPATIBLE_SETTINGS,
  normalizeOpenAiCompatibleBaseUrl,
  type OpenAiCompatibleProviderPresetId,
} from "@/src/lib/ai/openai-compatible";

export type OpenAiCompatibleCredentials = {
  apiKey: string;
  baseUrl: string;
  gradingModel: string;
  examExtractionModel: string;
  providerPreset?: OpenAiCompatibleProviderPresetId;
};

function sanitizeCredentials(
  credentials: OpenAiCompatibleCredentials,
): OpenAiCompatibleCredentials | null {
  const apiKey = credentials.apiKey.trim();
  const baseUrl = normalizeOpenAiCompatibleBaseUrl(credentials.baseUrl);
  const gradingModel = credentials.gradingModel.trim();
  const examExtractionModel = credentials.examExtractionModel.trim();

  if (!apiKey || !baseUrl || !gradingModel || !examExtractionModel) {
    return null;
  }

  return {
    apiKey,
    baseUrl,
    gradingModel,
    examExtractionModel,
    providerPreset: credentials.providerPreset,
  };
}

function parseStoredCredentials(
  raw: string | null,
): OpenAiCompatibleCredentials | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<OpenAiCompatibleCredentials>;
    if (typeof parsed !== "object" || parsed === null) return null;
    return sanitizeCredentials({
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
      baseUrl:
        typeof parsed.baseUrl === "string"
          ? parsed.baseUrl
          : DEFAULT_OPENAI_COMPATIBLE_SETTINGS.baseUrl,
      gradingModel:
        typeof parsed.gradingModel === "string"
          ? parsed.gradingModel
          : DEFAULT_OPENAI_COMPATIBLE_SETTINGS.gradingModel,
      examExtractionModel:
        typeof parsed.examExtractionModel === "string"
          ? parsed.examExtractionModel
          : DEFAULT_OPENAI_COMPATIBLE_SETTINGS.examExtractionModel,
      providerPreset:
        parsed.providerPreset === "openai" ||
        parsed.providerPreset === "deepseek" ||
        parsed.providerPreset === "custom"
          ? parsed.providerPreset
          : undefined,
    });
  } catch {
    return null;
  }
}

export function getOpenAiCompatibleCredentials():
  | OpenAiCompatibleCredentials
  | null {
  const stored = parseStoredCredentials(
    getLocalStorageItem(storageKeys.llmCredentials),
  );
  if (stored) return stored;

  const legacyKey = getLocalStorageItem(storageKeys.openAiApiKey)?.trim();
  if (!legacyKey) return null;

  return {
    apiKey: legacyKey,
    baseUrl: DEFAULT_OPENAI_COMPATIBLE_SETTINGS.baseUrl,
    gradingModel: DEFAULT_OPENAI_COMPATIBLE_SETTINGS.gradingModel,
    examExtractionModel: DEFAULT_OPENAI_COMPATIBLE_SETTINGS.examExtractionModel,
    providerPreset: "openai",
  };
}

export function setOpenAiCompatibleCredentials(
  credentials: OpenAiCompatibleCredentials,
): void {
  const sanitized = sanitizeCredentials(credentials);
  if (!sanitized) {
    throw new Error("AI provider credentials are incomplete.");
  }
  setLocalStorageItem(
    storageKeys.llmCredentials,
    JSON.stringify(sanitized),
  );
  removeLocalStorageItem(storageKeys.openAiApiKey);
}

export function clearOpenAiCompatibleCredentials(): void {
  removeLocalStorageItem(storageKeys.llmCredentials);
  removeLocalStorageItem(storageKeys.openAiApiKey);
}

export function getOpenAiApiKey(): string | null {
  return getOpenAiCompatibleCredentials()?.apiKey ?? null;
}

export function setOpenAiApiKey(key: string): void {
  setOpenAiCompatibleCredentials({
    apiKey: key,
    baseUrl: DEFAULT_OPENAI_COMPATIBLE_SETTINGS.baseUrl,
    gradingModel: DEFAULT_OPENAI_COMPATIBLE_SETTINGS.gradingModel,
    examExtractionModel: DEFAULT_OPENAI_COMPATIBLE_SETTINGS.examExtractionModel,
    providerPreset: "openai",
  });
}

export function clearOpenAiApiKey(): void {
  clearOpenAiCompatibleCredentials();
}
