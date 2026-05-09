/**
 * Markdown snippets embedded in the **learner submission** section of grading prompts
 * (built from pasted text, attachments, and vision slots).
 */

export const SUBMISSION_PROMPT_EMPTY_RECORDED = "(No submission recorded yet.)";

export const SUBMISSION_PROMPT_EMPTY_CONTENT = "(Empty submission.)";

export const SUBMISSION_HEADING_PASTED = "## Pasted submission text";

export const SUBMISSION_HEADING_ATTACHMENTS = "## Attachments summary";

export const SUBMISSION_HEADING_VISUAL = "## Visual submission";

export function submissionTruncationSuffix(maxChars: number): string {
  return `\n\n[Truncated after ${maxChars} characters.]`;
}

export function submissionVisualBody(pageCount: number): string {
  return (
    `${pageCount} page image(s) are attached separately for vision review ` +
    "(immediately after the grading instructions in the chat). " +
    "Cross-check them with pasted text and attachment extracts; handwritten work may appear only in images."
  );
}

export function submissionMergedAnswerBlock(questionId: string): string {
  return `### Answer (${questionId})`;
}

export function submissionFileLineMissing(params: {
  originalName: string;
  mimeType: string;
  size: number;
}): string {
  const { originalName, mimeType, size } = params;
  return `- ${originalName} (${mimeType}, ${size} bytes) — stored file missing locally.`;
}

export function submissionFileLineVisionIncluded(params: {
  originalName: string;
  mimeType: string;
}): string {
  return `- ${params.originalName} (${params.mimeType}) — included as an image for vision grading.`;
}

export function submissionFileLineImageReadFailed(params: {
  originalName: string;
  mimeType: string;
}): string {
  return `- ${params.originalName} (${params.mimeType}) — could not read image bytes.`;
}

export function submissionFileLinePdfRasterized(params: {
  originalName: string;
  mimeType: string;
  pageCount: number;
}): string {
  return `- ${params.originalName} (${params.mimeType}) — ${params.pageCount} page(s) rasterized for vision grading.`;
}

export function submissionFileLinePdfRasterFailed(params: {
  originalName: string;
  mimeType: string;
}): string {
  return `- ${params.originalName} (${params.mimeType}) — PDF could not be rasterized in this browser.`;
}

export function submissionAttachmentExtractBlock(params: {
  originalName: string;
  mimeType: string;
  clippedText: string;
}): string {
  return `### Attachment: ${params.originalName}\n(${params.mimeType})\n\n${params.clippedText}`;
}

export function submissionFileLineTextReadFailed(params: {
  originalName: string;
  mimeType: string;
}): string {
  return `- ${params.originalName} (${params.mimeType}) — could not read as text.`;
}

export function submissionFileLineUnsupportedBinary(params: {
  originalName: string;
  mimeType: string;
  size: number;
}): string {
  return `- ${params.originalName} (${params.mimeType}, ${params.size} bytes) — not used for AI grading (upload images, PDF, or text files).`;
}
