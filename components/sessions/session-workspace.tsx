"use client";

import * as React from "react";
import Link from "next/link";
import { PencilLineIcon } from "lucide-react";

import type { GradingSessionDocument } from "@/src/domain";
import { normalizeExamPrimaryLanguage } from "@/src/domain";
import {
  labelExamLevelPreference,
  labelFeedbackStyle,
  labelGradingStrictness,
  labelStudentLevel,
} from "@/src/lib/i18n/preference-labels";
import { labelExamPrimaryLanguage } from "@/src/lib/i18n/exam-language-labels";
import {
  loadSession,
  setLastActiveSessionId,
} from "@/src/lib/storage/session-repository";

import { ParticipantListManager } from "@/components/participants/participant-list-manager";
import { QuestionListManager } from "@/components/questions/question-list-manager";
import { SessionResultsDashboard } from "@/components/results/session-results-dashboard";
import { SessionDetailsEditDialog } from "@/components/sessions/session-details-edit-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useLocale } from "@/components/providers/locale-provider";

import { cn } from "@/lib/utils";

export function SessionWorkspace({
  sessionId,
}: Readonly<{ sessionId: string }>) {
  const { t } = useLocale();

  const [doc, setDoc] = React.useState<GradingSessionDocument | null>(null);
  const [editDetailsOpen, setEditDetailsOpen] = React.useState(false);

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

  if (!sessionId) {
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

  function handleSessionDetailsSaved(next: GradingSessionDocument): void {
    setDoc(next);
  }

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="break-words font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {doc.exam.examTitle.trim() || t("dashboard.recent.untitled")}
          </h1>
          <p className="text-sm text-muted-foreground">{doc.exam.courseName}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-9 shrink-0 gap-2"
          onClick={() => setEditDetailsOpen(true)}
        >
          <PencilLineIcon className="size-4" aria-hidden />
          {t("session.workspace.editSession")}
        </Button>
      </div>

      <SessionDetailsEditDialog
        doc={doc}
        open={editDetailsOpen}
        onOpenChange={setEditDetailsOpen}
        onSaved={handleSessionDetailsSaved}
      />

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>{t("session.workspace.summaryTitle")}</CardTitle>
          <CardDescription>{t("session.workspace.summaryHint")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <section className="grid gap-2">
            <h2 className="text-sm font-medium">{t("session.section.prefs")}</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="text-muted-foreground">
                  {t("session.prefs.strictness")}
                </dt>
                <dd className="font-medium">
                  {labelGradingStrictness(t, doc.preferences.gradingStrictness)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground">
                  {t("session.prefs.studentLevel")}
                </dt>
                <dd className="font-medium">
                  {labelStudentLevel(t, doc.preferences.studentLevel)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground">
                  {t("session.prefs.examLevel")}
                </dt>
                <dd className="font-medium">
                  {labelExamLevelPreference(t, doc.preferences.examLevel)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground">
                  {t("session.prefs.feedbackStyle")}
                </dt>
                <dd className="font-medium">
                  {labelFeedbackStyle(t, doc.preferences.feedbackStyle)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="grid gap-2">
            <h2 className="text-sm font-medium">{t("session.section.exam")}</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="text-muted-foreground">
                  {t("session.workspace.course")}
                </dt>
                <dd className="truncate font-medium">{doc.exam.courseName}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground">
                  {t("session.workspace.examDate")}
                </dt>
                <dd className="font-medium">{doc.exam.examDate}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground">
                  {t("session.workspace.totalMarks")}
                </dt>
                <dd className="font-medium tabular-nums">{doc.exam.totalMarks}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground">
                  {t("session.field.primaryLanguage")}
                </dt>
                <dd className="font-medium">
                  {labelExamPrimaryLanguage(
                    t,
                    normalizeExamPrimaryLanguage(doc.exam.primaryLanguage),
                  )}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground">
                  {t("session.workspace.updated")}
                </dt>
                <dd className="font-medium">
                  {new Date(doc.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </section>

          {doc.exam.notes ? (
            <section className="rounded-lg border bg-muted/40 p-3">
              <h2 className="text-xs font-medium text-muted-foreground">
                {t("session.field.notes")}
              </h2>
              <p className="mt-1 whitespace-pre-wrap text-sm">{doc.exam.notes}</p>
            </section>
          ) : null}
        </CardContent>
      </Card>

      <QuestionListManager doc={doc} onDocumentChange={setDoc} />

      <ParticipantListManager doc={doc} onDocumentChange={setDoc} />

      <SessionResultsDashboard doc={doc} />

      <p className="text-pretty text-sm text-muted-foreground">
        {t("session.workspace.footerHint")}
      </p>
    </div>
  );
}
