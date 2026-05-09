"use client";

import * as React from "react";
import Link from "next/link";

import type { ExamQuestion, GradingSessionDocument } from "@/src/domain";
import { featureConfig } from "@/src/config";
import {
  buildDetailedResultsWorkbook,
  buildSimpleResultsWorkbook,
  downloadExcelWorkbook,
  sanitizeExcelFilenamePart,
} from "@/src/lib/export/excel-session-results";
import {
  aggregateSessionGradingCoverage,
  countGradedQuestionsForParticipant,
} from "@/src/lib/results";
import { participantPrimaryLabel } from "@/src/lib/participants";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

function completionPercent(filled: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((filled / total) * 100));
}

export function SessionResultsDashboard({
  doc,
}: Readonly<{ doc: GradingSessionDocument }>) {
  const { t } = useLocale();
  const sessionHref = `/sessions/${encodeURIComponent(doc.id)}`;

  const { filledSlots, totalSlots } = aggregateSessionGradingCoverage(doc);
  const coveragePct = completionPercent(filledSlots, totalSlots);

  const examSlug = sanitizeExcelFilenamePart(
    doc.exam.examTitle || "grading-session",
  );
  const stamp = new Date().toISOString().slice(0, 10);

  function questionScoreHeader(question: ExamQuestion): string {
    return `${t("results.export.questionScoreShort")} ${question.questionNumber}`;
  }

  const simpleLabels = {
    sheetName: t("results.export.simpleSheet"),
    name: t("results.export.colName"),
    universityId: t("results.export.colUniversityId"),
    email: t("results.export.colEmail"),
    totalScore: t("results.export.colTotalScore"),
    overallFeedback: t("results.export.colOverallFeedback"),
    questionScoreHeader,
  };

  const detailedLabels = {
    ...simpleLabels,
    sheetName: t("results.export.detailedSheet"),
    questionNumber: t("results.export.colQuestionNumber"),
    questionTitle: t("results.export.colQuestionTitle"),
    questionTotalAwarded: t("results.export.colQuestionAwarded"),
    questionMaxMarks: t("results.export.colQuestionMax"),
    criterionTitle: t("results.export.colCriterionTitle"),
    criterionAwarded: t("results.export.colCriterionAwarded"),
    criterionMaxMarks: t("results.export.colCriterionMax"),
    criterionReasoning: t("results.export.colCriterionReasoning"),
    questionFeedback: t("results.export.colQuestionFeedback"),
    gradedAt: t("results.export.colGradedAt"),
  };

  function handleSimpleExport(): void {
    const workbook = buildSimpleResultsWorkbook(doc, simpleLabels);
    downloadExcelWorkbook(workbook, `from10-simple-${examSlug}-${stamp}.xlsx`);
  }

  function handleDetailedExport(): void {
    const workbook = buildDetailedResultsWorkbook(doc, detailedLabels);
    downloadExcelWorkbook(
      workbook,
      `from10-detailed-${examSlug}-${stamp}.xlsx`,
    );
  }

  const exportDisabled =
    doc.participants.length === 0 || !featureConfig.excelExport;

  return (
    <Card className="min-w-0">
      <CardHeader className="gap-2">
        <CardTitle>{t("results.session.title")}</CardTitle>
        <CardDescription className="text-pretty">
          {t("results.session.hint")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-medium">{t("results.session.coverageTitle")}</span>
            <span className="tabular-nums text-muted-foreground">
              {filledSlots} / {totalSlots}{" "}
              <span className="text-foreground">({coveragePct}%)</span>
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-[width]"
              style={{ width: `${coveragePct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {t("results.session.coverageHint")}
          </p>
        </div>

        {doc.participants.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("results.session.noParticipants")}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("results.session.colParticipant")}</TableHead>
                <TableHead>{t("results.session.colProgress")}</TableHead>
                <TableHead className="text-end tabular-nums">
                  {t("results.session.colTotal")}
                </TableHead>
                <TableHead className="text-end">
                  {t("results.session.colActions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doc.participants.map((participant) => {
                const label =
                  participantPrimaryLabel(participant).trim() ||
                  t("participant.display.unlabeled");
                const { graded, total } = countGradedQuestionsForParticipant(
                  doc,
                  participant.id,
                );
                const pct = completionPercent(graded, total);
                const grading = doc.gradingByParticipantId[participant.id];
                const participantHref = `${sessionHref}/participants/${encodeURIComponent(participant.id)}`;
                const resultsHref = `${participantHref}/results`;

                return (
                  <TableRow key={participant.id}>
                    <TableCell className="max-w-[14rem] truncate font-medium">
                      {label}
                    </TableCell>
                    <TableCell className="min-w-[8rem]">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {graded}/{total}
                        </span>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-1.5 rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {grading?.totalScore ?? "—"}
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={resultsHref}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "inline-flex min-h-9 items-center justify-center sm:min-h-8",
                          )}
                        >
                          {t("results.session.breakdown")}
                        </Link>
                        <Link
                          href={participantHref}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "inline-flex min-h-9 items-center justify-center sm:min-h-8",
                          )}
                        >
                          {t("results.session.workspace")}
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {featureConfig.excelExport ? (
        <CardFooter className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full gap-2 sm:w-auto sm:min-h-9"
            disabled={exportDisabled}
            onClick={handleSimpleExport}
          >
            {t("results.session.exportSimple")}
          </Button>
          <Button
            type="button"
            variant="default"
            className="min-h-11 w-full gap-2 sm:w-auto sm:min-h-9"
            disabled={exportDisabled}
            onClick={handleDetailedExport}
          >
            {t("results.session.exportDetailed")}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
