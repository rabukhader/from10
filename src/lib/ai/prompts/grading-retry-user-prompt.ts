/**
 * User follow-up when the grading model returns invalid JSON / schema.
 */

export function buildGradingRetryUserMessage(errorSummary: string): string {
  return [
    "Your previous reply was not valid.",
    errorSummary.trim(),
    "Respond again with corrected JSON only — same schema as requested.",
    "Reminder: include every rubric criterion id exactly once; criterion marks must sum to totalAwardedMark; set overallFeedback to \"\" (empty string); learner-facing text belongs in feedback.",
    "Do not claim the student wrote something unless it appears in the submission; prefer \"not shown\" over guessing.",
  ].join("\n\n");
}
