"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";

import type {
  ExamLevel,
  ExamPrimaryLanguage,
  FeedbackStyle,
  GradingStrictness,
  StudentLevel,
} from "@/src/domain";
import {
  labelExamLevelPreference,
  labelFeedbackStyle,
  labelGradingStrictness,
  labelStudentLevel,
} from "@/src/lib/i18n/preference-labels";
import { labelExamPrimaryLanguage } from "@/src/lib/i18n/exam-language-labels";
import { createGradingSessionDocument } from "@/src/lib/sessions";
import { saveSessionAndActivate } from "@/src/lib/storage/session-repository";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useLocale } from "@/components/providers/locale-provider";

import type { MessageKey } from "@/src/lib/i18n/messages";

import { cn } from "@/lib/utils";

const EXAM_TITLE_SUGGESTIONS = [
  "session.examTitleSuggestion.first",
  "session.examTitleSuggestion.second",
  "session.examTitleSuggestion.final",
  "session.examTitleSuggestion.midterm",
] as const satisfies readonly MessageKey[];

const STRICTNESS: readonly GradingStrictness[] = ["easy", "balanced", "strict"];

const STUDENT_LEVEL: readonly StudentLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
];

const EXAM_LEVEL: readonly ExamLevel[] = ["easy", "medium", "hard"];

const FEEDBACK: readonly FeedbackStyle[] = ["short", "balanced", "detailed"];

const EXAM_LANGUAGE: readonly ExamPrimaryLanguage[] = [
  "auto",
  "en",
  "ar",
  "fr",
  "mixed",
];

export function CreateSessionForm() {
  const { t } = useLocale();
  const router = useRouter();

  const defaultDate = React.useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );

  const [examTitle, setExamTitle] = React.useState("");
  const [courseName, setCourseName] = React.useState("");
  const [examDate, setExamDate] = React.useState(defaultDate);
  const [totalMarks, setTotalMarks] = React.useState("100");
  const [notes, setNotes] = React.useState("");

  const [strictness, setStrictness] =
    React.useState<GradingStrictness>("balanced");
  const [studentLevel, setStudentLevel] =
    React.useState<StudentLevel>("intermediate");
  const [examLevel, setExamLevel] = React.useState<ExamLevel>("medium");
  const [feedbackStyle, setFeedbackStyle] =
    React.useState<FeedbackStyle>("balanced");

  const [primaryLanguage, setPrimaryLanguage] =
    React.useState<ExamPrimaryLanguage>("auto");

  const [submitting, setSubmitting] = React.useState(false);
  const [errorText, setErrorText] = React.useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorText(null);

    const title = examTitle.trim();
    const course = courseName.trim();
    const marks = Number.parseInt(totalMarks, 10);

    if (!title || !course || !examDate) {
      setErrorText(t("session.validation.required"));
      return;
    }

    if (!Number.isFinite(marks) || marks <= 0) {
      setErrorText(t("session.validation.marks"));
      return;
    }

    const trimmedNotes = notes.trim();

    setSubmitting(true);
    try {
      const doc = createGradingSessionDocument({
        exam: {
          examTitle: title,
          courseName: course,
          examDate,
          totalMarks: marks,
          notes: trimmedNotes.length > 0 ? trimmedNotes : undefined,
          primaryLanguage,
        },
        preferences: {
          gradingStrictness: strictness,
          studentLevel,
          examLevel,
          feedbackStyle,
        },
      });

      saveSessionAndActivate(doc);
      router.push(`/sessions/${doc.id}`);
    } catch {
      setErrorText(t("session.error.save"));
    } finally {
      setSubmitting(false);
    }
  }

  const labelClass = "text-base font-medium leading-snug";

  const controlClass = "min-h-11 text-base";

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-10 pb-12"
      noValidate
    >
      <header className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.12] via-card to-muted/40 p-6 shadow-md ring-1 ring-primary/10 sm:p-8 md:p-10">
        <div
          className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div className="relative space-y-3">
          <h1 className="break-words font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("session.new.title")}
          </h1>
          <p className="max-w-3xl text-pretty text-base text-muted-foreground sm:text-lg">
            {t("session.new.subtitle")}
          </p>
        </div>
      </header>

      {errorText ? (
        <Alert variant="destructive" role="alert">
          <AlertTitle className="sr-only">{t("session.validation.title")}</AlertTitle>
          <AlertDescription>{errorText}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-2 xl:items-start xl:gap-10">
        <Card className="relative min-w-0 overflow-hidden border-primary/12 shadow-sm ring-1 ring-primary/5">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/35 to-transparent"
            aria-hidden
          />
          <CardHeader className="gap-2 pb-4">
            <CardTitle className="text-xl">{t("session.section.exam")}</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              {t("session.section.examHint")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <label htmlFor="exam-title" className={labelClass}>
                {t("session.field.examTitle")}
              </label>
              <Input
                id="exam-title"
                name="exam-title"
                value={examTitle}
                onChange={(event) => setExamTitle(event.target.value)}
                autoComplete="off"
                className={controlClass}
                required
              />
              <div className="space-y-2 pt-1">
                <p className="text-sm text-muted-foreground">
                  {t("session.field.examTitleSuggestions")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {EXAM_TITLE_SUGGESTIONS.map((key) => (
                    <Button
                      key={key}
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="rounded-full px-3 text-sm font-normal shadow-none"
                      onClick={() => setExamTitle(t(key))}
                    >
                      {t(key)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <label htmlFor="course-name" className={labelClass}>
                {t("session.field.courseName")}
              </label>
              <Input
                id="course-name"
                name="course-name"
                value={courseName}
                onChange={(event) => setCourseName(event.target.value)}
                autoComplete="off"
                className={controlClass}
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="exam-date" className={labelClass}>
                {t("session.field.examDate")}
              </label>
              <Input
                id="exam-date"
                name="exam-date"
                type="date"
                value={examDate}
                onChange={(event) => setExamDate(event.target.value)}
                className={controlClass}
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="total-marks" className={labelClass}>
                {t("session.field.totalMarks")}
              </label>
              <Input
                id="total-marks"
                name="total-marks"
                inputMode="numeric"
                min={1}
                step={1}
                value={totalMarks}
                onChange={(event) => setTotalMarks(event.target.value)}
                className={controlClass}
                required
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <span className={labelClass}>{t("session.field.primaryLanguage")}</span>
              <Select
                value={primaryLanguage}
                onValueChange={(value) =>
                  setPrimaryLanguage(value as ExamPrimaryLanguage)
                }
              >
                <SelectTrigger
                  aria-label={t("session.field.primaryLanguage")}
                  className={cn(controlClass, "w-full justify-between")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXAM_LANGUAGE.map((value) => (
                    <SelectItem key={value} value={value}>
                      {labelExamPrimaryLanguage(t, value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {t("session.field.primaryLanguageHint")}
              </p>
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <label htmlFor="exam-notes" className={labelClass}>
                {t("session.field.notes")}
              </label>
              <Textarea
                id="exam-notes"
                name="exam-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                className={cn(controlClass, "min-h-32")}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 border-primary/10 shadow-sm ring-1 ring-muted">
          <CardHeader className="gap-2 pb-4">
            <CardTitle className="text-xl">{t("session.section.prefs")}</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              {t("session.section.prefsHint")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2 xl:col-span-2">
              <span className={labelClass}>{t("session.prefs.strictness")}</span>
              <Select
                value={strictness}
                onValueChange={(value) =>
                  setStrictness(value as GradingStrictness)
                }
              >
                <SelectTrigger
                  aria-label={t("session.prefs.strictness")}
                  className={cn(controlClass, "w-full justify-between")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STRICTNESS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {labelGradingStrictness(t, value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <span className={labelClass}>{t("session.prefs.studentLevel")}</span>
              <Select
                value={studentLevel}
                onValueChange={(value) => setStudentLevel(value as StudentLevel)}
              >
                <SelectTrigger
                  aria-label={t("session.prefs.studentLevel")}
                  className={cn(controlClass, "w-full justify-between")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STUDENT_LEVEL.map((value) => (
                    <SelectItem key={value} value={value}>
                      {labelStudentLevel(t, value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <span className={labelClass}>{t("session.prefs.examLevel")}</span>
              <Select
                value={examLevel}
                onValueChange={(value) => setExamLevel(value as ExamLevel)}
              >
                <SelectTrigger
                  aria-label={t("session.prefs.examLevel")}
                  className={cn(controlClass, "w-full justify-between")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXAM_LEVEL.map((value) => (
                    <SelectItem key={value} value={value}>
                      {labelExamLevelPreference(t, value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <span className={labelClass}>{t("session.prefs.feedbackStyle")}</span>
              <Select
                value={feedbackStyle}
                onValueChange={(value) =>
                  setFeedbackStyle(value as FeedbackStyle)
                }
              >
                <SelectTrigger
                  aria-label={t("session.prefs.feedbackStyle")}
                  className={cn(controlClass, "w-full justify-between")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK.map((value) => (
                    <SelectItem key={value} value={value}>
                      {labelFeedbackStyle(t, value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t bg-muted/30 pt-6 sm:flex-row sm:flex-wrap">
            <Button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="min-h-11 w-full justify-center gap-2 shadow-md sm:w-auto sm:min-h-10 sm:px-8"
            >
              {submitting ? (
                <Loader2Icon className="size-4 shrink-0 animate-spin" aria-hidden />
              ) : null}
              {submitting ? t("session.submitting") : t("session.submit")}
            </Button>
            <Link
              href="/"
              className={cn(
                "inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-input bg-background px-4 text-base font-medium hover:bg-muted sm:w-auto sm:min-h-10 sm:px-6",
              )}
            >
              {t("session.cancel")}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}
