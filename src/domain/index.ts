export type {
  InstructorPreferences,
  GradingStrictness,
  StudentLevel,
  ExamLevel,
  FeedbackStyle,
} from "./types/preferences";

export type {
  ExamPrimaryLanguage,
  ExamSetup,
} from "./types/exam-setup";
export { normalizeExamPrimaryLanguage } from "./types/exam-setup";

export type {
  QuestionType,
  GradingCriterion,
  ExamQuestion,
} from "./types/question";

export type {
  Participant,
  ParticipantGradingStatus,
} from "./types/participant";

export type {
  QuestionAnswerDraft,
  Submission,
  SubmissionFileRef,
  SubmissionFileKind,
  SubmissionLayoutMode,
} from "./types/submission";

export type {
  AiCriterionGrade,
  AiGradingResponse,
  CriterionGradingSnapshot,
  QuestionGradingSnapshot,
  ParticipantGradingResult,
  GradingSnapshotSource,
} from "./types/grading";

export type {
  GradingSessionDocument,
  SessionsIndex,
} from "./types/session-document";

export { GRADING_SESSION_DOCUMENT_VERSION } from "./types/session-document";
