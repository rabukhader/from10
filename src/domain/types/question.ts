export type QuestionType =
  | "multiple_choice"
  | "short_answer"
  | "long_answer"
  | "code"
  | "mixed"
  | "file_based";

export interface GradingCriterion {
  id: string;
  title: string;
  description: string;
  mark: number;
}

export interface ExamQuestion {
  id: string;
  questionNumber: number;
  title: string;
  body: string;
  type: QuestionType;
  totalMark: number;
  notes?: string;
  modelAnswer?: string;
  criteria: GradingCriterion[];
}
