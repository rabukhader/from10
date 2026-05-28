import { describe, expect, it } from "vitest";

import {
  buildOpenAiCompatibleUrl,
  isValidOpenAiCompatibleBaseUrl,
  normalizeOpenAiCompatibleBaseUrl,
} from "./openai-compatible";

describe("OpenAI-compatible endpoint helpers", () => {
  it("normalizes provider base URLs", () => {
    expect(normalizeOpenAiCompatibleBaseUrl("https://api.openai.com/v1/")).toBe(
      "https://api.openai.com/v1",
    );
    expect(
      normalizeOpenAiCompatibleBaseUrl(
        "https://api.deepseek.com/chat/completions",
      ),
    ).toBe("https://api.deepseek.com");
    expect(
      normalizeOpenAiCompatibleBaseUrl("https://example.com/v1/models"),
    ).toBe("https://example.com/v1");
  });

  it("builds provider endpoint URLs", () => {
    expect(
      buildOpenAiCompatibleUrl("https://api.deepseek.com/", "/chat/completions"),
    ).toBe("https://api.deepseek.com/chat/completions");
  });

  it("requires an http or https URL", () => {
    expect(isValidOpenAiCompatibleBaseUrl("https://api.deepseek.com")).toBe(
      true,
    );
    expect(isValidOpenAiCompatibleBaseUrl("not-a-url")).toBe(false);
  });
});
