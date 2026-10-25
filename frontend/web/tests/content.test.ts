import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { athenaDemoIds, CONTENT_LIMITS } from "@athena/shared";
import { MockContentClient } from "../src/features/content/api/mock-content-client";
import { ContentApiError } from "../src/features/content/api/types";
import { contentStrings, fill } from "../src/features/content/strings";
import {
  contentMimeFor,
  sha256Hex,
  titleFromFilename,
  uploadProblem,
} from "../src/features/content/upload";

/** Every leaf path of a nested string dictionary. */
function leaves(value: unknown, prefix = ""): [string, unknown][] {
  if (typeof value !== "object" || value === null) return [[prefix, value]];
  return Object.entries(value).flatMap(([key, child]) =>
    leaves(child, prefix ? `${prefix}.${key}` : key),
  );
}

test("Spanish and English strings have the same keys and none is empty", () => {
  const es = leaves(contentStrings("es"));
  const en = leaves(contentStrings("en"));
  assert.deepEqual(
    es.map(([key]) => key),
    en.map(([key]) => key),
  );
  for (const [key, text] of [...es, ...en]) assert.ok(typeof text === "string" && text.trim(), key);
  // Placeholders match between languages.
  const holes = (text: unknown) =>
    String(text)
      .match(/\{\w+\}/g)
      ?.sort() ?? [];
  es.forEach(([key, text], index) => assert.deepEqual(holes(text), holes(en[index]![1]), key));
  assert.equal(fill("{done} de {total}", { done: 3, total: 9 }), "3 de 9");
});

test("upload helpers hash like the server and catch bad files before upload", async () => {
  const text = "El área de un triángulo es base por altura entre dos.";
  assert.equal(await sha256Hex(new Blob([text])), createHash("sha256").update(text).digest("hex"));
  assert.equal(contentMimeFor({ name: "notas.md", type: "" }), "text/markdown");
  assert.equal(contentMimeFor({ name: "x.PDF", type: "" }), "application/pdf");
  assert.equal(contentMimeFor({ name: "a.docx", type: "application/msword" }), null);
  assert.equal(uploadProblem({ name: "a.docx", type: "", size: 10 }), "type");
  assert.equal(uploadProblem({ name: "a.txt", type: "text/plain", size: 0 }), "empty");
  assert.equal(
    uploadProblem({ name: "a.pdf", type: "", size: CONTENT_LIMITS.maxFileBytes + 1 }),
    "size",
  );
  assert.equal(uploadProblem({ name: "a.pdf", type: "", size: 100 }), null);
  assert.equal(titleFromFilename("notas_de-geometria.pdf"), "notas de geometria");
});

test("the mock client walks a material from upload to ready in bounded steps", async () => {
  const client = new MockContentClient();
  const classId = athenaDemoIds.class;
  const created = await client.createMaterial(classId, {
    filename: "guia.md",
    mimeType: "text/markdown",
    byteSize: 20_000,
    sha256: "a".repeat(64),
    title: "Guía",
    topicIds: [athenaDemoIds.topics.functions],
    locale: "es",
  });
  assert.equal(created.duplicate, false);
  let material = await client.processMaterial(created.material.id);
  assert.equal(material.status, "embedding");
  for (let i = 0; i < 10 && material.status !== "ready"; i += 1) {
    material = await client.processMaterial(material.id);
  }
  assert.equal(material.status, "ready");
  assert.equal(material.searchable, true);
  const again = await client.createMaterial(classId, {
    filename: "guia.md",
    mimeType: "text/markdown",
    byteSize: 20_000,
    sha256: "a".repeat(64),
    title: "Guía",
    topicIds: [athenaDemoIds.topics.statistics],
    locale: "es",
  });
  assert.equal(again.duplicate, true);
  assert.equal(again.material.topicIds.length, 2);
});

test("the mock client mirrors conflicts and abstains on uncovered questions", async () => {
  const client = new MockContentClient();
  const classId = athenaDemoIds.class;
  const [objective] = await client.listObjectives();
  await assert.rejects(
    client.upsertObjective(classId, objective!.id, {
      topicId: objective!.topicId,
      code: objective!.code,
      statement: objective!.statement,
      position: 0,
      expectedUpdatedAt: "2000-01-01T00:00:00.000Z",
    }),
    (error: unknown) => error instanceof ContentApiError && error.status === 409,
  );
  const abstained = await client.chat(classId, { message: "¿Quién ganó el mundial?", history: [] });
  assert.equal(abstained.outcome, "abstained");
  const answered = await client.chat(classId, { message: "Explícame la geometría", history: [] });
  assert.equal(answered.outcome, "answered");
  assert.equal(answered.citations.length, 1);
  const flags = await client.listFlags();
  assert.equal(flags.find((flag) => flag.category === "self_harm")?.excerpt, undefined);
});
