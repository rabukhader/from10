"use client";

import * as React from "react";
import Link from "next/link";

import type { GradingSessionDocument } from "@/src/domain";
import { sortedExamQuestions } from "@/src/lib/results";
import {
  loadSession,
  setLastActiveSessionId,
} from "@/src/lib/storage/session-repository";
import { participantPrimaryLabel } from "@/src/lib/participants";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useLocale } from "@/components/providers/locale-provider";

import { cn } from "@/lib/utils";

export function ParticipantResultsScreen({
  sessionId,
  participantId,
}: Readonly<{ sessionId: string; participantId: string }>) {
  const { t } = useLocale();
  const [doc, setDoc] = React.useState<GradingSessionDocument | null>(null);

  React.useEffect(() => {
    if (!sessionId) {
      setDoc(null);
      return;
    }

    const loaded = loadSession(sessionId);
    setDoc(loaded);

    if (loaded) {
      setLastActiveSessionId(sessionId);
    }
  }, [sessionId]);

  const participant = React.useMemo(() => {
    if (!doc || !participantId) return null;
    return doc.participants.find((p) => p.id === participantId) ?? null;
  }, [doc, participantId]);

  const grading = React.useMemo(() => {
    if (!doc || !participantId) return null;
    return doc.gradingByParticipantId[participantId] ?? null;
  }, [doc, participantId]);

  const questions = React.useMemo(
    () => (doc ? sortedExamQuestions(doc.questions) : []),
    [doc],
  );

  if (!sessionId || !participantId) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <p className="text-muted-foreground">{t("session.workspace.invalid")}</p>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          {t("session.workspace.backDashboard")}
        </Link>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("session.workspace.notFoundTitle")}
        </h1>
        <p className="text-pretty text-muted-foreground">
          {t("session.workspace.notFoundBody")}
        </p>
        <Link href="/" className={cn(buttonVariants({ variant: "default" }))}>
          {t("session.workspace.backDashboard")}
        </Link>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("participant.workspace.notFoundTitle")}
        </h1>
        <p className="text-pretty text-muted-foreground">
          {t("participant.workspace.notFoundBody")}
        </p>
        <Link
          href={`/sessions/${encodeURIComponent(sessionId)}`}
          className={cn(buttonVariants({ variant: "default" }))}
        >
          {t("participant.workspace.backSession")}
        </Link>
      </div>
    );
  }

  const sessionHref = `/sessions/${encodeURIComponent(sessionId)}`;
  const participantHref = `${sessionHref}/participants/${encodeURIComponent(participantId)}`;
  const heading =
    participantPrimaryLabel(participant).trim() ||
    t("participant.display.unlabeled");

  const hasAnyGrading =
    grading !== null && Object.keys(grading.questionGrades).length > 0;

  return (
    <div className="mx-auto flex min-w-0 max-w-3xl flex-col gap-6">
      <div className="space-y-2">
        <Link
          href={participantHref}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-auto min-h-9 px-0 text-muted-foreground hover:text-foreground",
          )}
        >
          {t("participant.results.backParticipant")}
        </Link>
        <h1 className="break-words font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("participant.results.title")}
        </h1>
        <p className="text-pretty text-sm text-muted-foreground">
          {heading} · {t("participant.results.subtitle")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("participant.workspace.identityTitle")}</CardTitle>
          <CardDescription>{t("participant.results.identityHint")}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">{t("participant.field.name")}</dt>
              <dd className="font-medium">{participant.name?.trim() || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {t("participant.field.universityId")}
              </dt>
              <dd className="font-medium">{participant.universityId?.trim() || "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">{t("participant.field.email")}</dt>
              <dd className="break-words font-medium">{participant.email?.trim() || "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("participant.results.scoreSummaryTitle")}</CardTitle>
          <CardDescription>
            {t("participant.results.scoreSummaryHint")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="tabular-nums text-lg font-semibold">
            {grading?.totalScore ?? "—"}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              / {doc.exam.totalMarks}
            </span>
          </p>
          {!hasAnyGrading ? (
            <p className="text-sm text-muted-foreground">
              {t("participant.results.noGrading")}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {grading?.overallFeedback?.trim() ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("participant.results.overallFeedbackTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">
              {grading.overallFeedback}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-4">
        <h2 className="font-heading text-lg font-semibold">
          {t("participant.results.perQuestionTitle")}
        </h2>

        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("grading.noQuestions")}
          </p>
        ) : (
          questions.map((question) => {
            const snapshot = grading?.questionGrades[question.id];

            return (
              <Card key={question.id}>
                <CardHeader className="gap-1">
                  <CardTitle className="text-base">
                    <span className="tabular-nums text-muted-foreground">
                      Q{question.questionNumber}.
                    </span>{" "}
                    {question.title.trim() || t("dashboard.recent.untitled")}
                  </CardTitle>
                  <CardDescription className="tabular-nums">
                    {snapshot ? (
                      <>
                        {snapshot.totalAwardedMark} / {snapshot.maxMark}{" "}
                        {t("participant.results.marksForQuestion")}
                      </>
                    ) : (
                      t("participant.results.notGradedYet")
                    )}
                  </CardDescription>
                </CardHeader>
                {snapshot ? (
                  <CardContent className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("participant.results.criterionCol")}</TableHead>
                          <TableHead className="text-end tabular-nums">
                            {t("participant.results.markCol")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {snapshot.criteria.map((row) => {
                          const meta = question.criteria.find(
                            (c) => c.id === row.criterionId,
                          );
                          return (
                            <TableRow key={row.criterionId}>
                              <TableCell className="max-w-[18rem] whitespace-normal">
                                <span className="font-medium">
                                  {meta?.title ?? row.criterionId}
                                </span>
                                {meta?.description ? (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {meta.description}
                                  </p>
                                ) : null}
                                {row.reasoning?.trim() ? (
                                  <p className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                                    {row.reasoning}
                                  </p>
                                ) : null}
                              </TableCell>
                              <TableCell className="text-end tabular-nums">
                                {row.awardedMark} / {row.maxMark}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>

                    {snapshot.feedback.trim() ? (
                      <div className="rounded-lg border bg-muted/30 p-3">
                        <h3 className="text-xs font-medium text-muted-foreground">
                          {t("participant.results.questionFeedbackTitle")}
                        </h3>
                        <p className="mt-1 whitespace-pre-wrap text-sm">
                          {snapshot.feedback}
                        </p>
                      </div>
                    ) : null}
                  </CardContent>
                ) : null}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
