/**
 * User message body for per-question grading: session context, preferences, rubric, submission, JSON contract.
 */

import type {
  ExamPrimaryLanguage,
  ExamQuestion,
  InstructorPreferences,
  QuestionType,
  SubmissionLayoutMode,
} from "@/src/domain";
import { normalizeExamPrimaryLanguage } from "@/src/domain";

const STRICTNESS: Record<InstructorPreferences["gradingStrictness"], string> =
  {
    easy: "Easy — be generous when evidence is partial but directionally correct.",
    balanced: "Balanced — fair university-level expectations.",
    strict: "Strict — require clear, explicit evidence aligned with the model expectations.",
  };

const STUDENT_LEVEL: Record<InstructorPreferences["studentLevel"], string> = {
  beginner:
    "Beginner student — simpler vocabulary in feedback; prioritize clear next steps.",
  intermediate:
    "Intermediate student — standard depth; surface subtle misconceptions briefly.",
  advanced:
    "Advanced student — concise, rigorous feedback; reward nuance where evidenced.",
};

const EXAM_LEVEL: Record<InstructorPreferences["examLevel"], string> = {
  easy: "Exam difficulty: easy — lighter burden of proof.",
  medium: "Exam difficulty: medium.",
  hard: "Exam difficulty: hard — expectations are high.",
};

const FEEDBACK_STYLE: Record<InstructorPreferences["feedbackStyle"], string> =
  {
    short: "Feedback style: short bullet-level notes.",
    balanced: "Feedback style: balanced (clear but not overly long).",
    detailed: "Feedback style: detailed explanations where helpful.",
  };

function feedbackShapeRules(
  style: InstructorPreferences["feedbackStyle"],
): string[] {
  switch (style) {
    case "short":
      return [
        "Shape **feedback** as roughly 2–5 short bullets or sentences; avoid long essays.",
      ];
    case "balanced":
      return [
        "Shape **feedback** as about one focused paragraph or up to ~6 bullets.",
      ];
    case "detailed":
      return [
        "**feedback** may be longer when correcting misconceptions, but every sentence must tie to evidence from this submission.",
      ];
  }
}

const QUESTION_TYPE_EN: Record<QuestionType, string> = {
  multiple_choice: "Multiple choice",
  short_answer: "Short answer",
  long_answer: "Long answer",
  code: "Code",
  mixed: "Mixed",
  file_based: "File-based",
};

function normalizeSubmissionLayout(
  layout: SubmissionLayoutMode | undefined,
): SubmissionLayoutMode {
  return layout ?? "combined";
}

function submissionInterpretationLines(params: {
  layout: SubmissionLayoutMode;
  visionImageCount: number;
  question: ExamQuestion;
}): string[] {
  const { layout, visionImageCount, question } = params;
  const label = `Question ${question.questionNumber} — ${question.title}`;
  const lines: string[] = [];

  if (layout === "combined") {
    lines.push(
      `- **Combined packet:** The learner submission below may contain answers or files for **several** exam questions. Award marks **only** for evidence that responds to **${label}**. Treat other sections as irrelevant unless they clearly support this answer.`,
    );
  } else {
    lines.push(
      `- **Per-question slice:** The submission below is limited to materials recorded for **${label}** in this session.`,
    );
  }

  if (visionImageCount > 0) {
    lines.push(
      `- **Vision:** ${visionImageCount} image(s) are attached **after** this message in the chat. Read handwriting, diagrams, and corrections there; reconcile with pasted text and attachment extracts. If substantive work appears only in images, grade from those images.`,
    );
  } else {
    lines.push(
      "- **No vision attachments:** Use only the text blocks and attachment extracts below.",
    );
  }

  return lines;
}

const EXAM_LANGUAGE_SESSION_LINE: Record<ExamPrimaryLanguage, string> = {
  auto:
    "Primary language: Auto — follow the exam-language rules below for feedback/reasoning.",
  en: "Primary language: English — exam is configured for English-first grading output.",
  ar: "Primary language: Arabic — exam is configured for Arabic-first grading output.",
  fr: "Primary language: French — exam is configured for French-first grading output.",
  mixed:
    "Primary language: Mixed / bilingual — exam may combine languages on paper.",
};

function examLanguageGradingRules(lang: ExamPrimaryLanguage): string[] {
  const lines: string[] = [
    "## Exam language (feedback and criterion reasoning)",
  ];
  switch (lang) {
    case "auto":
      lines.push(
        "- **Auto:** Write **feedback** and each criterion **reasoning** in the same primary language the learner used for this question's answer. If they mixed languages, mirror their dominant language for that answer.",
      );
      break;
    case "en":
      lines.push(
        "- **English:** Write **feedback** and **reasoning** in English. You may quote short phrases from the learner in another language when necessary.",
      );
      break;
    case "ar":
      lines.push(
        "- **Arabic:** Write **feedback** and **reasoning** in Arabic (Modern Standard Arabic is fine unless the learner clearly used dialect — then stay close to their register).",
      );
      break;
    case "fr":
      lines.push(
        "- **French:** Write **feedback** and **reasoning** in French.",
      );
      break;
    case "mixed":
      lines.push(
        "- **Mixed:** Mirror the learner's language choices in **feedback** and **reasoning** (e.g. Arabic and English in the same message if they did so); do not force a single language.",
      );
      break;
  }
  return lines;
}

function antiHallucinationRules(): string[] {
  return [
    "## Evidence and anti-hallucination rules",
    "- Award marks only for content visibly present in the learner submission (text blocks, attachment extracts, and supplied images). Never infer \"what they meant\" without textual or visual evidence.",
    "- Do not fabricate quotations, intermediate steps, numerical results, or alternative answers the learner did not show.",
    "- If handwriting or crops are unreadable, say so briefly (e.g. \"unreadable\" / \"not visible\") and award conservatively rather than guessing.",
    "- Treat instructor **model answers** as references only — students receive credit only for what they actually demonstrated.",
    "- If the submission is empty or non-responsive for this question, award zero with reasoning stating \"no relevant answer shown\" (do not invent a response).",
  ];
}

export function buildGradingUserPrompt(params: {
  preferences: InstructorPreferences;
  examTitle: string;
  courseName: string;
  /** Exam/session-level notes from setup — included for every grading call. */
  examNotes?: string;
  /** ISO 8601 exam date from setup (shown when present). */
  examDate?: string;
  /** Total marks for the whole exam (metadata; sum of questions may differ slightly). */
  examTotalMarks?: number;
  /** Expected exam / feedback language from session setup (`auto` when omitted). */
  examPrimaryLanguage?: ExamPrimaryLanguage;
  /** How the learner's submission is stored — affects how to read the block. */
  submissionLayout?: SubmissionLayoutMode;
  /** Count of images appended after this text in the API request (0 = text-only). */
  visionImageCount: number;
  question: ExamQuestion;
  submissionAnswerBlock: string;
}): string {
  const {
    preferences,
    examTitle,
    courseName,
    examNotes,
    examDate,
    examTotalMarks,
    examPrimaryLanguage,
    submissionLayout,
    visionImageCount,
    question,
    submissionAnswerBlock,
  } = params;

  const primaryLang = normalizeExamPrimaryLanguage(examPrimaryLanguage);

  const layout = normalizeSubmissionLayout(submissionLayout);

  const criteriaLines = question.criteria
    .map(
      (criterion, index) =>
        `${index + 1}. **id=\`${criterion.id}\`** — ${criterion.title} — **max ${criterion.mark} marks**\n   ${criterion.description}`,
    )
    .join("\n");

  const criterionIdList = question.criteria.map((c) => `"${c.id}"`).join(", ");

  const modelAnswerSection = question.modelAnswer?.trim()
    ? `\n## Model / key answer (instructor)\n\n${question.modelAnswer.trim()}\n`
    : "";

  const notesSection = question.notes?.trim()
    ? `\n## Instructor notes for this question\n\n${question.notes.trim()}\n`
    : "";

  const sessionContextLines = [
    "## Session context",
    `- Course: ${courseName}`,
    `- Exam: ${examTitle}`,
  ];

  const examDateTrimmed = examDate?.trim();
  if (examDateTrimmed) {
    sessionContextLines.push(`- Exam date: ${examDateTrimmed}`);
  }

  if (
    typeof examTotalMarks === "number" &&
    Number.isFinite(examTotalMarks) &&
    examTotalMarks > 0
  ) {
    sessionContextLines.push(
      `- Published session total (whole exam): ${examTotalMarks} marks`,
    );
  }

  sessionContextLines.push(`- ${EXAM_LANGUAGE_SESSION_LINE[primaryLang]}`);

  if (examNotes?.trim()) {
    sessionContextLines.push(
      "",
      "## Exam-wide instructor notes",
      "Honor these instructions alongside the rubric and any per-question notes:",
      "",
      examNotes.trim(),
    );
  }

  const interpretationLines = submissionInterpretationLines({
    layout,
    visionImageCount,
    question,
  });

  return [
    ...sessionContextLines,
    "",
    "## Instructor grading preferences (must follow)",
    `- ${STRICTNESS[preferences.gradingStrictness]}`,
    `- ${STUDENT_LEVEL[preferences.studentLevel]}`,
    `- ${EXAM_LEVEL[preferences.examLevel]}`,
    `- ${FEEDBACK_STYLE[preferences.feedbackStyle]}`,
    "",
    ...examLanguageGradingRules(primaryLang),
    "",
    "## Question to grade",
    `- Number: ${question.questionNumber}`,
    `- Title: ${question.title}`,
    `- Internal id (reference only): \`${question.id}\``,
    `- Type: ${QUESTION_TYPE_EN[question.type]}`,
    `- Total marks for this question: **${question.totalMark}**`,
    "",
    "### Question text",
    question.body.trim() || "(empty)",
    notesSection,
    modelAnswerSection,
    "### Rubric (score every row exactly once)",
    "Use these stable criterion ids in JSON (`criterionId` must match character-for-character):",
    criterionIdList || "(none)",
    "",
    criteriaLines || "(no criteria — treat as invalid upstream)",
    "",
    "## Learner submission",
    "### How to interpret what follows",
    ...interpretationLines,
    "",
    submissionAnswerBlock,
    "",
    ...antiHallucinationRules(),
    "",
    "## Output contract",
    "Return **only** valid JSON (no markdown fences, no commentary) with this exact shape:",
    `{`,
    `  "totalAwardedMark": <integer 0..${question.totalMark}>,`,
    `  "criterionGrades": [`,
    `    { "criterionId": "<string — one of: ${criterionIdList}>", "awardedMark": <integer>, "reasoning": "<brief string>" }`,
    `  ],`,
    `  "feedback": "<string — learner-facing feedback for THIS question only>",`,
    `  "overallFeedback": ""`,
    `}`,
    "",
    "Field semantics:",
    "- **criterionGrades[].reasoning**: concise justification of that row's mark; may be instructor-facing (technical OK). Use the same language rules as **Exam language** above. Quote or paraphrase the learner only when grounded in the submission.",
    "- **feedback**: single consolidated message for the learner for this question; supportive, specific, and tied to observed evidence. Apply the **Exam language** section above for which language(s) to write in.",
    "- **overallFeedback**: must be exactly \"\" (empty string). You are grading one question per request; holistic participant feedback is edited separately in the app.",
    "",
    "Rules:",
    `- criterionGrades length must equal rubric entries (${question.criteria.length}).`,
    `- Each criterionId must be one of: ${criterionIdList}.`,
    `- Each awardedMark must be an integer from 0 up to that criterion's max.`,
    `- Sum of awardedMark across criteria must equal totalAwardedMark.`,
    `- totalAwardedMark must not exceed ${question.totalMark}.`,
    ...feedbackShapeRules(preferences.feedbackStyle),
    "Grade fairly and consistently with the rubric, instructor notes, and submission.",
  ].join("\n");
}
