"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";

import type {
  ExamLevel,
  ExamPrimaryLanguage,
  FeedbackStyle,
  GradingSessionDocument,
  GradingStrictness,
  StudentLevel,
} from "@/src/domain";
import { normalizeExamPrimaryLanguage } from "@/src/domain";
import {
  labelExamLevelPreference,
  labelFeedbackStyle,
  labelGradingStrictness,
  labelStudentLevel,
} from "@/src/lib/i18n/preference-labels";
import { labelExamPrimaryLanguage } from "@/src/lib/i18n/exam-language-labels";
import { saveSession } from "@/src/lib/storage/session-repository";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

function examDateToInputValue(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const sliced = trimmed.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(sliced)) return sliced;
  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10);
  }
  return "";
}

export function SessionDetailsEditDialog({
  doc,
  open,
  onOpenChange,
  onSaved,
}: Readonly<{
  doc: GradingSessionDocument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (next: GradingSessionDocument) => void;
}>) {
  const { t } = useLocale();

  const [examTitle, setExamTitle] = React.useState(doc.exam.examTitle);
  const [courseName, setCourseName] = React.useState(doc.exam.courseName);
  const [examDate, setExamDate] = React.useState(() =>
    examDateToInputValue(doc.exam.examDate),
  );
  const [totalMarks, setTotalMarks] = React.useState(String(doc.exam.totalMarks));
  const [notes, setNotes] = React.useState(doc.exam.notes ?? "");

  const [strictness, setStrictness] = React.useState<GradingStrictness>(
    doc.preferences.gradingStrictness,
  );
  const [studentLevel, setStudentLevel] = React.useState<StudentLevel>(
    doc.preferences.studentLevel,
  );
  const [examLevel, setExamLevel] = React.useState<ExamLevel>(
    doc.preferences.examLevel,
  );
  const [feedbackStyle, setFeedbackStyle] = React.useState<FeedbackStyle>(
    doc.preferences.feedbackStyle,
  );

  const [primaryLanguage, setPrimaryLanguage] =
    React.useState<ExamPrimaryLanguage>(() =>
      normalizeExamPrimaryLanguage(doc.exam.primaryLanguage),
    );

  const [submitting, setSubmitting] = React.useState(false);
  const [errorText, setErrorText] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setExamTitle(doc.exam.examTitle);
    setCourseName(doc.exam.courseName);
    setExamDate(examDateToInputValue(doc.exam.examDate));
    setTotalMarks(String(doc.exam.totalMarks));
    setNotes(doc.exam.notes ?? "");
    setStrictness(doc.preferences.gradingStrictness);
    setStudentLevel(doc.preferences.studentLevel);
    setExamLevel(doc.preferences.examLevel);
    setFeedbackStyle(doc.preferences.feedbackStyle);
    setPrimaryLanguage(normalizeExamPrimaryLanguage(doc.exam.primaryLanguage));
    setErrorText(null);
  }, [open, doc]);

  function handleSave(event: React.FormEvent<HTMLFormElement>): void {
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
      const iso = new Date().toISOString();
      const next: GradingSessionDocument = {
        ...doc,
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
        updatedAt: iso,
      };

      const saved = saveSession(next);
      onSaved(saved);
      onOpenChange(false);
    } catch {
      setErrorText(t("session.error.save"));
    } finally {
      setSubmitting(false);
    }
  }

  const labelClass = "text-sm font-medium leading-snug text-foreground";
  const controlClass = "min-h-11 text-sm md:min-h-10";
  const sectionTitleClass =
    "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "flex max-h-[min(92dvh,46rem)] w-[min(100%-2rem,40rem)] flex-col gap-0 overflow-hidden p-0",
          "border-primary/15 shadow-lg ring-1 ring-black/[0.06] sm:max-w-xl dark:ring-white/10",
        )}
      >
        <div
          className="h-1 shrink-0 bg-gradient-to-r from-primary/50 via-primary/25 to-transparent"
          aria-hidden
        />
        <form
          onSubmit={handleSave}
          className="flex min-h-0 flex-1 flex-col"
          noValidate
        >
          <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto px-5 pb-6 pt-10 sm:px-6 sm:pb-8 sm:pt-12">
            <DialogHeader className="space-y-2.5 text-left">
              <DialogTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
                {t("session.workspace.editSession")}
              </DialogTitle>
              <DialogDescription className="text-pretty text-base leading-relaxed">
                {t("session.workspace.editSessionHint")}
              </DialogDescription>
            </DialogHeader>

            {errorText ? (
              <Alert variant="destructive" role="alert">
                <AlertTitle className="sr-only">
                  {t("session.validation.title")}
                </AlertTitle>
                <AlertDescription>{errorText}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-4 rounded-xl border border-border/80 bg-muted/25 p-4 shadow-sm sm:p-5">
              <p className={sectionTitleClass}>{t("session.section.exam")}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                  <label htmlFor="edit-exam-title" className={labelClass}>
                    {t("session.field.examTitle")}
                  </label>
                  <Input
                    id="edit-exam-title"
                    value={examTitle}
                    onChange={(event) => setExamTitle(event.target.value)}
                    autoComplete="off"
                    className={controlClass}
                  />
                  <div className="flex flex-wrap gap-2 pt-1">
                    {EXAM_TITLE_SUGGESTIONS.map((key) => (
                      <Button
                        key={key}
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8 rounded-full border-border/60 px-3 text-xs font-normal shadow-none"
                        onClick={() => setExamTitle(t(key))}
                      >
                        {t(key)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <label htmlFor="edit-course-name" className={labelClass}>
                    {t("session.field.courseName")}
                  </label>
                  <Input
                    id="edit-course-name"
                    value={courseName}
                    onChange={(event) => setCourseName(event.target.value)}
                    autoComplete="off"
                    className={controlClass}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-exam-date" className={labelClass}>
                    {t("session.field.examDate")}
                  </label>
                  <Input
                    id="edit-exam-date"
                    type="date"
                    value={examDate}
                    onChange={(event) => setExamDate(event.target.value)}
                    className={controlClass}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-total-marks" className={labelClass}>
                    {t("session.field.totalMarks")}
                  </label>
                  <Input
                    id="edit-total-marks"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    value={totalMarks}
                    onChange={(event) => setTotalMarks(event.target.value)}
                    className={cn(controlClass, "tabular-nums")}
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
                    <SelectTrigger className={cn(controlClass, "w-full")}>
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
                  <p className="text-xs text-muted-foreground">
                    {t("session.field.primaryLanguageHint")}
                  </p>
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <label htmlFor="edit-exam-notes" className={labelClass}>
                    {t("session.field.notes")}
                  </label>
                  <Textarea
                    id="edit-exam-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={3}
                    className={cn(controlClass, "min-h-24")}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 rounded-xl border border-border/80 bg-muted/25 p-4 shadow-sm sm:p-5">
              <p className={sectionTitleClass}>{t("session.section.prefs")}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                  <span className={labelClass}>{t("session.prefs.strictness")}</span>
                  <Select
                    value={strictness}
                    onValueChange={(value) =>
                      setStrictness(value as GradingStrictness)
                    }
                  >
                    <SelectTrigger className={cn(controlClass, "w-full")}>
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
                    onValueChange={(value) =>
                      setStudentLevel(value as StudentLevel)
                    }
                  >
                    <SelectTrigger className={cn(controlClass, "w-full")}>
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
                    <SelectTrigger className={cn(controlClass, "w-full")}>
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
                    <SelectTrigger className={cn(controlClass, "w-full")}>
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
              </div>
            </div>
          </div>

          <DialogFooter
            className={cn(
              "!mx-0 !mb-0 shrink-0 rounded-b-xl border-t border-border/80 bg-muted/40 px-5 py-4 sm:px-6",
              "flex-col-reverse gap-2 sm:flex-row sm:justify-end",
            )}
          >
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full sm:min-h-10 sm:w-auto"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              {t("session.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="min-h-11 w-full gap-2 sm:min-h-10 sm:w-auto"
            >
              {submitting ? (
                <Loader2Icon className="size-4 animate-spin" aria-hidden />
              ) : null}
              {submitting ? t("session.submitting") : t("session.workspace.saveChanges")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
