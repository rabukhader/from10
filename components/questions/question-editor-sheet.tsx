"use client";

import * as React from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";

import type { ExamQuestion, GradingCriterion } from "@/src/domain";
import { i18nConfig } from "@/src/config";
import {
  QUESTION_TYPES_ORDER,
  labelQuestionType,
} from "@/src/lib/i18n/question-type-labels";
import {
  sanitizeExamQuestion,
  validateExamQuestionForSave,
} from "@/src/lib/questions/validate-exam-question";
import { createDraftCriterion } from "@/src/lib/sessions/criterion-draft";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { useLocale } from "@/components/providers/locale-provider";

import { cn } from "@/lib/utils";

export function QuestionEditorSheet({
  open,
  onOpenChange,
  question,
  onSave,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: ExamQuestion | null;
  onSave: (next: ExamQuestion) => void;
}>) {
  const { t, locale } = useLocale();
  const sheetSide =
    i18nConfig.localeDirection[locale] === "rtl" ? "left" : "right";

  const [draft, setDraft] = React.useState<ExamQuestion | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || !question) {
      setDraft(null);
      setFormError(null);
      return;
    }

    const clone = structuredClone(question);
    if (clone.criteria.length === 0) {
      clone.criteria = [createDraftCriterion()];
    }

    setDraft(clone);
    setFormError(null);
  }, [open, question]);

  function applyDraft(updater: (previous: ExamQuestion) => ExamQuestion): void {
    setFormError(null);
    setDraft((previous) => {
      if (!previous) return previous;
      return updater(previous);
    });
  }

  function patchCriterion(
    criterionId: string,
    patch: Partial<GradingCriterion>,
  ): void {
    applyDraft((previous) => ({
      ...previous,
      criteria: previous.criteria.map((criterion) =>
        criterion.id === criterionId ? { ...criterion, ...patch } : criterion,
      ),
    }));
  }

  function handleAddCriterion(): void {
    applyDraft((previous) => ({
      ...previous,
      criteria: [...previous.criteria, createDraftCriterion()],
    }));
  }

  function handleRemoveCriterion(criterionId: string): void {
    applyDraft((previous) => {
      if (previous.criteria.length <= 1) return previous;
      return {
        ...previous,
        criteria: previous.criteria.filter(
          (criterion) => criterion.id !== criterionId,
        ),
      };
    });
  }

  function handleSave(): void {
    if (!draft) return;
    const cleaned = sanitizeExamQuestion(draft);
    const message = validateExamQuestionForSave(cleaned, t);
    if (message) {
      setFormError(message);
      return;
    }

    onSave(cleaned);
    onOpenChange(false);
  }

  const labelClass = "text-sm font-medium leading-none";
  const controlClass = "min-h-11 text-base md:min-h-8 md:text-sm";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={sheetSide}
        showCloseButton
        className="flex h-[100dvh] max-h-[100dvh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
          <SheetTitle>{t("question.editor.title")}</SheetTitle>
          <SheetDescription className="text-pretty">
            {draft
              ? `${t("question.field.questionNumber")}: ${draft.questionNumber}. ${t("question.editor.subtitle")}`
              : null}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          {!draft ? (
            <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : (
            <div className="flex flex-col gap-6 pb-4">
              {formError ? (
                <Alert variant="destructive">
                  <AlertTitle className="sr-only">
                    {t("session.validation.title")}
                  </AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}

              <section className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="qe-title" className={labelClass}>
                    {t("question.field.title")}
                  </label>
                  <Input
                    id="qe-title"
                    value={draft.title}
                    onChange={(event) =>
                      applyDraft((previous) => ({
                        ...previous,
                        title: event.target.value,
                      }))
                    }
                    className={controlClass}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="qe-body" className={labelClass}>
                    {t("question.field.body")}
                  </label>
                  <Textarea
                    id="qe-body"
                    value={draft.body}
                    onChange={(event) =>
                      applyDraft((previous) => ({
                        ...previous,
                        body: event.target.value,
                      }))
                    }
                    rows={5}
                    className={cn(controlClass, "min-h-32")}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <span className={labelClass}>{t("question.field.type")}</span>
                    <Select
                      value={draft.type}
                      onValueChange={(value) =>
                        applyDraft((previous) => ({
                          ...previous,
                          type: value as ExamQuestion["type"],
                        }))
                      }
                    >
                      <SelectTrigger
                        aria-label={t("question.field.type")}
                        className={cn(controlClass, "w-full justify-between")}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUESTION_TYPES_ORDER.map((type) => (
                          <SelectItem key={type} value={type}>
                            {labelQuestionType(t, type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="qe-total" className={labelClass}>
                      {t("question.field.totalMarks")}
                    </label>
                    <Input
                      id="qe-total"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      value={
                        Number.isFinite(draft.totalMark) &&
                        !Number.isNaN(draft.totalMark)
                          ? String(draft.totalMark)
                          : ""
                      }
                      onChange={(event) => {
                        const raw = event.target.value;
                        const parsed =
                          raw === ""
                            ? Number.NaN
                            : Number.parseInt(raw, 10);
                        applyDraft((previous) => ({
                          ...previous,
                          totalMark: parsed,
                        }));
                      }}
                      className={controlClass}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="qe-notes" className={labelClass}>
                    {t("question.field.notes")}
                  </label>
                  <Textarea
                    id="qe-notes"
                    value={draft.notes ?? ""}
                    onChange={(event) =>
                      applyDraft((previous) => ({
                        ...previous,
                        notes: event.target.value,
                      }))
                    }
                    rows={3}
                    className={cn(controlClass, "min-h-24")}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="qe-model" className={labelClass}>
                    {t("question.field.modelAnswer")}
                  </label>
                  <Textarea
                    id="qe-model"
                    value={draft.modelAnswer ?? ""}
                    onChange={(event) =>
                      applyDraft((previous) => ({
                        ...previous,
                        modelAnswer: event.target.value,
                      }))
                    }
                    rows={4}
                    className={cn(controlClass, "min-h-28")}
                  />
                </div>
              </section>

              <Separator />

              <section className="grid gap-4">
                <div>
                  <h3 className="font-heading text-sm font-medium">
                    {t("criteria.sectionTitle")}
                  </h3>
                  <p className="mt-1 text-pretty text-xs text-muted-foreground">
                    {t("criteria.sectionHint")}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {draft.criteria.map((criterion, criterionIndex) => (
                    <div
                      key={criterion.id}
                      className="rounded-lg border bg-card p-4 shadow-sm"
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {t("criteria.rowLabel")} {criterionIndex + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="min-h-9 min-w-9 shrink-0 text-destructive hover:text-destructive"
                          aria-label={t("criteria.remove")}
                          disabled={draft.criteria.length <= 1}
                          onClick={() => handleRemoveCriterion(criterion.id)}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>

                      <div className="grid gap-3">
                        <div className="grid gap-2">
                          <label
                            className={labelClass}
                            htmlFor={`crit-title-${criterion.id}`}
                          >
                            {t("criteria.field.title")}
                          </label>
                          <Input
                            id={`crit-title-${criterion.id}`}
                            value={criterion.title}
                            onChange={(event) =>
                              patchCriterion(criterion.id, {
                                title: event.target.value,
                              })
                            }
                            className={controlClass}
                          />
                        </div>

                        <div className="grid gap-2">
                          <label
                            className={labelClass}
                            htmlFor={`crit-desc-${criterion.id}`}
                          >
                            {t("criteria.field.description")}
                          </label>
                          <Textarea
                            id={`crit-desc-${criterion.id}`}
                            value={criterion.description}
                            onChange={(event) =>
                              patchCriterion(criterion.id, {
                                description: event.target.value,
                              })
                            }
                            rows={2}
                            className={cn(controlClass, "min-h-20")}
                          />
                        </div>

                        <div className="grid gap-2 sm:max-w-[12rem]">
                          <label
                            className={labelClass}
                            htmlFor={`crit-mark-${criterion.id}`}
                          >
                            {t("criteria.field.mark")}
                          </label>
                          <Input
                            id={`crit-mark-${criterion.id}`}
                            inputMode="numeric"
                            min={0}
                            step={1}
                            value={
                              Number.isFinite(criterion.mark) &&
                              !Number.isNaN(criterion.mark)
                                ? String(criterion.mark)
                                : ""
                            }
                            onChange={(event) => {
                              const raw = event.target.value;
                              const parsed =
                                raw === ""
                                  ? Number.NaN
                                  : Number.parseInt(raw, 10);
                              patchCriterion(criterion.id, { mark: parsed });
                            }}
                            className={controlClass}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full gap-2 sm:w-auto sm:min-h-9"
                  onClick={handleAddCriterion}
                >
                  <PlusIcon className="size-4" aria-hidden />
                  {t("criteria.add")}
                </Button>
              </section>
            </div>
          )}
        </div>

        <SheetFooter className="shrink-0 gap-2 border-t bg-popover px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full sm:w-auto sm:min-h-9"
            onClick={() => onOpenChange(false)}
          >
            {t("question.editor.cancel")}
          </Button>
          <Button
            type="button"
            className="min-h-11 w-full sm:w-auto sm:min-h-9"
            disabled={!draft}
            onClick={handleSave}
          >
            {t("question.editor.save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
