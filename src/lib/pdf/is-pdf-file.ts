/** Detect PDF uploads across browsers (MIME is sometimes empty or non-standard). */
export function isPdfFile(file: File): boolean {
  const name = file.name.trim().toLowerCase();
  const mime = file.type.trim().toLowerCase();

  if (name.endsWith(".pdf")) return true;

  return (
    mime === "application/pdf" ||
    mime === "application/x-pdf" ||
    mime === "application/x-google-chrome-pdf"
  );
}
