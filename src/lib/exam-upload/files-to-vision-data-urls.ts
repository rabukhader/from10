import { appConfig } from "@/src/config";
import { renderPdfFileToJpegDataUrls } from "@/src/lib/pdf/render-pdf-pages-to-data-urls";
import { isPdfFile } from "@/src/lib/pdf/is-pdf-file";

const IMAGE_MIME = /^image\/(jpeg|png|webp|gif)$/i;

export type VisionFilesOutcome =
  | { ok: true; urls: string[] }
  | {
      ok: false;
      reason:
        | "empty"
        | "unsupported"
        | "file_too_large"
        | "too_many_slots";
    };

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

/** Turns mixed images + PDFs into JPEG data URLs for OpenAI vision (PDF pages rasterized in-browser). */
export async function filesToVisionDataUrls(
  files: readonly File[],
): Promise<VisionFilesOutcome> {
  if (files.length === 0) {
    return { ok: false, reason: "empty" };
  }

  const maxSlots = appConfig.openAi.maxExamVisionSlots;
  const maxBytes = appConfig.openAi.maxExamUploadBytesPerFile;
  const maxPdfPages = appConfig.openAi.maxPdfPagesPerFile;

  for (const file of files) {
    if (file.size > maxBytes) {
      return { ok: false, reason: "file_too_large" };
    }
    if (!isPdfFile(file) && !IMAGE_MIME.test(file.type)) {
      return { ok: false, reason: "unsupported" };
    }
  }

  const urls: string[] = [];

  for (const file of files) {
    if (isPdfFile(file)) {
      const pageUrls = await renderPdfFileToJpegDataUrls(file, {
        maxPages: maxPdfPages,
      });
      if (urls.length + pageUrls.length > maxSlots) {
        return { ok: false, reason: "too_many_slots" };
      }
      urls.push(...pageUrls);
    } else {
      if (urls.length + 1 > maxSlots) {
        return { ok: false, reason: "too_many_slots" };
      }
      urls.push(await readFileAsDataUrl(file));
    }
  }

  if (urls.length === 0) {
    return { ok: false, reason: "empty" };
  }

  return { ok: true, urls };
}
