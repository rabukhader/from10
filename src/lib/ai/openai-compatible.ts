import { appConfig } from "@/src/config";

export type OpenAiCompatibleProviderPresetId =
  | "openai"
  | "deepseek"
  | "custom";

export type OpenAiCompatibleModelSettings = {
  baseUrl: string;
  gradingModel: string;
  examExtractionModel: string;
};

export type OpenAiCompatibleProviderPreset =
  OpenAiCompatibleModelSettings & {
    id: OpenAiCompatibleProviderPresetId;
    label: string;
  };

export const OPENAI_COMPATIBLE_PROVIDER_PRESETS: readonly OpenAiCompatibleProviderPreset[] =
  [
    {
      id: "openai",
      label: "OpenAI",
      baseUrl: appConfig.openAi.defaultBaseUrl,
      gradingModel: appConfig.openAi.gradingModel,
      examExtractionModel: appConfig.openAi.examExtractionModel,
    },
    {
      id: "deepseek",
      label: "DeepSeek",
      baseUrl: "https://api.deepseek.com",
      gradingModel: "deepseek-v4-flash",
      examExtractionModel: "deepseek-v4-flash",
    },
    {
      id: "custom",
      label: "Custom",
      baseUrl: appConfig.openAi.defaultBaseUrl,
      gradingModel: appConfig.openAi.gradingModel,
      examExtractionModel: appConfig.openAi.examExtractionModel,
    },
  ];

export const DEFAULT_OPENAI_COMPATIBLE_SETTINGS =
  OPENAI_COMPATIBLE_PROVIDER_PRESETS[0];

export function providerPresetById(
  id: OpenAiCompatibleProviderPresetId,
): OpenAiCompatibleProviderPreset {
  return (
    OPENAI_COMPATIBLE_PROVIDER_PRESETS.find((preset) => preset.id === id) ??
    DEFAULT_OPENAI_COMPATIBLE_SETTINGS
  );
}

export function normalizeOpenAiCompatibleBaseUrl(raw: string): string {
  let value = raw.trim();
  while (value.endsWith("/")) {
    value = value.slice(0, -1);
  }

  value = value.replace(/\/chat\/completions$/i, "");
  value = value.replace(/\/models$/i, "");

  while (value.endsWith("/")) {
    value = value.slice(0, -1);
  }

  return value;
}

export function isValidOpenAiCompatibleBaseUrl(raw: string): boolean {
  const value = normalizeOpenAiCompatibleBaseUrl(raw);
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function buildOpenAiCompatibleUrl(
  baseUrl: string,
  path: string,
): string {
  const normalizedBase = normalizeOpenAiCompatibleBaseUrl(baseUrl);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
