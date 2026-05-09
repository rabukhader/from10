import { appConfig } from "@/src/config";

import {
  CHAT_RETRY_EMPTY_ASSISTANT_MESSAGE,
  CHAT_RETRY_JSON_PARSE_MESSAGE,
} from "./prompts/chat-completion-shared-copy";
import {
  EXAM_FROM_IMAGES_SYSTEM_PROMPT,
  buildExamExtractionRetryUserMessage,
  buildExamFromImagesUserTextIntro,
} from "./prompts/exam-from-images-prompt";
import type { ExamPrimaryLanguage, ExamQuestion } from "@/src/domain";

import { parseJsonFromModelContent } from "./validate-ai-grading-response";
import { validateExamExtractionResponse } from "./validate-exam-extraction-response";

type VisionContentPart =
  | { type: "text"; text: string }
  | {
      type: "image_url";
      image_url: { url: string; detail?: "auto" | "low" | "high" };
    };

type ChatMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string | VisionContentPart[] }
  | { role: "assistant"; content: string };

type ChatCompletionResponse = {
  choices?: ReadonlyArray<{
    message?: { content?: string | null };
  }>;
  error?: { message?: string };
};

function extractAssistantContent(payload: ChatCompletionResponse): string {
  const content = payload.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : "";
}

export async function extractExamFromImagesWithOpenAi(params: {
  apiKey: string;
  /** Data URLs or remote URLs readable by OpenAI (browser uses data URLs). */
  imageUrls: string[];
  localeHint?: string;
  examPrimaryLanguage?: ExamPrimaryLanguage;
}): Promise<
  | { ok: true; questions: ExamQuestion[]; attemptsUsed: number }
  | { ok: false; message: string; attemptsUsed: number }
> {
  const { apiKey, imageUrls, localeHint, examPrimaryLanguage } = params;
  const maxRetries = appConfig.openAi.maxJsonRetries;
  const model = appConfig.openAi.examExtractionModel;
  const url = appConfig.openAi.chatCompletionsUrl;

  const userParts: VisionContentPart[] = [
    {
      type: "text",
      text: buildExamFromImagesUserTextIntro({
        localeHint,
        imageCount: imageUrls.length,
        examPrimaryLanguage,
      }),
    },
    ...imageUrls.map(
      (href): VisionContentPart => ({
        type: "image_url",
        image_url: { url: href, detail: "high" },
      }),
    ),
  ];

  const messages: ChatMessage[] = [
    { role: "system", content: EXAM_FROM_IMAGES_SYSTEM_PROMPT },
    { role: "user", content: userParts },
  ];

  let lastAssistantContent = "";
  let lastErrorSummary = "";

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    if (attempt > 0) {
      messages.push({
        role: "assistant",
        content: lastAssistantContent,
      });
      messages.push({
        role: "user",
        content: buildExamExtractionRetryUserMessage(lastErrorSummary),
      });
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.1,
          response_format: { type: "json_object" },
          messages,
        }),
      });
    } catch {
      return {
        ok: false,
        message: "Network error calling OpenAI.",
        attemptsUsed: attempt + 1,
      };
    }

    const payload = (await response.json()) as ChatCompletionResponse;

    if (!response.ok) {
      const apiMessage =
        typeof payload.error?.message === "string"
          ? payload.error.message
          : response.statusText;
      return {
        ok: false,
        message: `OpenAI error (${response.status}): ${apiMessage}`,
        attemptsUsed: attempt + 1,
      };
    }

    lastAssistantContent = extractAssistantContent(payload);
    if (!lastAssistantContent.trim()) {
      lastErrorSummary = CHAT_RETRY_EMPTY_ASSISTANT_MESSAGE;
      continue;
    }

    let parsed: unknown;
    try {
      parsed = parseJsonFromModelContent(lastAssistantContent);
    } catch {
      lastErrorSummary = CHAT_RETRY_JSON_PARSE_MESSAGE;
      continue;
    }

    const validated = validateExamExtractionResponse(parsed);
    if (validated.ok) {
      return {
        ok: true,
        questions: validated.questions,
        attemptsUsed: attempt + 1,
      };
    }

    lastErrorSummary = validated.errors.map((e) => `- ${e}`).join("\n");
  }

  return {
    ok: false,
    message: lastErrorSummary || "Model returned invalid JSON after retries.",
    attemptsUsed: maxRetries + 1,
  };
}
