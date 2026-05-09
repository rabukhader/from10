"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PenLineIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import type { ExamQuestion, GradingSessionDocument } from "@/src/domain";
import { labelQuestionType } from "@/src/lib/i18n/question-type-labels";
import {
  createDraftQuestion,
  moveQuestionAt,
  removeQuestionById,
} from "@/src/lib/sessions/question-draft";
import { saveSession } from "@/src/lib/storage/session-repository";

import { ExamMediaUploadCard } from "@/components/questions/exam-media-upload-card";
import { QuestionEditorSheet } from "@/components/questions/question-editor-sheet";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useLocale } from "@/components/providers/locale-provider";

function persistQuestions(
  doc: GradingSessionDocument,
  questions: ExamQuestion[],
): GradingSessionDocument {
  const next: GradingSessionDocument = {
    ...doc,
    questions,
    updatedAt: new Date().toISOString(),
  };
  return saveSession(next);
}

export function QuestionListManager({
  doc,
  onDocumentChange,
}: Readonly<{
  doc: GradingSessionDocument;
  onDocumentChange: (next: GradingSessionDocument) => void;
}>) {
  const { t } = useLocale();
  const [pendingRemoveId, setPendingRemoveId] = React.useState<string | null>(
    null,
  );
  const [editingQuestionId, setEditingQuestionId] = React.useState<
    string | null
  >(null);

  const editingBusy = editingQuestionId !== null;

  const editingQuestion = React.useMemo(() => {
    if (!editingQuestionId) return null;
    return doc.questions.find((question) => question.id === editingQuestionId)
      ?? null;
  }, [doc.questions, editingQuestionId]);

  React.useEffect(() => {
    if (editingQuestionId !== null && !editingQuestion) {
      setEditingQuestionId(null);
    }
  }, [editingQuestionId, editingQuestion]);

  const pendingQuestion = React.useMemo(() => {
    if (!pendingRemoveId) return null;
    return doc.questions.find((question) => question.id === pendingRemoveId)
      ?? null;
  }, [doc.questions, pendingRemoveId]);

  function commit(nextQuestions: ExamQuestion[]): void {
    onDocumentChange(persistQuestions(doc, nextQuestions));
  }

  function handleAdd(): void {
    commit([...doc.questions, createDraftQuestion(doc.questions.length)]);
  }

  function handleMove(index: number, direction: -1 | 1): void {
    commit(moveQuestionAt(doc.questions, index, direction));
  }

  function handleConfirmRemove(): void {
    if (!pendingRemoveId) return;
    const removedId = pendingRemoveId;
    commit(removeQuestionById(doc.questions, removedId));
    setPendingRemoveId(null);
    setEditingQuestionId((previous) =>
      previous === removedId ? null : previous,
    );
  }

  function handleQuestionSave(updated: ExamQuestion): void {
    commit(
      doc.questions.map((question) =>
        question.id === updated.id ? updated : question,
      ),
    );
  }

  return (
    <>
      <ExamMediaUploadCard
        doc={doc}
        onDocumentChange={onDocumentChange}
        disabled={editingBusy}
      />

      <Card className="min-w-0 border-primary/10 shadow-sm ring-1 ring-muted">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl">{t("questions.sectionTitle")}</CardTitle>
          <CardDescription>{t("questions.sectionHint")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {doc.questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("questions.empty")}</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {doc.questions.map((question, index) => (
                <li key={question.id} className="min-w-0">
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="tabular-nums text-sm font-medium text-muted-foreground">
                          {question.questionNumber}.
                        </span>
                        <span className="truncate font-medium">
                          {question.title.trim() ||
                            t("dashboard.recent.untitled")}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          {t("questions.colType")}:{" "}
                          <span className="text-foreground">
                            {labelQuestionType(t, question.type)}
                          </span>
                        </span>
                        <span className="tabular-nums">
                          {t("questions.colMarks")}: {question.totalMark}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="min-h-11 min-w-11 sm:min-h-9 sm:min-w-9"
                        aria-label={t("questions.moveUp")}
                        disabled={editingBusy || index === 0}
                        onClick={() => handleMove(index, -1)}
                      >
                        <ChevronUpIcon className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="min-h-11 min-w-11 sm:min-h-9 sm:min-w-9"
                        aria-label={t("questions.moveDown")}
                        disabled={
                          editingBusy || index === doc.questions.length - 1
                        }
                        onClick={() => handleMove(index, 1)}
                      >
                        <ChevronDownIcon className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="min-h-11 min-w-11 sm:min-h-9 sm:min-w-9"
                        aria-label={t("questions.edit")}
                        disabled={editingBusy}
                        onClick={() => setEditingQuestionId(question.id)}
                      >
                        <PenLineIcon className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        className="min-h-11 min-w-11 sm:min-h-9 sm:min-w-9"
                        aria-label={t("questions.remove")}
                        disabled={editingBusy}
                        onClick={() => setPendingRemoveId(question.id)}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t pt-6 sm:flex-row">
          <Button
            type="button"
            variant="default"
            className="min-h-11 w-full gap-2 sm:w-auto sm:min-h-9"
            disabled={editingBusy}
            onClick={handleAdd}
          >
            <PlusIcon className="size-4" aria-hidden />
            {t("questions.add")}
          </Button>
        </CardFooter>
      </Card>

      <Dialog
        open={pendingRemoveId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemoveId(null);
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>{t("questions.removeTitle")}</DialogTitle>
            <DialogDescription>
              {t("questions.removeDescription")}
              {pendingQuestion?.title ? (
                <span className="mt-2 block font-medium text-foreground">
                  {pendingQuestion.title}
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 sm:min-h-9"
              onClick={() => setPendingRemoveId(null)}
            >
              {t("questions.removeCancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11 sm:min-h-9"
              onClick={handleConfirmRemove}
            >
              {t("questions.removeConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <QuestionEditorSheet
        open={editingQuestionId !== null}
        onOpenChange={(open) => {
          if (!open) setEditingQuestionId(null);
        }}
        question={editingQuestion}
        onSave={handleQuestionSave}
      />
    </>
  );
}
