const OPENAI_MODELS_URL = "https://api.openai.com/v1/models";

export type ApiKeyErrorCode = "empty" | "format" | "auth" | "http" | "network";

export type ValidateApiKeyResult =
  | { ok: true }
  | { ok: false; code: ApiKeyErrorCode };

function looksLikeOpenAiSecret(key: string): boolean {
  const k = key.trim();
  return k.startsWith("sk-") && k.length >= 20;
}

/** Lightweight check: GET /v1/models (browser call; may fail due to network/CORS policies). */
export async function validateOpenAiApiKey(
  apiKey: string,
): Promise<ValidateApiKeyResult> {
  const key = apiKey.trim();
  if (!key) {
    return { ok: false, code: "empty" };
  }
  if (!looksLikeOpenAiSecret(key)) {
    return { ok: false, code: "format" };
  }

  try {
    const response = await fetch(OPENAI_MODELS_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

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
