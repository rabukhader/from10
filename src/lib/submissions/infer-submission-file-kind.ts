import type { SubmissionFileKind } from "@/src/domain";

export function inferSubmissionFileKind(
  mimeType: string,
  originalName: string,
): SubmissionFileKind {
  const mime = mimeType.trim().toLowerCase();
  const lowerName = originalName.trim().toLowerCase();

  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("text/")) return "text";

  if (
    lowerName.endsWith(".pdf") &&
    (!mime || mime === "application/octet-stream")
  ) {
    return "pdf";
  }

  if (
    /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(lowerName) &&
    (!mime || mime === "application/octet-stream")
  ) {
    return "image";
  }

  if (/\.(txt|md|csv)$/i.test(lowerName) && !mime.startsWith("image/")) {
    return "text";
  }

  return "attachment";
}
