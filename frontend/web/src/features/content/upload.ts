import { CONTENT_LIMITS, type ContentMimeType } from "@athena/shared";

/** Lowercase hex sha256 of a file, computed in the browser before upload. */
export async function sha256Hex(file: Blob): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** The declared type, from the browser's guess or the extension (markdown often has none). */
export function contentMimeFor(file: { name: string; type: string }): ContentMimeType | null {
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) return "application/pdf";
  if (file.type === "text/markdown" || /\.(md|markdown)$/i.test(file.name)) return "text/markdown";
  if (file.type === "text/plain" || /\.txt$/i.test(file.name)) return "text/plain";
  return null;
}

export type UploadProblem = "type" | "size" | "empty";

/** Checks done before hashing, so the professor hears about a bad file at once. */
export function uploadProblem(file: { name: string; type: string; size: number }) {
  if (!contentMimeFor(file)) return "type" satisfies UploadProblem;
  if (file.size === 0) return "empty" satisfies UploadProblem;
  if (file.size > CONTENT_LIMITS.maxFileBytes) return "size" satisfies UploadProblem;
  return null;
}

/** Title suggestion: the filename without extension, separators turned into spaces. */
export const titleFromFilename = (name: string) =>
  name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .trim()
    .slice(0, CONTENT_LIMITS.maxTitleLength) || name;
