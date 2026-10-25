import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import {
  aiUsageRecordedPayloadSchema,
  athenaDemoIds,
  CONTENT_LIMITS,
  contentAiUsagePayloadSchema,
  contentChatRequestSchema,
  contentChatResponseSchema,
  contentDisplayStatus,
  contentFlagSchema,
  contentGuardrailPolicy,
  contentMaterialSchema,
  contentStudentMaterialSchema,
  createContentMaterialRequestSchema,
  createContentMaterialResponseSchema,
  materialStatusSchema,
  updateContentMaterialRequestSchema,
} from "../src/index.js";

const sha = "a".repeat(64);
const material = {
  id: "00000000-0000-4000-8000-00000000d001",
  classId: athenaDemoIds.class,
  courseId: athenaDemoIds.course,
  title: "Notas de geometría",
  filename: "geometria.pdf",
  mimeType: "application/pdf",
  byteSize: 1024,
  sha256: sha,
  locale: "es",
  topicIds: [athenaDemoIds.topics.geometry],
  status: "ready",
  progress: { embedded: 12, total: 12 },
  searchable: true,
  attempts: 1,
  curriculumVersion: 1,
  uploadedBy: athenaDemoIds.professorRuiz,
  createdAt: "2026-10-24T00:00:00.000Z",
  updatedAt: "2026-10-24T00:00:00.000Z",
  processedAt: "2026-10-24T00:01:00.000Z",
} as const;

test("six pipeline statuses collapse to the four the UI shows", () => {
  const shown = materialStatusSchema.options.map(contentDisplayStatus);
  assert.deepEqual(shown, [
    "uploaded",
    "processing",
    "processing",
    "processing",
    "ready",
    "failed",
  ]);
});

test("create request rejects oversized files, unknown types and bad hashes", () => {
  const ok = {
    filename: "a.pdf",
    mimeType: "application/pdf",
    byteSize: 10,
    sha256: sha,
    title: "A",
    locale: "en",
  };
  assert.deepEqual(createContentMaterialRequestSchema.parse(ok).topicIds, []);
  const bad = [
    { byteSize: CONTENT_LIMITS.maxFileBytes + 1 },
    { mimeType: "text/html" },
    { sha256: "A".repeat(64) },
    { title: "  " },
  ];
  for (const change of bad)
    assert.equal(createContentMaterialRequestSchema.safeParse({ ...ok, ...change }).success, false);
});

test("a duplicate upload carries no upload URL; a new one must", () => {
  assert.equal(
    createContentMaterialResponseSchema.safeParse({ duplicate: true, material }).success,
    true,
  );
  assert.equal(
    createContentMaterialResponseSchema.safeParse({ duplicate: false, material }).success,
    false,
  );
});

test("the student view drops storage, hash, errors and uploader", () => {
  assert.deepEqual(contentMaterialSchema.parse(material), material);
  const student = contentStudentMaterialSchema.parse(material);
  for (const hidden of ["sha256", "uploadedBy", "errorMessage", "byteSize", "filename"])
    assert.equal(hidden in student, false, hidden);
});

test("an update must change something", () => {
  assert.equal(updateContentMaterialRequestSchema.safeParse({}).success, false);
  assert.equal(updateContentMaterialRequestSchema.safeParse({ title: "B" }).success, true);
});

test("chat history accepts only student turns, at most six", () => {
  const turn = { role: "student", content: "¿Qué es el área?" };
  assert.equal(contentChatRequestSchema.safeParse({ message: "Hola" }).success, true);
  assert.equal(
    contentChatRequestSchema.safeParse({ message: "Hola", history: [{ ...turn, role: "tutor" }] })
      .success,
    false,
  );
  assert.equal(
    contentChatRequestSchema.safeParse({ message: "Hola", history: Array(7).fill(turn) }).success,
    false,
  );
  assert.equal(
    contentChatRequestSchema.safeParse({ message: "x".repeat(CONTENT_LIMITS.maxMessageLength + 1) })
      .success,
    false,
  );
});

test("an answered chat response must cite, with short excerpts", () => {
  const citation = {
    materialId: material.id,
    materialTitle: material.title,
    page: 3,
    chunkId: "00000000-0000-4000-8000-00000000d101",
    excerpt: "El área de un triángulo es base por altura entre dos.",
  };
  const base = { outcome: "answered", answer: "Es base por altura entre dos [1].", locale: "es" };
  assert.equal(contentChatResponseSchema.safeParse({ ...base, citations: [] }).success, false);
  assert.equal(
    contentChatResponseSchema.safeParse({ ...base, citations: [citation] }).success,
    true,
  );
  assert.equal(
    contentChatResponseSchema.safeParse({
      ...base,
      citations: [{ ...citation, excerpt: "x".repeat(CONTENT_LIMITS.maxCitationExcerpt + 1) }],
    }).success,
    false,
  );
  assert.equal(
    contentChatResponseSchema.safeParse({ ...base, outcome: "abstained", citations: [] }).success,
    true,
  );
});

test("self-harm flags never keep an excerpt, and policy agrees", () => {
  const flag = {
    id: "00000000-0000-4000-8000-00000000f001",
    classId: athenaDemoIds.class,
    studentId: athenaDemoIds.students.lucia,
    studentName: "Lucía",
    category: "self_harm",
    action: "refused",
    locale: "es",
    createdAt: "2026-10-24T00:00:00.000Z",
  };
  assert.equal(contentFlagSchema.safeParse(flag).success, true);
  assert.equal(contentFlagSchema.safeParse({ ...flag, excerpt: "..." }).success, false);
  assert.equal(contentGuardrailPolicy.self_harm.keepExcerpt, false);
  assert.equal(contentGuardrailPolicy.off_topic.report, false);
});

test("content usage payloads still parse as analytics' AiUsageRecorded payload", () => {
  const payload = contentAiUsagePayloadSchema.parse({
    kind: "chat",
    outcome: "redirected",
    flagCategory: "graded_work",
  });
  assert.deepEqual(aiUsageRecordedPayloadSchema.parse(payload), { kind: "chat" });
});

test("content migrations enable RLS on every table and pin search_path on every function", () => {
  const dir = new URL("../../data/supabase/migrations/", import.meta.url);
  const files = readdirSync(dir).filter((name) => /^05\d\d_.*\.sql$/.test(name));
  assert.ok(files.length >= 4);
  const sql = files.map((name) => readFileSync(new URL(name, dir), "utf8")).join("\n");
  const tables = [...sql.matchAll(/create table if not exists (public\.\w+)/g)].map((m) => m[1]);
  assert.ok(tables.length > 0);
  for (const table of tables)
    assert.match(
      sql,
      new RegExp(`alter table ${table.replace(".", "\\.")} enable row level security`),
    );
  const functions = [...sql.matchAll(/create or replace function (public\.\w+)\(/g)].map(
    (m) => m[1],
  );
  const headers = [...sql.matchAll(/create or replace function[\s\S]*?\nas \$\$/g)].map(
    (m) => m[0],
  );
  assert.equal(headers.length, functions.length);
  for (const header of headers) assert.match(header, /set search_path = ''/);
  for (const fn of functions) {
    assert.match(sql, new RegExp(`revoke all on function ${fn.replace(".", "\\.")}\\(`));
    assert.match(
      sql,
      new RegExp(`grant execute on function ${fn.replace(".", "\\.")}\\([^;]*to service_role`),
    );
  }
});
