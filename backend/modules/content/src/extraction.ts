import { createHash } from "node:crypto";
import { extractText } from "unpdf";
import { CONTENT_LIMITS, type ContentMimeType } from "@athena/shared";
import {
  IngestionError,
  type ChunkDraft,
  type ChunkingStrategy,
  type DocumentExtractor,
  type EmbeddingProvider,
  type ExtractedPage,
} from "./ports.js";

export const sha256Hex = (bytes: Uint8Array | string) =>
  createHash("sha256").update(bytes).digest("hex");

/** Checks the stored bytes really are the declared type; client mime types are untrusted. */
export function sniffMatches(bytes: Uint8Array, mimeType: ContentMimeType): boolean {
  if (mimeType === "application/pdf") {
    return new TextDecoder("latin1").decode(bytes.subarray(0, 5)) === "%PDF-";
  }
  if (bytes.includes(0)) return false;
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return true;
  } catch {
    return false;
  }
}

/** Plain text and markdown as one page; PDFs page by page through unpdf (serverless pdf.js). */
export class DefaultDocumentExtractor implements DocumentExtractor {
  async extract(bytes: Uint8Array, mimeType: string): Promise<ExtractedPage[]> {
    if (mimeType === "text/plain" || mimeType === "text/markdown") {
      return [{ text: new TextDecoder("utf-8").decode(bytes) }];
    }
    if (mimeType !== "application/pdf") {
      throw new IngestionError("unsupported_type", `Unsupported type: ${mimeType}`);
    }
    try {
      const { text } = await extractText(new Uint8Array(bytes), { mergePages: false });
      return text.map((pageText, index) => ({ page: index + 1, text: pageText }));
    } catch (error) {
      throw new IngestionError(
        "unsupported_type",
        `Could not read PDF: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }
}

export interface ChunkerOptions {
  targetChars?: number;
  overlapChars?: number;
}

interface Unit {
  text: string;
  page?: number;
  section?: string;
}

const HEADING = /^(#{1,6})\s+(.+)$|^(\d+(?:\.\d+)*\.?)\s+(\S.{0,90})$/;

/**
 * Paragraph- and heading-aware splitter: ~800 tokens (3 200 chars) per chunk with 15% overlap,
 * keeping the page range and nearest heading of each chunk for citations.
 */
export class ParagraphChunker implements ChunkingStrategy {
  private readonly targetChars: number;
  private readonly overlapChars: number;

  constructor(options: ChunkerOptions = {}) {
    this.targetChars = options.targetChars ?? 3_200;
    this.overlapChars = options.overlapChars ?? Math.round(this.targetChars * 0.15);
  }

  chunk(pages: ExtractedPage[]): ChunkDraft[] {
    const drafts: ChunkDraft[] = [];
    let current: Unit[] = [];
    let size = 0;
    // False while current holds only the overlap carried from the previous chunk.
    let fresh = false;
    const flush = () => {
      drafts.push(this.draft(drafts.length, current));
      const carried: Unit[] = [];
      let carriedSize = 0;
      for (let i = current.length - 1; i > 0; i -= 1) {
        const unit = current[i]!;
        if (carriedSize + unit.text.length > this.overlapChars) break;
        carried.unshift(unit);
        carriedSize += unit.text.length + 2;
      }
      current = carried;
      size = carriedSize;
      fresh = false;
    };
    for (const unit of this.units(pages)) {
      if (fresh && size + unit.text.length > this.targetChars) flush();
      current.push(unit);
      size += unit.text.length + 2;
      fresh = true;
    }
    if (fresh) drafts.push(this.draft(drafts.length, current));
    return drafts;
  }

  private units(pages: ExtractedPage[]): Unit[] {
    const units: Unit[] = [];
    let section: string | undefined;
    for (const { page, text } of pages) {
      const paragraphs = text
        .replace(/\r\n?/g, "\n")
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.replace(/[ \t]+/g, " ").trim())
        .filter(Boolean);
      for (const paragraph of paragraphs) {
        const firstLine = paragraph.split("\n")[0]!;
        const heading = HEADING.exec(firstLine);
        if (heading) section = (heading[2] ?? heading[4] ?? firstLine).trim().slice(0, 300);
        for (const piece of this.split(paragraph.replace(/\n/g, " ")))
          units.push({ text: piece, page, section });
      }
    }
    return units;
  }

  /** Splits an over-long paragraph by sentences, then hard-wraps anything still too long. */
  private split(paragraph: string): string[] {
    if (paragraph.length <= this.targetChars) return [paragraph];
    const pieces: string[] = [];
    let buffer = "";
    for (const sentence of paragraph.split(/(?<=[.!?¿¡])\s+/)) {
      if (buffer && buffer.length + sentence.length + 1 > this.targetChars) {
        pieces.push(buffer);
        buffer = "";
      }
      buffer = buffer ? `${buffer} ${sentence}` : sentence;
      while (buffer.length > this.targetChars) {
        pieces.push(buffer.slice(0, this.targetChars));
        buffer = buffer.slice(this.targetChars);
      }
    }
    if (buffer) pieces.push(buffer);
    return pieces;
  }

  private draft(chunkIndex: number, units: Unit[]): ChunkDraft {
    const content = units.map((unit) => unit.text).join("\n\n");
    const pageNumbers = units.map((unit) => unit.page).filter((page) => page !== undefined);
    return {
      chunkIndex,
      pageStart: pageNumbers.length ? Math.min(...pageNumbers) : undefined,
      pageEnd: pageNumbers.length ? Math.max(...pageNumbers) : undefined,
      sectionTitle: units.find((unit) => unit.section)?.section,
      content,
      contentHash: sha256Hex(content),
      tokenEstimate: Math.max(1, Math.ceil(content.length / 4)),
    };
  }
}

export const MOCK_EMBEDDING_MODEL = "mock-hash-768";

/**
 * Deterministic bag-of-words embedding: accent-folded word hashes into 768 signed buckets,
 * L2-normalized. Texts sharing words get high cosine similarity, so retrieval tests are
 * meaningful without an API key.
 */
export class MockEmbeddingProvider implements EmbeddingProvider {
  readonly model = MOCK_EMBEDDING_MODEL;
  readonly dimensions = 768;

  async embedDocuments(items: { title: string; text: string }[]) {
    return items.map((item) => mockTextEmbedding(item.text));
  }

  async embedQuery(text: string) {
    return mockTextEmbedding(text);
  }
}

export function mockTextEmbedding(text: string): number[] {
  const vector = new Array<number>(768).fill(0);
  const words = text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .match(/[\p{L}\p{N}]{3,}/gu);
  for (const word of words ?? []) {
    const hash = fnv1a(word);
    vector[hash % vector.length]! += hash & 0x80000000 ? -1 : 1;
  }
  const norm = Math.hypot(...vector) || 1;
  return vector.map((value) => value / norm);
}

function fnv1a(text: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

export const MAX_CHUNKS = CONTENT_LIMITS.maxChunksPerMaterial;
