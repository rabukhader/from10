"use client";

import * as React from "react";
import { ImageUpIcon, Loader2Icon } from "lucide-react";

import type { ExamQuestion, GradingSessionDocument } from "@/src/domain";
import { normalizeExamPrimaryLanguage } from "@/src/domain";
import { appConfig } from "@/src/config";
import { extractExamFromImagesWithOpenAi } from "@/src/lib/ai";
import { filesToVisionDataUrls } from "@/src/lib/exam-upload/files-to-vision-data-urls";
import { getOpenAiCompatibleCredentials } from "@/src/lib/storage/openai-key";
import { saveSession } from "@/src/lib/storage/session-repository";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useLocale } from "@/components/providers/locale-provider";

import { cn } from "@/lib/utils";

import { isPdfFile } from "@/src/lib/pdf/is-pdf-file";

const IMAGE_MIME = /^image\/(jpeg|png|webp|gif)$/i;

const MAX_FILES_SELECTED = 32;

/** OS file-picker hint; include explicit MIME + extension + wildcard for compatibility (esp. Windows). */
const FILE_INPUT_ACCEPT =
  "application/pdf,.pdf,image/jpeg,image/png,image/webp,image/gif,image/*";

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

export function ExamMediaUploadCard({
  doc,
  onDocumentChange,
  disabled = false,
}: Readonly<{
  doc: GradingSessionDocument;
  onDocumentChange: (next: GradingSessionDocument) => void;
  /** Disable uploads while a question editor is open. */
  disabled?: boolean;
}>) {
  const { t, locale } = useLocale();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = React.useState<File[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [info, setInfo] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [replaceOpen, setReplaceOpen] = React.useState(false);

  const localeHint =
    locale === "ar"
      ? "قد يكون محتوى الامتحان بالعربية أو الإنجليزية؛ احتفظ باللغة الظاهرة على الصفحات."
      : "The exam may be in English or Arabic — preserve the language printed on the pages.";

  function pickFiles(): void {
    inputRef.current?.click();
  }

  async function onInputChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const list = event.target.files;
    const input = event.currentTarget;
    if (!list?.length) return;

    setError(null);
    setInfo(null);

    const next: File[] = [];
    const maxBytes = appConfig.openAi.maxExamUploadBytesPerFile;

    if (list.length > MAX_FILES_SELECTED) {
      setError(t("questions.upload.error.tooMany"));
      input.value = "";
      return;
    }

    for (const file of Array.from(list)) {
      const mimeOk = IMAGE_MIME.test(file.type);
      if (!isPdfFile(file) && !mimeOk) {
        setError(t("questions.upload.error.generic"));
        input.value = "";
        return;
      }
      if (file.size > maxBytes) {
        setError(t("questions.upload.error.fileTooLarge"));
        input.value = "";
        return;
      }
      next.push(file);
    }

    setFiles(next);
    queueMicrotask(() => {
      input.value = "";
    });
  }

  function requestExtract(): void {
    setError(null);
    setInfo(null);
    if (files.length === 0) {
      setError(t("questions.upload.error.noImages"));
      return;
    }
    if (doc.questions.length > 0) {
      setReplaceOpen(true);
      return;
    }
    void runExtract();
  }

  async function runExtract(): Promise<void> {
    setReplaceOpen(false);
    const credentials = getOpenAiCompatibleCredentials();
    if (!credentials?.apiKey.trim()) {
      setError(t("grading.noApiKey"));
      return;
    }

    setBusy(true);
    setError(null);
    setInfo(null);

    try {
      const prepared = await filesToVisionDataUrls(files);
      if (!prepared.ok) {
        if (prepared.reason === "empty") {
          setError(t("questions.upload.error.noImages"));
        } else if (prepared.reason === "file_too_large") {
          setError(t("questions.upload.error.fileTooLarge"));
        } else if (prepared.reason === "too_many_slots") {
          setError(t("questions.upload.error.tooManySlots"));
        } else {
          setError(t("questions.upload.error.generic"));
        }
        return;
      }

      const outcome = await extractExamFromImagesWithOpenAi({
        apiKey: credentials.apiKey,
        baseUrl: credentials.baseUrl,
        model: credentials.examExtractionModel,
        imageUrls: prepared.urls,
        localeHint,
        examPrimaryLanguage: normalizeExamPrimaryLanguage(doc.exam.primaryLanguage),
      });

      if (!outcome.ok) {
        setError(outcome.message || t("questions.upload.error.generic"));
        return;
      }

      onDocumentChange(persistQuestions(doc, outcome.questions));
      setInfo(t("questions.upload.success"));
      setFiles([]);
    } catch (err) {
      console.error("[exam-upload]", err);
      const detail = err instanceof Error ? err.message : String(err);
      setError(
        detail
          ? `${t("questions.upload.error.generic")} (${detail})`
          : t("questions.upload.error.generic"),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Card
        aria-disabled={disabled || busy}
        className={cn(
          "relative overflow-hidden border-primary/15 bg-gradient-to-br from-primary/[0.06] via-card to-card shadow-sm",
          disabled ? "pointer-events-none opacity-60" : null,
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40"
          aria-hidden
        />
        <CardHeader className="gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImageUpIcon className="size-5 shrink-0 text-primary" aria-hidden />
            {t("questions.upload.sectionTitle")}
          </CardTitle>
          <CardDescription className="text-pretty">
            {t("questions.upload.sectionHint")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept={FILE_INPUT_ACCEPT}
            multiple
            className="sr-only"
            onChange={(e) => void onInputChange(e)}
          />

          {error ? (
            <Alert variant="destructive" role="alert">
              <AlertTitle className="sr-only">{t("session.validation.title")}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {info ? (
            <Alert>
              <AlertDescription>{info}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 gap-2 sm:min-h-10"
              disabled={busy || disabled}
              onClick={pickFiles}
            >
              {t("questions.upload.pickFiles")}
            </Button>
            {files.length > 0 ? (
              <span className="flex items-center text-sm text-muted-foreground">
                {files.length === 1
                  ? files[0]?.name ?? ""
                  : `${files.length} files`}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            {t("questions.upload.fileTypesHint")}
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-3 border-t border-primary/10 bg-muted/20 pt-6 sm:flex-row sm:justify-between">
          <Button
            type="button"
            className="min-h-11 w-full gap-2 sm:w-auto sm:min-h-10"
            disabled={busy || disabled || files.length === 0}
            aria-busy={busy}
            onClick={() => requestExtract()}
          >
            {busy ? (
              <Loader2Icon className="size-4 animate-spin" aria-hidden />
            ) : null}
            {busy ? t("questions.upload.extracting") : t("questions.upload.extract")}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={replaceOpen} onOpenChange={setReplaceOpen}>
        <DialogContent className="max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>{t("questions.upload.replaceTitle")}</DialogTitle>
            <DialogDescription>
              {t("questions.upload.replaceDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 sm:min-h-9"
              onClick={() => setReplaceOpen(false)}
            >
              {t("questions.upload.replaceCancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11 sm:min-h-9"
              onClick={() => void runExtract()}
            >
              {t("questions.upload.replaceConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
