"use client";

import * as React from "react";
import { DownloadIcon, Trash2Icon, UploadIcon } from "lucide-react";

import type { ExamQuestion, Submission, SubmissionFileRef } from "@/src/domain";
import { formatFileSize } from "@/src/lib/submissions/format-file-size";
import { inferSubmissionFileKind } from "@/src/lib/submissions/infer-submission-file-kind";
import { createEmptySubmission } from "@/src/lib/submissions/submission-draft";
import {
  deleteSubmissionFile,
  getSubmissionFile,
  hasIndexedDb,
  putSubmissionFile,
} from "@/src/lib/storage";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { useLocale } from "@/components/providers/locale-provider";

import { cn } from "@/lib/utils";

type AnswerChannel = "text" | "attachment";

type SubmissionEditorProps = Readonly<{
  sessionId: string;
  participantId: string;
  submission: Submission | null;
  /** Defaults to empty when omitted (per-question UI disabled until questions exist). */
  questions?: ExamQuestion[];
  onSaved: (next: Submission) => void;
}>;

function sortExamQuestions(
  questions: ExamQuestion[] | undefined,
): ExamQuestion[] {
  if (!Array.isArray(questions) || questions.length === 0) return [];
  return [...questions].sort((a, b) => a.questionNumber - b.questionNumber);
}

export function SubmissionEditor({
  sessionId,
  participantId,
  submission,
  questions = [],
  onSaved,
}: SubmissionEditorProps) {
  const { t } = useLocale();
  const sortedQuestions = React.useMemo(
    () => sortExamQuestions(questions),
    [questions],
  );

  const [layoutMode, setLayoutMode] = React.useState<
    "combined" | "per_question"
  >(() =>
    submission?.layout === "per_question" ? "per_question" : "combined",
  );

  const [combinedPaste, setCombinedPaste] = React.useState("");
  const [fileRefs, setFileRefs] = React.useState<SubmissionFileRef[]>([]);
  const [pendingCombined, setPendingCombined] = React.useState<File[]>([]);
  const [pendingByQuestion, setPendingByQuestion] = React.useState<
    Record<string, File[]>
  >({});
  const [perQuestionPaste, setPerQuestionPaste] = React.useState<
    Record<string, string>
  >({});
  const [channelByQuestionId, setChannelByQuestionId] = React.useState<
    Record<string, AnswerChannel>
  >({});

  const [removedRefIds, setRemovedRefIds] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [saving, setSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const combinedFileInputRef = React.useRef<HTMLInputElement>(null);
  const draftSubmissionRef = React.useRef<Submission | null>(null);

  React.useEffect(() => {
    draftSubmissionRef.current = submission ?? null;
  }, [submission]);

  const hydrateFromStoredSubmission = React.useCallback(
    (layoutTarget: "combined" | "per_question"): void => {
      setLayoutMode(layoutTarget);
      setPendingCombined([]);
      setPendingByQuestion({});
      setRemovedRefIds(new Set());
      setErrorMessage(null);

      const files = submission?.files ?? [];
      setFileRefs(files);

      if (layoutTarget === "combined") {
        setCombinedPaste(submission?.pastedText ?? "");
        setPerQuestionPaste({});
        setChannelByQuestionId({});
        return;
      }

      setCombinedPaste("");
      const paste: Record<string, string> = {};
      const channels: Record<string, AnswerChannel> = {};
      for (const q of sortExamQuestions(questions)) {
        paste[q.id] = submission?.answersByQuestionId?.[q.id]?.pastedText ?? "";
        const hasAtt = files.some((f) => f.questionId === q.id);
        channels[q.id] = hasAtt ? "attachment" : "text";
      }
      setPerQuestionPaste(paste);
      setChannelByQuestionId(channels);
    },
    [submission, questions],
  );

  React.useEffect(() => {
    const layout =
      submission?.layout === "per_question" ? "per_question" : "combined";
    hydrateFromStoredSubmission(layout);
  }, [participantId, submission, hydrateFromStoredSubmission]);

  const labelClass = "text-sm font-medium leading-none";
  const controlClass = "min-h-11 text-base md:min-h-8 md:text-sm";

  function getBaseSubmission(): Submission {
    if (submission) return submission;
    if (!draftSubmissionRef.current) {
      draftSubmissionRef.current = createEmptySubmission(
        sessionId,
        participantId,
      );
    }
    return draftSubmissionRef.current;
  }

  function handlePickCombinedFiles(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const list = event.target.files;
    if (!list?.length) return;
    if (!hasIndexedDb()) {
      setErrorMessage(t("submissions.error.noIndexedDb"));
      event.target.value = "";
      return;
    }
    setErrorMessage(null);
    setPendingCombined((previous) => [...previous, ...Array.from(list)]);
    event.target.value = "";
  }

  function handlePickQuestionFiles(
    questionId: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const list = event.target.files;
    if (!list?.length) return;
    if (!hasIndexedDb()) {
      setErrorMessage(t("submissions.error.noIndexedDb"));
      event.target.value = "";
      return;
    }
    setErrorMessage(null);
    setPendingByQuestion((previous) => ({
      ...previous,
      [questionId]: [...(previous[questionId] ?? []), ...Array.from(list)],
    }));
    event.target.value = "";
  }

  function removePendingCombinedAt(index: number): void {
    setPendingCombined((previous) => previous.filter((_, i) => i !== index));
  }

  function removePendingQuestionAt(questionId: string, index: number): void {
    setPendingByQuestion((previous) => ({
      ...previous,
      [questionId]: (previous[questionId] ?? []).filter((_, i) => i !== index),
    }));
  }

  function removeExistingRef(refId: string): void {
    setRemovedRefIds((previous) => new Set(previous).add(refId));
    setFileRefs((previous) => previous.filter((ref) => ref.id !== refId));
  }

  async function handleDownload(ref: SubmissionFileRef): Promise<void> {
    const record = await getSubmissionFile(ref.id);
    if (!record?.blob) return;
    const url = URL.createObjectURL(record.blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = ref.originalName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function storeBlobAsSubmissionFile(params: {
    file: File;
    questionId?: string;
  }): Promise<SubmissionFileRef> {
    const { file, questionId } = params;
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
    const mimeType = file.type || "application/octet-stream";
    const ref: SubmissionFileRef = {
      id,
      kind: inferSubmissionFileKind(mimeType, file.name),
      originalName: file.name,
      mimeType,
      size: file.size,
      ...(questionId ? { questionId } : {}),
    };

    await putSubmissionFile({
      id,
      sessionId,
      participantId,
      fileName: file.name,
      mimeType,
      size: file.size,
      blob: file,
      createdAt: new Date().toISOString(),
    });

    return ref;
  }

  async function handleSave(): Promise<void> {
    setSaving(true);
    setErrorMessage(null);

    try {
      const base = getBaseSubmission();

      for (const id of removedRefIds) {
        await deleteSubmissionFile(id);
      }

      if (
        (pendingCombined.length > 0 ||
          Object.values(pendingByQuestion).some((a) => a.length > 0)) &&
        !hasIndexedDb()
      ) {
        setErrorMessage(t("submissions.error.noIndexedDb"));
        setSaving(false);
        return;
      }

      const nextRefs: SubmissionFileRef[] = [];
      const iso = new Date().toISOString();

      if (layoutMode === "combined") {
        const keptFromDoc = (submission?.files ?? []).filter(
          (ref) => !removedRefIds.has(ref.id) && !ref.questionId,
        );
        nextRefs.push(...keptFromDoc);

        const orphanedScoped = (submission?.files ?? []).filter(
          (ref) => !removedRefIds.has(ref.id) && ref.questionId,
        );
        for (const ref of orphanedScoped) {
          await deleteSubmissionFile(ref.id);
        }

        for (const file of pendingCombined) {
          nextRefs.push(await storeBlobAsSubmissionFile({ file }));
        }

        const trimmed = combinedPaste.trim();
        const next: Submission = {
          ...base,
          sessionId,
          participantId,
          layout: "combined",
          answersByQuestionId: undefined,
          pastedText: trimmed ? trimmed : undefined,
          files: nextRefs,
          updatedAt: iso,
        };

        onSaved(next);
        setPendingCombined([]);
        setRemovedRefIds(new Set());
        draftSubmissionRef.current = next;
        return;
      }

      const strayCombined = fileRefs.filter(
        (ref) => !removedRefIds.has(ref.id) && !ref.questionId,
      );
      for (const ref of strayCombined) {
        await deleteSubmissionFile(ref.id);
      }

      for (const q of sortedQuestions) {
        const channel = channelByQuestionId[q.id] ?? "text";
        const keptForQ = fileRefs.filter(
          (ref) => !removedRefIds.has(ref.id) && ref.questionId === q.id,
        );

        if (channel === "attachment") {
          nextRefs.push(...keptForQ);
          for (const file of pendingByQuestion[q.id] ?? []) {
            nextRefs.push(
              await storeBlobAsSubmissionFile({
                file,
                questionId: q.id,
              }),
            );
          }
        } else {
          for (const ref of keptForQ) {
            await deleteSubmissionFile(ref.id);
          }
        }
      }

      const answersByQuestionId: Record<string, { pastedText?: string }> = {};
      for (const q of sortedQuestions) {
        const channel = channelByQuestionId[q.id] ?? "text";
        if (channel !== "text") continue;
        const trimmed = (perQuestionPaste[q.id] ?? "").trim();
        if (trimmed) answersByQuestionId[q.id] = { pastedText: trimmed };
      }

      const next: Submission = {
        ...base,
        sessionId,
        participantId,
        layout: "per_question",
        pastedText: undefined,
        answersByQuestionId:
          Object.keys(answersByQuestionId).length > 0
            ? answersByQuestionId
            : undefined,
        files: nextRefs,
        updatedAt: iso,
      };

      onSaved(next);
      setPendingByQuestion({});
      setPendingCombined([]);
      setRemovedRefIds(new Set());
      draftSubmissionRef.current = next;
    } catch {
      setErrorMessage(t("submissions.error.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  const combinedRefs = fileRefs.filter((r) => !r.questionId);

  function setChannel(questionId: string, channel: AnswerChannel): void {
    setChannelByQuestionId((previous) => ({
      ...previous,
      [questionId]: channel,
    }));
  }

  return (
    <section className="grid gap-4">
      <div>
        <h3 className="font-heading text-sm font-medium">
          {t("submissions.sectionTitle")}
        </h3>
        <p className="mt-1 text-pretty text-xs text-muted-foreground">
          {t("submissions.sectionHint")}
        </p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-3">
        <p className={cn(labelClass, "mb-2")}>
          {t("submissions.layoutModeLabel")}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant={layoutMode === "combined" ? "default" : "outline"}
            size="sm"
            className="min-h-9 w-full sm:w-auto"
            onClick={() => hydrateFromStoredSubmission("combined")}
          >
            {t("submissions.layoutCombined")}
          </Button>
          <Button
            type="button"
            variant={layoutMode === "per_question" ? "default" : "outline"}
            size="sm"
            className="min-h-9 w-full sm:w-auto"
            disabled={sortedQuestions.length === 0}
            title={
              sortedQuestions.length === 0
                ? t("submissions.layoutPerQuestionDisabledHint")
                : undefined
            }
            onClick={() => hydrateFromStoredSubmission("per_question")}
          >
            {t("submissions.layoutPerQuestion")}
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {layoutMode === "combined"
            ? t("submissions.layoutCombinedHint")
            : t("submissions.layoutPerQuestionHint")}
        </p>
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {layoutMode === "combined" ? (
        <>
          <div className="grid gap-2">
            <label htmlFor="sub-paste" className={labelClass}>
              {t("submissions.field.pastedText")}
            </label>
            <Textarea
              id="sub-paste"
              value={combinedPaste}
              onChange={(event) => setCombinedPaste(event.target.value)}
              rows={8}
              className={cn(controlClass, "min-h-44")}
              placeholder={t("submissions.pastePlaceholder")}
            />
          </div>

          <Separator />

          <div className="grid gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className={labelClass}>{t("submissions.field.upload")}</span>
              <input
                ref={combinedFileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,application/pdf,text/*,.txt,.md,.csv"
                className="sr-only"
                onChange={handlePickCombinedFiles}
              />
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full gap-2 sm:w-auto sm:min-h-9"
                onClick={() => combinedFileInputRef.current?.click()}
              >
                <UploadIcon className="size-4" aria-hidden />
                {t("submissions.chooseFiles")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("submissions.uploadHintCombined")}
            </p>

            {combinedRefs.length > 0 || pendingCombined.length > 0 ? (
              <ul className="space-y-2 rounded-lg border p-3">
                <li className="text-xs font-medium text-muted-foreground">
                  {t("submissions.filesTitle")}
                </li>
                {combinedRefs.map((ref) => (
                  <li
                    key={ref.id}
                    className="flex flex-col gap-2 rounded-md bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {ref.originalName}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatFileSize(ref.size)} · {ref.mimeType}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-9"
                        onClick={() => void handleDownload(ref)}
                      >
                        <DownloadIcon className="size-4" aria-hidden />
                        {t("submissions.downloadFile")}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="min-h-9 min-w-9 text-destructive hover:text-destructive"
                        aria-label={t("submissions.removeFile")}
                        onClick={() => removeExistingRef(ref.id)}
                      >
                        <Trash2Icon className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </li>
                ))}
                {pendingCombined.map((file, index) => (
                  <li
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex flex-col gap-2 rounded-md border border-dashed p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("submissions.pendingUpload")} ·{" "}
                        <span className="tabular-nums">
                          {formatFileSize(file.size)}
                        </span>
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="min-h-9 min-w-9 shrink-0 self-end text-destructive hover:text-destructive sm:self-center"
                      aria-label={t("submissions.removeFile")}
                      onClick={() => removePendingCombinedAt(index)}
                    >
                      <Trash2Icon className="size-4" aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("submissions.emptyFiles")}
              </p>
            )}
          </div>
        </>
      ) : sortedQuestions.length === 0 ? (
        <Alert>
          <AlertDescription>
            {t("submissions.perQuestionNoExamQuestions")}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            {t("submissions.perQuestionIntro")}
          </p>
          {sortedQuestions.map((question) => {
            const channel = channelByQuestionId[question.id] ?? "text";
            const refsForQ = fileRefs.filter((r) => r.questionId === question.id);
            const pending = pendingByQuestion[question.id] ?? [];

            return (
              <div
                key={question.id}
                className="rounded-lg border bg-card p-4 shadow-sm"
              >
                <h4 className="font-heading text-sm font-semibold">
                  <span className="tabular-nums text-muted-foreground">
                    Q{question.questionNumber}.
                  </span>{" "}
                  {question.title.trim() || t("dashboard.recent.untitled")}
                </h4>
                <Tabs
                  value={channel}
                  onValueChange={(value) =>
                    setChannel(question.id, value as AnswerChannel)
                  }
                  className="mt-3 gap-3"
                >
                  <TabsList variant="line" className="w-full max-w-md">
                    <TabsTrigger value="text">
                      {t("submissions.answerAsText")}
                    </TabsTrigger>
                    <TabsTrigger value="attachment">
                      {t("submissions.answerAsAttachment")}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="text" className="mt-3">
                    <label
                      className={cn(labelClass, "mb-2 block")}
                      htmlFor={`pq-${question.id}`}
                    >
                      {t("submissions.perQuestionTextLabel")}
                    </label>
                    <Textarea
                      id={`pq-${question.id}`}
                      value={perQuestionPaste[question.id] ?? ""}
                      onChange={(event) =>
                        setPerQuestionPaste((previous) => ({
                          ...previous,
                          [question.id]: event.target.value,
                        }))
                      }
                      rows={5}
                      className={cn(controlClass, "min-h-32")}
                      placeholder={t("submissions.perQuestionTextPlaceholder")}
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t("submissions.afterAnswerGradeHint")}
                    </p>
                  </TabsContent>
                  <TabsContent value="attachment" className="mt-3 space-y-3">
                    <input
                      id={`sub-file-${question.id}`}
                      type="file"
                      multiple
                      accept="image/*,.pdf,application/pdf,text/*,.txt,.md,.csv"
                      className="sr-only"
                      onChange={(event) =>
                        handlePickQuestionFiles(question.id, event)
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-h-9 gap-2"
                      onClick={() =>
                        document.getElementById(`sub-file-${question.id}`)?.click()
                      }
                    >
                      <UploadIcon className="size-4" aria-hidden />
                      {t("submissions.chooseFiles")}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {t("submissions.perQuestionAttachmentHint")}
                    </p>
                    {refsForQ.length > 0 || pending.length > 0 ? (
                      <ul className="space-y-2 rounded-md border p-2">
                        {refsForQ.map((ref) => (
                          <li
                            key={ref.id}
                            className="flex flex-col gap-2 rounded-md bg-muted/40 p-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {ref.originalName}
                              </p>
                              <p className="text-xs text-muted-foreground tabular-nums">
                                {formatFileSize(ref.size)} · {ref.mimeType}
                              </p>
                            </div>
                            <div className="flex shrink-0 gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="min-h-9"
                                onClick={() => void handleDownload(ref)}
                              >
                                <DownloadIcon className="size-4" aria-hidden />
                                {t("submissions.downloadFile")}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="min-h-9 min-w-9 text-destructive hover:text-destructive"
                                aria-label={t("submissions.removeFile")}
                                onClick={() => removeExistingRef(ref.id)}
                              >
                                <Trash2Icon className="size-4" aria-hidden />
                              </Button>
                            </div>
                          </li>
                        ))}
                        {pending.map((file, index) => (
                          <li
                            key={`${question.id}-${file.name}-${index}`}
                            className="flex flex-col gap-2 rounded-md border border-dashed p-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {t("submissions.pendingUpload")}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="min-h-9 min-w-9 text-destructive hover:text-destructive"
                              aria-label={t("submissions.removeFile")}
                              onClick={() =>
                                removePendingQuestionAt(question.id, index)
                              }
                            >
                              <Trash2Icon className="size-4" aria-hidden />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      {t("submissions.afterAnswerGradeHint")}
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
            );
          })}
        </div>
      )}

      <Button
        type="button"
        className="min-h-11 w-full sm:w-auto sm:min-h-9"
        disabled={saving}
        onClick={() => void handleSave()}
      >
        {saving ? t("submissions.saving") : t("submissions.save")}
      </Button>
    </section>
  );
}
