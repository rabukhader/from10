/**
 * Browser-only: rasterize PDF pages to JPEG data URLs for vision APIs.
 *
 * Uses pdf.js assets from jsDelivr by default (same version as `appConfig.pdfJs.distVersion`)
 * so the worker/fonts load reliably even when `public/pdf.worker.mjs` is missing or served
 * with the wrong MIME type.
 *
 * Override worker URL with `NEXT_PUBLIC_PDFJS_WORKER_URL` (e.g. `/pdf.worker.mjs` for offline).
 */

import { appConfig } from "@/src/config";

import { isPdfFile } from "@/src/lib/pdf/is-pdf-file";

export type RenderPdfPagesOptions = {
  /** 1-based inclusive upper bound; slices total pages. */
  maxPages: number;
  /** Viewport scale for readability vs payload size. */
  scale?: number;
  /** JPEG quality 0–1. */
  jpegQuality?: number;
};

function pdfJsCdnBase(): string {
  const ver = appConfig.pdfJs.distVersion;
  return `https://cdn.jsdelivr.net/npm/pdfjs-dist@${ver}`;
}

function resolveWorkerSrc(): string {
  const fromEnv =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_PDFJS_WORKER_URL?.trim()
      : "";
  if (fromEnv) return fromEnv;
  return `${pdfJsCdnBase()}/build/pdf.worker.mjs`;
}

export async function renderPdfFileToJpegDataUrls(
  file: File,
  options: RenderPdfPagesOptions,
): Promise<string[]> {
  const { maxPages, scale = 1.75, jpegQuality = 0.88 } = options;

  if (typeof window === "undefined") {
    throw new Error("PDF rendering requires a browser.");
  }

  if (!isPdfFile(file)) {
    throw new Error("Not a PDF file.");
  }

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = resolveWorkerSrc();

  const cdn = pdfJsCdnBase();
  const data = new Uint8Array(await file.arrayBuffer());

  const pdf = await pdfjs
    .getDocument({
      data,
      standardFontDataUrl: `${cdn}/standard_fonts/`,
      cMapUrl: `${cdn}/cmaps/`,
      cMapPacked: true,
    })
    .promise;

  const pageCount = Math.min(pdf.numPages, Math.max(1, maxPages));

  const out: string[] = [];

  for (let i = 1; i <= pageCount; i += 1) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas is unavailable.");
    }
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise;

    out.push(canvas.toDataURL("image/jpeg", jpegQuality));
  }

  return out;
}
