import type { AiGradingResponse, ExamQuestion } from "@/src/domain";
import { appConfig } from "@/src/config";
import {
  CHAT_RETRY_EMPTY_ASSISTANT_MESSAGE,
  CHAT_RETRY_JSON_PARSE_MESSAGE,
} from "./prompts/chat-completion-shared-copy";
import { buildGradingRetryUserMessage } from "./prompts/grading-retry-user-prompt";
import { GRADING_SYSTEM_PROMPT } from "./prompts/grading-system-prompt";
import {
  parseJsonFromModelContent,
  validateAiGradingResponse,
} from "./validate-ai-grading-response";

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

export type GradeQuestionOutcome =
  | { ok: true; response: AiGradingResponse; attemptsUsed: number }
  | { ok: false; message: string; attemptsUsed: number };

export async function gradeQuestionWithOpenAi(params: {
  apiKey: string;
  question: ExamQuestion;
  userPrompt: string;
  /** Optional JPEG/PNG/WebP/GIF data URLs + rasterized PDF pages for multimodal grading. */
  visionImageUrls?: readonly string[];
}): Promise<GradeQuestionOutcome> {
  const { apiKey, question, userPrompt, visionImageUrls } = params;
  const maxRetries = appConfig.openAi.maxJsonRetries;
  const model = appConfig.openAi.gradingModel;
  const url = appConfig.openAi.chatCompletionsUrl;

  const visuals =
    visionImageUrls?.filter((u) => typeof u === "string" && u.length > 0) ??
    [];

  const initialUserContent: string | VisionContentPart[] =
    visuals.length > 0
      ? [
          { type: "text", text: userPrompt },
          ...visuals.map(
            (href): VisionContentPart => ({
              type: "image_url",
              image_url: { url: href, detail: "high" },
            }),
          ),
        ]
      : userPrompt;

  const messages: ChatMessage[] = [
    { role: "system", content: GRADING_SYSTEM_PROMPT },
    { role: "user", content: initialUserContent },
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
        content: buildGradingRetryUserMessage(lastErrorSummary),
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
          temperature: 0.2,
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

    const validated = validateAiGradingResponse(parsed, question);
    if (validated.ok) {
      return {
        ok: true,
        response: validated.data,
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
