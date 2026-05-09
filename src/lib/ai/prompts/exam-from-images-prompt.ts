/**
 * Prompts used when asking OpenAI to reconstruct exam questions from images or scans.
 * Kept in a dedicated module so tone and instructions stay easy to revise without touching API wiring.
 */

import type { ExamPrimaryLanguage } from "@/src/domain";
import { normalizeExamPrimaryLanguage } from "@/src/domain";

/** Short system role: warm, precise, safety-conscious for classroom use. */
export const EXAM_FROM_IMAGES_SYSTEM_PROMPT = [
  "You are an experienced instructor assistant helping digitize paper exams.",
  "Your job is to read the attached exam pages carefully and produce structured data an educator can edit later.",
  "Be faithful to what is printed: copy wording closely for stems, prompts, rubrics, and mark allocations.",
  "Never invent questions, numbers, or rubric rows that do not appear on the pages; if a region is unreadable, omit or shorten that field and mention uncertainty in notes.",
  "If handwriting or blur makes something unclear, make your best interpretation and mention uncertainty briefly in that question's notes field — never invent strict grading rules that are not implied by the document.",
  "Respond with a single JSON object only — no markdown, no code fences, no commentary outside JSON.",
].join(" ");

/**
 * User message fragment describing the exact JSON shape expected by our validator.
 * Appended after any locale-specific hint from the UI.
 */
export const EXAM_FROM_IMAGES_JSON_INSTRUCTION = [
  "Return JSON with this shape:",
  '{ "questions": [',
  "  {",
  '    "title": string (short label, e.g. "Question 3 — Thermodynamics"),',
  '    "body": string (full stem / prompt shown to the student),',
  '    "type": one of "multiple_choice" | "short_answer" | "long_answer" | "code" | "mixed" | "file_based",',
  '    "totalMark": positive integer — total marks for this question,',
  '    "notes": optional string — clarifications for graders,',
  '    "modelAnswer": optional string — exemplar or marking guidance if visible on the sheet,',
  '    "criteria": [',
  "      {",
  '        "title": string (short rubric heading),',
  '        "description": string (what earns credit),',
  '        "mark": non-negative integer — points for this row',
  "      }",
  "    ]",
  "  }",
  "] }",
  "Rules:",
  "- Emit one array entry per numbered question or clearly separated prompt on the pages.",
  "- Each question MUST include at least one criterion with title, description, and mark.",
  "- Write criterion descriptions so a grader can award partial credit objectively (what earns full vs partial marks).",
  "- Sum of criteria[].mark MUST equal totalMark for that question.",
  "- Choose the closest type: short_answer for brief responses, long_answer for essays, multiple_choice only if options are visible.",
  "- Preserve order as it appears on the exam (top to bottom).",
].join("\n");

/** Used when the UI does not pass a locale hint for extraction. */
export const EXAM_FROM_IMAGES_DEFAULT_LOCALE_HINT =
  "The exam content may be English or Arabic; preserve the language you see on the pages.";

const EXTRACTION_LANGUAGE_DIRECTIVES: Record<
  ExamPrimaryLanguage,
  string | null
> = {
  auto: null,
  en: "Exam language setting: English — transcribe stems and rubrics in English when that matches the scan; if a section is clearly written in another language, preserve that language verbatim.",
  ar: "Exam language setting: Arabic — transcribe stems and rubrics in Arabic when that matches the scan; if a section is clearly written in another language, preserve that language verbatim.",
  fr: "Exam language setting: French — transcribe stems and rubrics in French when that matches the scan; if a section is clearly written in another language, preserve that language verbatim.",
  mixed:
    "Exam language setting: bilingual / mixed — preserve each phrase in the language printed on the page; do not normalize the whole exam into one language.",
};

/** First text chunk of the extraction user message (before image parts). */
export function buildExamFromImagesUserTextIntro(params: {
  localeHint?: string;
  imageCount: number;
  examPrimaryLanguage?: ExamPrimaryLanguage;
}): string {
  const lang = normalizeExamPrimaryLanguage(params.examPrimaryLanguage);
  const directive = EXTRACTION_LANGUAGE_DIRECTIVES[lang];
  const intro =
    params.localeHint?.trim() || EXAM_FROM_IMAGES_DEFAULT_LOCALE_HINT;

  const preamble = [directive, intro].filter(Boolean).join("\n\n");

  return [
    preamble,
    "",
    EXAM_FROM_IMAGES_JSON_INSTRUCTION,
    "",
    `Attached ${params.imageCount} image(s) of the exam.`,
  ].join("\n");
}

/** User follow-up when extraction JSON fails validation. */
export function buildExamExtractionRetryUserMessage(
  errorSummary: string,
): string {
  return [
    "Your previous reply was not valid for our schema.",
    errorSummary.trim(),
    "Respond again with corrected JSON only — same structure as requested.",
    "Do not invent unseen questions or marks; transcribe only what the pages support.",
  ].join("\n\n");
}
