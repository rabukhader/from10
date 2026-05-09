"use client";

import * as React from "react";
import Link from "next/link";

import type {
  AiGradingResponse,
  ExamQuestion,
  GradingSessionDocument,
  ParticipantGradingResult,
  QuestionGradingSnapshot,
  Submission,
} from "@/src/domain";
import { normalizeExamPrimaryLanguage } from "@/src/domain";
import { featureConfig } from "@/src/config";
import {
  buildGradingUserPrompt,
  buildSubmissionAnswerContextForQuestion,
  gradeQuestionWithOpenAi,
  mapAiResponseToQuestionSnapshot,
  type SubmissionAnswerContext,
} from "@/src/lib/ai";
import {
  emptyParticipantGradingResult,
  emptyQuestionGradingSnapshot,
  mergeQuestionSnapshot,
  normalizeQuestionGradingSnapshot,
  recomputeQuestionTotal,
} from "@/src/lib/grading";
import type { MessageKey } from "@/src/lib/i18n/messages";
import { getOpenAiApiKey } from "@/src/lib/storage/openai-key";

import { useApiKey } from "@/components/providers/api-key-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";

const SOURCE_LABEL: Record<
  QuestionGradingSnapshot["source"],
  MessageKey
> = {
  ai: "grading.source.ai",
  manual: "grading.source.manual",
  mixed: "grading.source.mixed",
};

function sortQuestions(questions: ExamQuestion[]): ExamQuestion[] {
  return [...questions].sort((a, b) => a.questionNumber - b.questionNumber);
}

function applyAiOutcomeToParticipant(
  previous: ParticipantGradingResult,
  question: ExamQuestion,
  response: AiGradingResponse,
): ParticipantGradingResult {
  const snap = normalizeQuestionGradingSnapshot(
    question,
    mapAiResponseToQuestionSnapshot(question, response),
  );
  return mergeQuestionSnapshot(previous, snap);
}

function sourceBadgeVariant(
  source: QuestionGradingSnapshot["source"],
): "secondary" | "outline" | "default" {
  switch (source) {
    case "ai":
      return "default";
    case "mixed":
      return "secondary";
    default:
      return "outline";
  }
}

export function ParticipantGradingPanel({
  doc,
  participantId,
  submission,
  onPersist,
}: Readonly<{
  doc: GradingSessionDocument;
  participantId: string;
  submission: Submission | null;
  onPersist: (next: GradingSessionDocument) => void;
}>) {
  const { t } = useLocale();
  const { hasApiKey } = useApiKey();

  const remoteSyncKey =
    doc.gradingByParticipantId[participantId]?.updatedAt ?? "";

  const [localGrading, setLocalGrading] =
    React.useState<ParticipantGradingResult | null>(null);
  const [ctxCombined, setCtxCombined] =
    React.useState<SubmissionAnswerContext | null>(null);
  const [ctxPerQuestion, setCtxPerQuestion] = React.useState<
    Record<string, SubmissionAnswerContext>
  >({});
  const [ctxLoading, setCtxLoading] = React.useState(true);
  const [busyQuestionId, setBusyQuestionId] = React.useState<string | null>(
    null,
  );
  const [busyAll, setBusyAll] = React.useState(false);
  const [lastAiError, setLastAiError] = React.useState<string | null>(null);
  const [lastAttempts, setLastAttempts] = React.useState<number | null>(null);

  const localGradingRef = React.useRef<ParticipantGradingResult | null>(null);
  React.useEffect(() => {
    localGradingRef.current = localGrading;
  }, [localGrading]);

  const gradableQuestions = React.useMemo(
    () => sortQuestions(doc.questions).filter((q) => q.criteria.length > 0),
    [doc.questions],
  );

  const participantRemoteGrading =
    doc.gradingByParticipantId[participantId] ?? null;

  React.useEffect(() => {
    setLocalGrading(
      participantRemoteGrading ??
        emptyParticipantGradingResult(participantId, doc.id),
    );
  }, [participantId, doc.id, remoteSyncKey, participantRemoteGrading]);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      setCtxLoading(true);
      const perQuestionLayout = submission?.layout === "per_question";

      if (!perQuestionLayout) {
        const ctx = await buildSubmissionAnswerContextForQuestion({
          sessionId: doc.id,
          participantId,
          submission,
          questionId: null,
        });
        if (!cancelled) {
          setCtxCombined(ctx);
          setCtxPerQuestion({});
        }
      } else {
        const qs = sortQuestions(doc.questions);
        const entries = await Promise.all(
          qs.map(async (q) => {
            const ctx = await buildSubmissionAnswerContextForQuestion({
              sessionId: doc.id,
              participantId,
              submission,
              questionId: q.id,
            });
            return [q.id, ctx] as const;
          }),
        );
        if (!cancelled) {
          setCtxCombined(null);
          setCtxPerQuestion(Object.fromEntries(entries));
        }
      }
      if (!cancelled) setCtxLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [doc.id, doc.questions, participantId, submission]);

  function ctxForQuestion(questionId: string): SubmissionAnswerContext | null {
    if (ctxLoading) return null;
    if (submission?.layout === "per_question") {
      return ctxPerQuestion[questionId] ?? null;
    }
    return ctxCombined;
  }

  function persistResult(next: ParticipantGradingResult): void {
    const iso = new Date().toISOString();
    const merged: GradingSessionDocument = {
      ...doc,
      gradingByParticipantId: {
        ...doc.gradingByParticipantId,
        [participantId]: { ...next, updatedAt: iso },
      },
      updatedAt: iso,
    };
    onPersist(merged);
  }

  function patchSnapshot(
    question: ExamQuestion,
    updater: (draft: QuestionGradingSnapshot) => QuestionGradingSnapshot,
  ): void {
    setLocalGrading((previous) => {
      if (!previous) return previous;
      const base =
        previous.questionGrades[question.id] ??
        emptyQuestionGradingSnapshot(question);
      let nextSnap = updater(base);
      nextSnap = normalizeQuestionGradingSnapshot(question, nextSnap);
      nextSnap = recomputeQuestionTotal(nextSnap);
      return mergeQuestionSnapshot(previous, nextSnap);
    });
  }

  function handleCriterionMark(
    question: ExamQuestion,
    criterionId: string,
    raw: string,
  ): void {
    const parsed = Number.parseInt(raw, 10);
    const mark = Number.isNaN(parsed) ? 0 : parsed;
    patchSnapshot(question, (draft) => {
      const criteria = draft.criteria.map((row) =>
        row.criterionId === criterionId
          ? {
              ...row,
              awardedMark: Math.min(Math.max(0, mark), row.maxMark),
            }
          : row,
      );
      const source = draft.source === "ai" ? "mixed" : draft.source;
      return {
        ...draft,
        criteria,
        gradedAt: new Date().toISOString(),
        source,
      };
    });
  }

  function handleCriterionReasoning(
    question: ExamQuestion,
    criterionId: string,
    reasoning: string,
  ): void {
    patchSnapshot(question, (draft) => {
      const criteria = draft.criteria.map((row) =>
        row.criterionId === criterionId ? { ...row, reasoning } : row,
      );
      const source = draft.source === "ai" ? "mixed" : draft.source;
      return {
        ...draft,
        criteria,
        gradedAt: new Date().toISOString(),
        source,
      };
    });
  }

  function handleQuestionFeedback(
    question: ExamQuestion,
    feedback: string,
  ): void {
    patchSnapshot(question, (draft) => {
      const source = draft.source === "ai" ? "mixed" : draft.source;
      return {
        ...draft,
        feedback,
        gradedAt: new Date().toISOString(),
        source,
      };
    });
  }

  function handleOverallFeedback(text: string): void {
    setLocalGrading((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        overallFeedback: text.trim() ? text : undefined,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  async function handleAiGrade(question: ExamQuestion): Promise<void> {
    const answerCtx = ctxForQuestion(question.id);
    if (!answerCtx?.hasReadableAnswer || !localGrading) return;
    const apiKey = getOpenAiApiKey()?.trim();
    if (!apiKey) return;

    if (question.criteria.length === 0) {
      setLastAiError(t("grading.noCriteria"));
      return;
    }

    setBusyQuestionId(question.id);
    setLastAiError(null);
    setLastAttempts(null);

    const userPrompt = buildGradingUserPrompt({
      preferences: doc.preferences,
      examTitle: doc.exam.examTitle,
      courseName: doc.exam.courseName,
      examNotes: doc.exam.notes,
      examDate: doc.exam.examDate,
      examTotalMarks: doc.exam.totalMarks,
      examPrimaryLanguage: normalizeExamPrimaryLanguage(doc.exam.primaryLanguage),
      submissionLayout: submission?.layout,
      visionImageCount: answerCtx.visionImageUrls.length,
      question,
      submissionAnswerBlock: answerCtx.block,
    });

    const outcome = await gradeQuestionWithOpenAi({
      apiKey,
      question,
      userPrompt,
      visionImageUrls: answerCtx.visionImageUrls,
    });

    setBusyQuestionId(null);
    setLastAttempts(outcome.attemptsUsed);

    if (!outcome.ok) {
      setLastAiError(outcome.message);
      return;
    }

    const previous = localGradingRef.current;
    if (!previous) return;
    const merged = applyAiOutcomeToParticipant(
      previous,
      question,
      outcome.response,
    );
    localGradingRef.current = merged;
    setLocalGrading(merged);
    persistResult(merged);
  }

  async function handleGradeAllWithAi(): Promise<void> {
    const apiKey = getOpenAiApiKey()?.trim();
    if (!apiKey || gradableQuestions.length === 0) {
      return;
    }

    let current = localGradingRef.current;
    if (!current) return;

    const anyReadable = gradableQuestions.some(
      (q) => ctxForQuestion(q.id)?.hasReadableAnswer,
    );
    if (!anyReadable) return;

    setBusyAll(true);
    setLastAiError(null);
    setLastAttempts(null);

    try {
      for (const question of gradableQuestions) {
        const answerSlice = ctxForQuestion(question.id);
        if (!answerSlice?.hasReadableAnswer) continue;

        setBusyQuestionId(question.id);

        const userPrompt = buildGradingUserPrompt({
          preferences: doc.preferences,
          examTitle: doc.exam.examTitle,
          courseName: doc.exam.courseName,
          examNotes: doc.exam.notes,
          examDate: doc.exam.examDate,
          examTotalMarks: doc.exam.totalMarks,
          examPrimaryLanguage: normalizeExamPrimaryLanguage(doc.exam.primaryLanguage),
          submissionLayout: submission?.layout,
          visionImageCount: answerSlice.visionImageUrls.length,
          question,
          submissionAnswerBlock: answerSlice.block,
        });

        const outcome = await gradeQuestionWithOpenAi({
          apiKey,
          question,
          userPrompt,
          visionImageUrls: answerSlice.visionImageUrls,
        });

        setLastAttempts(outcome.attemptsUsed);

        if (!outcome.ok) {
          setLastAiError(outcome.message);
          break;
        }

        current = applyAiOutcomeToParticipant(
          current,
          question,
          outcome.response,
        );
        localGradingRef.current = current;
        setLocalGrading(current);
        persistResult(current);
      }
    } finally {
      setBusyQuestionId(null);
      setBusyAll(false);
    }
  }

  function handleSaveProgress(): void {
    if (!localGrading) return;
    persistResult(localGrading);
  }

  if (!featureConfig.aiGrading) {
    return null;
  }

  if (!localGrading) {
    return (
      <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
    );
  }

  const questions = sortQuestions(doc.questions);
  const examTotal = doc.exam.totalMarks;

  const anySubmissionPayload =
    !ctxLoading &&
    questions.some((q) => ctxForQuestion(q.id)?.hasReadableAnswer);

  const anyGradeAllPayload =
    !ctxLoading &&
    gradableQuestions.some((q) => ctxForQuestion(q.id)?.hasReadableAnswer);

  return (
    <Card className="min-w-0">
      <CardHeader className="gap-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <CardTitle>{t("grading.sectionTitle")}</CardTitle>
            <CardDescription className="text-pretty">
              {t("grading.sectionHint")}
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="min-h-9 shrink-0"
            disabled={
              ctxLoading ||
              !anyGradeAllPayload ||
              !hasApiKey ||
              busyAll ||
              busyQuestionId !== null ||
              gradableQuestions.length === 0
            }
            onClick={() => void handleGradeAllWithAi()}
          >
            {busyAll ? t("grading.gradeAllBusy") : t("grading.gradeAllWithAi")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasApiKey ? (
          <Alert variant="destructive">
            <AlertDescription>
              {t("grading.noApiKey")}{" "}
              <Link
                href="/settings"
                className={cn(buttonVariants({ variant: "link" }), "h-auto p-0")}
              >
                {t("grading.openSettings")}
              </Link>
            </AlertDescription>
          </Alert>
        ) : null}

        {!ctxLoading && !anySubmissionPayload ? (
          <Alert>
            <AlertDescription>{t("grading.weakSubmissionHint")}</AlertDescription>
          </Alert>
        ) : null}

        {lastAiError ? (
          <Alert variant="destructive">
            <AlertDescription>
              {lastAiError}
              {lastAttempts !== null ? (
                <span className="mt-1 block text-xs opacity-90">
                  {t("grading.attemptsLabel")}{" "}
                  <span className="tabular-nums">{lastAttempts}</span>
                </span>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : null}

        {ctxLoading ? (
          <p className="text-sm text-muted-foreground">
            {t("grading.loadingSubmission")}
          </p>
        ) : null}

        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-3">
          <span className="text-sm font-medium">{t("grading.totalScoreLabel")}</span>
          <span className="tabular-nums text-lg font-semibold">
            {localGrading.totalScore} / {examTotal}
          </span>
        </div>

        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("grading.noQuestions")}</p>
        ) : (
          <div className="space-y-6">
            {questions.map((question) => {
              const snapshot =
                localGrading.questionGrades[question.id] ??
                emptyQuestionGradingSnapshot(question);
              const aiBusy = busyQuestionId === question.id;
              const questionCtx = ctxForQuestion(question.id);

              return (
                <section
                  key={question.id}
                  id={`grading-question-${question.id}`}
                  className="rounded-lg border bg-card scroll-mt-24"
                >
                  <div className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <h3 className="font-heading text-sm font-semibold">
                        <span className="tabular-nums text-muted-foreground">
                          Q{question.questionNumber}.
                        </span>{" "}
                        {question.title.trim() || t("dashboard.recent.untitled")}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {snapshot.totalAwardedMark}
                        </span>
                        {" / "}
                        <span className="tabular-nums">{question.totalMark}</span>
                        {" · "}
                        {t("grading.questionScoreSuffix")}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Badge variant={sourceBadgeVariant(snapshot.source)}>
                        {t(SOURCE_LABEL[snapshot.source])}
                      </Badge>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-9"
                        onClick={() =>
                          document
                            .getElementById(`grading-rubric-${question.id}`)
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            })
                        }
                      >
                        {t("grading.gradeManually")}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="min-h-9"
                        disabled={
                          !questionCtx?.hasReadableAnswer ||
                          !hasApiKey ||
                          aiBusy ||
                          busyAll ||
                          question.criteria.length === 0
                        }
                        onClick={() => void handleAiGrade(question)}
                      >
                        {aiBusy ? t("grading.gradingBusy") : t("grading.gradeWithAi")}
                      </Button>
                    </div>
                  </div>

                  <div
                    id={`grading-rubric-${question.id}`}
                    className="scroll-mt-28 space-y-4 px-4 py-4"
                  >
                    {snapshot.criteria.map((row) => {
                      const criterionMeta = question.criteria.find(
                        (c) => c.id === row.criterionId,
                      );
                      return (
                        <div key={row.criterionId} className="grid gap-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-medium">
                              {criterionMeta?.title ?? row.criterionId}
                            </span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              0–{row.maxMark}
                            </span>
                          </div>
                          {criterionMeta?.description ? (
                            <p className="text-xs text-muted-foreground">
                              {criterionMeta.description}
                            </p>
                          ) : null}
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                            <div className="grid gap-2 sm:w-28">
                              <label
                                className="text-xs font-medium text-muted-foreground"
                                htmlFor={`mk-${question.id}-${row.criterionId}`}
                              >
                                {t("grading.criterionMark")}
                              </label>
                              <Input
                                id={`mk-${question.id}-${row.criterionId}`}
                                inputMode="numeric"
                                min={0}
                                max={row.maxMark}
                                value={String(row.awardedMark)}
                                className="min-h-11 tabular-nums sm:min-h-9"
                                onChange={(event) =>
                                  handleCriterionMark(
                                    question,
                                    row.criterionId,
                                    event.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="grid min-w-0 flex-1 gap-2">
                              <label
                                className="text-xs font-medium text-muted-foreground"
                                htmlFor={`rs-${question.id}-${row.criterionId}`}
                              >
                                {t("grading.criterionReasoning")}
                              </label>
                              <Textarea
                                id={`rs-${question.id}-${row.criterionId}`}
                                value={row.reasoning ?? ""}
                                rows={2}
                                className="min-h-20 text-sm"
                                onChange={(event) =>
                                  handleCriterionReasoning(
                                    question,
                                    row.criterionId,
                                    event.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                          <Separator />
                        </div>
                      );
                    })}

                    <div className="grid gap-2">
                      <label
                        className="text-sm font-medium"
                        htmlFor={`fb-${question.id}`}
                      >
                        {t("grading.questionFeedback")}
                      </label>
                      <Textarea
                        id={`fb-${question.id}`}
                        value={snapshot.feedback}
                        rows={4}
                        className="min-h-28 text-sm"
                        onChange={(event) =>
                          handleQuestionFeedback(question, event.target.value)
                        }
                      />
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="grading-overall">
            {t("grading.overallFeedback")}
          </label>
          <p className="text-xs text-muted-foreground">
            {t("grading.overallFeedbackHint")}
          </p>
          <Textarea
            id="grading-overall"
            value={localGrading.overallFeedback ?? ""}
            rows={3}
            className="min-h-24 text-sm"
            onChange={(event) => handleOverallFeedback(event.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="default"
          className="min-h-11 w-full sm:w-auto sm:min-h-9"
          onClick={handleSaveProgress}
        >
          {t("grading.saveProgress")}
        </Button>
      </CardFooter>
    </Card>
  );
}
