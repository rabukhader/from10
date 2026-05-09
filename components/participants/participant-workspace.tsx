"use client";

import * as React from "react";
import Link from "next/link";

import type {
  ExamQuestion,
  GradingSessionDocument,
  ParticipantGradingStatus,
  Submission,
} from "@/src/domain";
import { labelParticipantGradingStatus } from "@/src/lib/i18n/participant-labels";
import { participantPrimaryLabel } from "@/src/lib/participants";
import {
  loadSession,
  saveSession,
  setLastActiveSessionId,
} from "@/src/lib/storage/session-repository";

import { ParticipantGradingPanel } from "@/components/grading/participant-grading-panel";
import { SubmissionEditor } from "@/components/submissions/submission-editor";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useLocale } from "@/components/providers/locale-provider";

import { cn } from "@/lib/utils";

const STATUS_ORDER: readonly ParticipantGradingStatus[] = [
  "pending",
  "in_progress",
  "completed",
];

export function ParticipantWorkspace({
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

  const submission = React.useMemo(() => {
    if (!doc || !participantId) return null;
    return doc.submissionsByParticipantId[participantId] ?? null;
  }, [doc, participantId]);

  const sortedExamQuestions = React.useMemo((): ExamQuestion[] => {
    const qs = doc?.questions;
    if (!qs?.length) return [];
    return [...qs].sort((a, b) => a.questionNumber - b.questionNumber);
  }, [doc?.questions]);

  function persistDocument(next: GradingSessionDocument): void {
    setDoc(saveSession(next));
  }

  function handleGradingStatusChange(value: ParticipantGradingStatus): void {
    if (!doc || !participant) return;
    const iso = new Date().toISOString();
    const nextParticipants = doc.participants.map((p) =>
      p.id === participant.id ? { ...p, gradingStatus: value, updatedAt: iso } : p,
    );
    persistDocument({
      ...doc,
      participants: nextParticipants,
      updatedAt: iso,
    });
  }

  function handleSubmissionSaved(next: Submission): void {
    if (!doc) return;
    const iso = new Date().toISOString();
    persistDocument({
      ...doc,
      submissionsByParticipantId: {
        ...doc.submissionsByParticipantId,
        [participantId]: next,
      },
      updatedAt: iso,
    });
  }

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
  const participantBaseHref = `${sessionHref}/participants/${encodeURIComponent(participantId)}`;
  const resultsHref = `${participantBaseHref}/results`;
  const primary = participantPrimaryLabel(participant);
  const heading =
    primary.trim() || t("participant.display.unlabeled");

  return (
    <div className="mx-auto flex min-w-0 max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Link
            href={sessionHref}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-auto min-h-9 px-0 text-muted-foreground hover:text-foreground",
            )}
          >
            {t("participant.workspace.backSession")}
          </Link>
          <h1 className="break-words font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {heading}
          </h1>
          <Link
            href={resultsHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "inline-flex min-h-9 w-fit items-center justify-center",
            )}
          >
            {t("participant.results.shortcut")}
          </Link>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <span className="text-xs font-medium text-muted-foreground">
            {t("participant.workspace.statusLabel")}
          </span>
          <Select
            value={participant.gradingStatus}
            onValueChange={(value) =>
              handleGradingStatusChange(value as ParticipantGradingStatus)
            }
          >
            <SelectTrigger className="min-h-11 w-full min-w-[12rem] sm:min-h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_ORDER.map((status) => (
                <SelectItem key={status} value={status}>
                  {labelParticipantGradingStatus(t, status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>{t("participant.workspace.identityTitle")}</CardTitle>
          <CardDescription>
            {t("participant.workspace.identityHint")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <dl className="grid gap-2 sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-muted-foreground">
                {t("participant.field.name")}
              </dt>
              <dd className="break-words font-medium">
                {participant.name?.trim() || "—"}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-muted-foreground">
                {t("participant.field.universityId")}
              </dt>
              <dd className="break-words font-medium">
                {participant.universityId?.trim() || "—"}
              </dd>
            </div>
            <div className="min-w-0 sm:col-span-2">
              <dt className="text-muted-foreground">
                {t("participant.field.email")}
              </dt>
              <dd className="break-words font-medium">
                {participant.email?.trim() || "—"}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-muted-foreground">
                {t("participant.field.section")}
              </dt>
              <dd className="break-words font-medium">
                {participant.section?.trim() || "—"}
              </dd>
            </div>
          </dl>
          {participant.notes?.trim() ? (
            <div className="rounded-lg border bg-muted/40 p-3">
              <h2 className="text-xs font-medium text-muted-foreground">
                {t("participant.field.notes")}
              </h2>
              <p className="mt-1 whitespace-pre-wrap">{participant.notes}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>{t("submissions.cardTitle")}</CardTitle>
          <CardDescription>{t("submissions.cardHint")}</CardDescription>
        </CardHeader>
        <CardContent>
          <SubmissionEditor
            sessionId={sessionId}
            participantId={participantId}
            submission={submission}
            questions={sortedExamQuestions}
            onSaved={handleSubmissionSaved}
          />
        </CardContent>
      </Card>

      <ParticipantGradingPanel
        doc={doc}
        participantId={participantId}
        submission={submission}
        onPersist={persistDocument}
      />
    </div>
  );
}
