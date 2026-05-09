import type { Submission, SubmissionFileRef } from "@/src/domain";
import { appConfig } from "@/src/config";
import { getSubmissionFile } from "@/src/lib/storage";
import { renderPdfFileToJpegDataUrls } from "@/src/lib/pdf/render-pdf-pages-to-data-urls";

import {
  SUBMISSION_HEADING_ATTACHMENTS,
  SUBMISSION_HEADING_PASTED,
  SUBMISSION_HEADING_VISUAL,
  SUBMISSION_PROMPT_EMPTY_CONTENT,
  SUBMISSION_PROMPT_EMPTY_RECORDED,
  submissionAttachmentExtractBlock,
  submissionFileLineImageReadFailed,
  submissionFileLineMissing,
  submissionFileLinePdfRasterFailed,
  submissionFileLinePdfRasterized,
  submissionFileLineTextReadFailed,
  submissionFileLineUnsupportedBinary,
  submissionFileLineVisionIncluded,
  submissionMergedAnswerBlock,
  submissionTruncationSuffix,
  submissionVisualBody,
} from "./prompts/submission-context-prompts";

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}${submissionTruncationSuffix(max)}`;
}

function mayContainReadableText(mime: string, fileName: string): boolean {
  const m = mime.toLowerCase();
  if (m.startsWith("text/")) return true;
  const lower = fileName.toLowerCase();
  return (
    lower.endsWith(".txt") ||
    lower.endsWith(".md") ||
    lower.endsWith(".csv")
  );
}

const VISION_IMAGE_MIME = /^image\/(jpeg|png|webp|gif)$/i;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(blob);
  });
}

export type SubmissionAnswerContext = {
  /** Text block for the grading prompt (paste + text extracted from text-like files + attachment listing). */
  block: string;
  /** True when there is pasted text, extracted text from attachments, or vision-ready pages/images. */
  hasReadableAnswer: boolean;
  /** JPEG data URLs (submission photos + rasterized PDF pages) for multimodal grading. */
  visionImageUrls: string[];
};

async function assembleSubmissionAnswerContext(files: SubmissionFileRef[]): Promise<{
  suffixParts: string[];
  visionImageUrls: string[];
  extractedAttachment: boolean;
}> {
  const visionImageUrls: string[] = [];
  const fileLines: string[] = [];
  const maxVision = appConfig.ui.maxGradingVisionSlots;
  const maxPdfPages = appConfig.ui.maxGradingPdfPagesPerFile;
  let slotsLeft = maxVision;
  const maxPerFile = appConfig.ui.maxAttachmentTextCharacters;

  for (const ref of files) {
    const record = await getSubmissionFile(ref.id);
    if (!record?.blob) {
      fileLines.push(
        submissionFileLineMissing({
          originalName: ref.originalName,
          mimeType: ref.mimeType,
          size: ref.size,
        }),
      );
      continue;
    }

    const mime = ref.mimeType.trim().toLowerCase();
    const nameLower = ref.originalName.trim().toLowerCase();
    const isPdf =
      ref.kind === "pdf" ||
      mime === "application/pdf" ||
      nameLower.endsWith(".pdf");
    const isRasterImage =
      ref.kind === "image" || VISION_IMAGE_MIME.test(mime);

    if (slotsLeft > 0 && isRasterImage && VISION_IMAGE_MIME.test(mime)) {
      try {
        const dataUrl = await blobToDataUrl(record.blob);
        visionImageUrls.push(dataUrl);
        slotsLeft -= 1;
        fileLines.push(
          submissionFileLineVisionIncluded({
            originalName: ref.originalName,
            mimeType: ref.mimeType,
          }),
        );
      } catch {
        fileLines.push(
          submissionFileLineImageReadFailed({
            originalName: ref.originalName,
            mimeType: ref.mimeType,
          }),
        );
      }
      continue;
    }

    if (slotsLeft > 0 && isPdf) {
      try {
        const file = new File([record.blob], ref.originalName, {
          type: mime || "application/pdf",
        });
        const pageUrls = await renderPdfFileToJpegDataUrls(file, {
          maxPages: Math.min(maxPdfPages, slotsLeft),
        });
        for (const url of pageUrls) {
          if (slotsLeft <= 0) break;
          visionImageUrls.push(url);
          slotsLeft -= 1;
        }
        fileLines.push(
          submissionFileLinePdfRasterized({
            originalName: ref.originalName,
            mimeType: ref.mimeType,
            pageCount: pageUrls.length,
          }),
        );
      } catch {
        fileLines.push(
          submissionFileLinePdfRasterFailed({
            originalName: ref.originalName,
            mimeType: ref.mimeType,
          }),
        );
      }
      continue;
    }

    if (mayContainReadableText(ref.mimeType, ref.originalName)) {
      try {
        const text = await record.blob.text();
        const clipped = truncate(text, maxPerFile);
        fileLines.push(
          submissionAttachmentExtractBlock({
            originalName: ref.originalName,
            mimeType: ref.mimeType,
            clippedText: clipped,
          }),
        );
      } catch {
        fileLines.push(
          submissionFileLineTextReadFailed({
            originalName: ref.originalName,
            mimeType: ref.mimeType,
          }),
        );
      }
    } else if (!isPdf && !isRasterImage) {
      fileLines.push(
        submissionFileLineUnsupportedBinary({
          originalName: ref.originalName,
          mimeType: ref.mimeType,
          size: ref.size,
        }),
      );
    }
  }

  const extractedAttachment = fileLines.some((line) =>
    line.startsWith("### Attachment:"),
  );

  const suffixParts: string[] = [];
  if (fileLines.length > 0) {
    suffixParts.push(
      `${SUBMISSION_HEADING_ATTACHMENTS}\n\n${fileLines.join("\n\n")}`,
    );
  }
  if (visionImageUrls.length > 0) {
    suffixParts.push(
      `${SUBMISSION_HEADING_VISUAL}\n\n${submissionVisualBody(visionImageUrls.length)}`,
    );
  }

  return { suffixParts, visionImageUrls, extractedAttachment };
}

function mergePerQuestionPaste(submission: Submission): string | undefined {
  const entries = Object.entries(submission.answersByQuestionId ?? {});
  if (entries.length === 0) return undefined;
  const chunks = entries
    .map(([qid, ans]) => {
      const t = ans.pastedText?.trim();
      return t ? `### Answer (${qid})\n\n${t}` : "";
    })
    .filter(Boolean);
  const merged = chunks.join("\n\n").trim();
  return merged || undefined;
}

/**
 * Builds learner answer context for one grading call.
 * - Combined / legacy: pass questionId null — uses whole submission.
 * - Per-question layout: pass the exam question id — uses that slice only.
 */
export async function buildSubmissionAnswerContextForQuestion(params: {
  sessionId: string;
  participantId: string;
  submission: Submission | null;
  questionId: string | null;
}): Promise<SubmissionAnswerContext> {
  const { submission, questionId } = params;

  if (!submission) {
    return {
      block: SUBMISSION_PROMPT_EMPTY_RECORDED,
      hasReadableAnswer: false,
      visionImageUrls: [],
    };
  }

  const perQuestionLayout = submission.layout === "per_question";

  let pasted: string | undefined;
  let files: SubmissionFileRef[];

  if (!perQuestionLayout) {
    pasted = submission.pastedText?.trim();
    files = submission.files;
  } else if (questionId) {
    pasted = submission.answersByQuestionId?.[questionId]?.pastedText?.trim();
    files = submission.files.filter((f) => f.questionId === questionId);
  } else {
    pasted = mergePerQuestionPaste(submission);
    files = submission.files;
  }

  const parts: string[] = [];

  if (pasted) {
    parts.push(
      `${SUBMISSION_HEADING_PASTED}\n\n` +
        truncate(pasted, appConfig.ui.maxPasteCharacters),
    );
  }

  const { suffixParts, visionImageUrls, extractedAttachment } =
    await assembleSubmissionAnswerContext(files);

  parts.push(...suffixParts);

  const block =
    parts.length > 0 ? parts.join("\n\n") : SUBMISSION_PROMPT_EMPTY_CONTENT;

  const hasReadableAnswer =
    Boolean(pasted) || extractedAttachment || visionImageUrls.length > 0;

  return { block, hasReadableAnswer, visionImageUrls };
}

/** Full submission context (combined / legacy). See {@link buildSubmissionAnswerContextForQuestion} for per-question slices. */
export async function buildSubmissionAnswerContext(params: {
  sessionId: string;
  participantId: string;
  submission: Submission | null;
}): Promise<SubmissionAnswerContext> {
  return buildSubmissionAnswerContextForQuestion({
    ...params,
    questionId: null,
  });
}
