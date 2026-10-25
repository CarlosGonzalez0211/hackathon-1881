import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import test from "node:test";
import Fastify from "fastify";
import { athenaDemoIds, type CreateContentMaterialRequest } from "@athena/shared";
import {
  createPlatformServices,
  DirectoryAuthService,
  InMemoryClassCatalog,
  InMemoryIdentityDirectory,
  installPlatform,
  RoleAuthorizationService,
  StaticTokenVerifier,
  type PlatformServices,
} from "@athena/platform";
import {
  contentRoutes,
  InMemoryChunkRepository,
  InMemoryMaterialRepository,
  InMemoryMaterialStorage,
  MaterialIngestionService,
  MockEmbeddingProvider,
  ParagraphChunker,
  DefaultDocumentExtractor,
  type ContentRoutesOptions,
  type CurriculumCatalogPort,
  type EmbeddingProvider,
} from "@athena/content";
import { createApp } from "../src/app.js";

const { students, topics } = athenaDemoIds;
const CLASS = athenaDemoIds.class;
const OTHER_CLASS = "00000000-0000-4000-8000-0000000000c2";
const OTHER_COURSE = "00000000-0000-4000-8000-000000000a02";
const PROF = "00000000-0000-4000-8000-0000000000f1";
const PROF_2 = "00000000-0000-4000-8000-0000000000f2";
const ADMIN = "00000000-0000-4000-8000-0000000000f3";
const OTHER_TOPIC = "00000000-0000-4000-8000-000000000b99";

const profile = (id: string, authUserId: string, role: "student" | "professor" | "admin") => ({
  id,
  authUserId,
  role,
  displayName: `User ${id.slice(-3)}`,
});
const directory = new InMemoryIdentityDirectory(
  [
    profile(PROF, "auth-prof", "professor"),
    profile(PROF_2, "auth-prof-2", "professor"),
    profile(ADMIN, "auth-admin", "admin"),
    profile(students.lucia, "auth-lucia", "student"),
    profile(students.diego, "auth-diego", "student"),
  ],
  [
    { id: CLASS, courseId: athenaDemoIds.course, professorId: PROF, studentIds: [students.lucia] },
    { id: OTHER_CLASS, courseId: OTHER_COURSE, professorId: PROF_2, studentIds: [students.diego] },
  ],
);
const verifier = new StaticTokenVerifier({
  "tok-prof": "auth-prof",
  "tok-prof-2": "auth-prof-2",
  "tok-admin": "auth-admin",
  "tok-lucia": "auth-lucia",
  "tok-diego": "auth-diego",
});
const classCatalog = new InMemoryClassCatalog([
  {
    id: CLASS,
    courseId: athenaDemoIds.course,
    professorId: PROF,
    title: "A",
    createdAt: "2026-10-24T00:00:00.000Z",
  },
  {
    id: OTHER_CLASS,
    courseId: OTHER_COURSE,
    professorId: PROF_2,
    title: "B",
    createdAt: "2026-10-24T00:00:00.000Z",
  },
]);
const catalog: CurriculumCatalogPort = {
  async listTopics(courseId) {
    return courseId === athenaDemoIds.course
      ? [
          { id: topics.geometry, title: "Geometría" },
          { id: topics.fractions, title: "Fracciones" },
        ]
      : [{ id: OTHER_TOPIC, title: "Other" }];
  },
  async activeVersion() {
    return 1;
  },
};

/** The content plugin on a minimal app, so tests can inject providers and budgets. */
async function makeApp(
  options: ContentRoutesOptions = {},
  platform: Partial<PlatformServices> = {},
) {
  const services = createPlatformServices({
    auth: new DirectoryAuthService(verifier, directory),
    authorization: new RoleAuthorizationService(),
    classes: classCatalog,
    ...platform,
  });
  const app = Fastify({ logger: false });
  installPlatform(app, services);
  app.setErrorHandler((err: Error & { statusCode?: number }, _req, reply) => {
    const status = err.name === "ZodError" ? 400 : (err.statusCode ?? 500);
    reply.status(status).send({ error: status >= 500 ? "Internal server error" : err.message });
  });
  await app.register((api) => contentRoutes(api, { catalog, ...options }), { prefix: "/api" });
  return { app, services };
}

const bearer = (token?: string) => (token ? { authorization: `Bearer ${token}` } : {});
const sha = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");

const NOTES = [
  "# Área de triángulos",
  "El área de un triángulo es la base por la altura dividida entre dos.",
  "# Rectángulos",
  "El área de un rectángulo es la base por la altura.",
].join("\n\n");

function createBody(text: string, overrides: Partial<CreateContentMaterialRequest> = {}) {
  const bytes = Buffer.from(text, "utf8");
  return {
    filename: "notas.md",
    mimeType: "text/markdown" as const,
    byteSize: bytes.length,
    sha256: sha(bytes),
    title: "Notas de geometría",
    topicIds: [topics.geometry],
    locale: "es" as const,
    ...overrides,
  };
}

type App = Awaited<ReturnType<typeof makeApp>>["app"];

async function upload(app: App, bytes: Buffer, body: object, token = "tok-prof") {
  const created = await app.inject({
    method: "POST",
    url: `/api/content/classes/${CLASS}/materials`,
    headers: bearer(token),
    payload: body,
  });
  const json = created.json();
  if (json.uploadUrl) {
    const put = await app.inject({
      method: "PUT",
      url: new URL(json.uploadUrl).pathname,
      headers: { ...bearer("tok-prof"), "content-type": "application/octet-stream" },
      payload: bytes,
    });
    assert.equal(put.statusCode, 204);
  }
  return { created, json };
}

async function uploadAndProcess(app: App, text: string, overrides = {}) {
  const bytes = Buffer.from(text, "utf8");
  const { json } = await upload(app, bytes, createBody(text, overrides));
  const id = json.material.id as string;
  const complete = await app.inject({
    method: "POST",
    url: `/api/content/materials/${id}/complete`,
    headers: bearer("tok-prof"),
  });
  assert.equal(complete.statusCode, 200, complete.body);
  const processed = await app.inject({
    method: "POST",
    url: `/api/content/materials/${id}/process`,
    headers: bearer("tok-prof"),
  });
  return { id, processed: processed.json() };
}

test("content is registered in the app; mock mode lists the demo class material", async () => {
  const app = await createApp({ logger: false, dataMode: "mock" });
  try {
    const res = await app.inject({ method: "GET", url: `/api/content/classes/${CLASS}/materials` });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.json(), []);
  } finally {
    await app.close();
  }
});

test("upload, verify and process a markdown file end to end", async () => {
  const { app, services } = await makeApp();
  try {
    const { id, processed } = await uploadAndProcess(app, NOTES);
    assert.equal(processed.status, "ready");
    assert.equal(processed.searchable, true);
    assert.equal(processed.progress.embedded, processed.progress.total);
    assert.ok(processed.progress.total >= 1);
    assert.equal("storagePath" in processed, false);
    const types = (await services.events.list()).map((event) => event.type);
    assert.deepEqual(types, ["MaterialUploaded", "MaterialProcessed"]);
    const processedEvent = (await services.events.list({ type: "MaterialProcessed" }))[0]!;
    assert.equal(processedEvent.classId, CLASS);
    assert.deepEqual(processedEvent.payload, {
      materialId: id,
      topicIds: [topics.geometry],
      status: "ready",
    });

    const student = await app.inject({
      method: "GET",
      url: `/api/content/materials/${id}`,
      headers: bearer("tok-lucia"),
    });
    assert.equal(student.statusCode, 200);
    assert.deepEqual(Object.keys(student.json()).sort(), [
      "classId",
      "id",
      "locale",
      "mimeType",
      "processedAt",
      "title",
      "topicIds",
    ]);
  } finally {
    await app.close();
  }
});

test("authorization matrix: professor/admin manage, members read, outsiders refused", async () => {
  const materials = new InMemoryMaterialRepository();
  const { app } = await makeApp({ materials });
  const status = async (
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT",
    url: string,
    token?: string,
    payload?: object,
  ) => (await app.inject({ method, url, headers: bearer(token), payload })).statusCode;
  try {
    const classUrl = `/api/content/classes/${CLASS}/materials`;
    assert.equal(await status("POST", classUrl, undefined, createBody("a")), 401);
    assert.equal(await status("POST", classUrl, "tok-lucia", createBody("a")), 403);
    assert.equal(await status("POST", classUrl, "tok-prof-2", createBody("a")), 403);
    assert.equal(await status("POST", classUrl, "tok-diego", createBody("a")), 403);
    assert.equal(await status("POST", classUrl, "tok-admin", createBody("admin file")), 201);

    const { id } = await uploadAndProcess(app, NOTES);
    const pending = (await upload(app, Buffer.from("pending"), createBody("pending"))).json.material
      .id;

    assert.equal(await status("GET", classUrl, "tok-prof"), 200);
    assert.equal(await status("GET", classUrl, "tok-lucia"), 200);
    assert.equal(await status("GET", classUrl, "tok-prof-2"), 403);
    assert.equal(await status("GET", classUrl, "tok-diego"), 403);
    const studentList = await app.inject({
      method: "GET",
      url: classUrl,
      headers: bearer("tok-lucia"),
    });
    assert.deepEqual(
      studentList.json().map((m: { id: string }) => m.id),
      [id],
    );

    // Outsiders get 404 for material ids, same as an unknown id; members get 403 on writes.
    for (const [method, suffix] of [
      ["GET", ""],
      ["PATCH", ""],
      ["DELETE", ""],
      ["POST", "/complete"],
      ["POST", "/process"],
      ["GET", "/download"],
    ] as const) {
      const url = `/api/content/materials/${id}${suffix}`;
      const payload = method === "PATCH" ? { title: "x" } : undefined;
      assert.equal(await status(method, url, "tok-prof-2", payload), 404, `${method} ${url}`);
      assert.equal(await status(method, url, "tok-diego", payload), 404, `${method} ${url}`);
      if (method !== "GET" || suffix) {
        assert.equal(await status(method, url, "tok-lucia", payload), 403, `${method} ${url}`);
      }
    }
    assert.equal(await status("GET", `/api/content/materials/${randomUUID()}`, "tok-prof"), 404);
    // A student cannot see material that is not searchable yet.
    assert.equal(await status("GET", `/api/content/materials/${pending}`, "tok-lucia"), 404);
    assert.equal(await status("GET", `/api/content/materials/${id}/download`, "tok-admin"), 200);
    assert.equal(
      await status("PATCH", `/api/content/materials/${id}`, "tok-admin", { title: "y" }),
      200,
    );
    assert.equal(await status("DELETE", `/api/content/materials/${id}`, "tok-prof"), 204);
    assert.equal(await status("GET", `/api/content/materials/${id}`, "tok-prof"), 404);

    const objectiveUrl = `/api/content/classes/${CLASS}/objectives`;
    const objective = {
      topicId: topics.geometry,
      code: "OBJ-1",
      statement: { es: "Calcular áreas", en: "Compute areas" },
      position: 0,
    };
    assert.equal(
      await status("PUT", `${objectiveUrl}/${randomUUID()}`, "tok-lucia", objective),
      403,
    );
    assert.equal(
      await status("PUT", `${objectiveUrl}/${randomUUID()}`, "tok-prof-2", objective),
      403,
    );
    assert.equal(
      await status("PUT", `${objectiveUrl}/${randomUUID()}`, "tok-admin", objective),
      200,
    );
    assert.equal(await status("GET", objectiveUrl, "tok-lucia"), 200);
    assert.equal(await status("GET", objectiveUrl, "tok-diego"), 403);
    assert.equal(await status("GET", `/api/content/classes/${CLASS}/milestones`, "tok-diego"), 403);
  } finally {
    await app.close();
  }
});

test("re-uploading the same file returns the existing material and adds no chunks", async () => {
  const materials = new InMemoryMaterialRepository();
  const chunks = new InMemoryChunkRepository(materials);
  const { app } = await makeApp({ materials, chunks });
  try {
    const { id } = await uploadAndProcess(app, NOTES);
    const before = chunks.rows.size;
    const again = await app.inject({
      method: "POST",
      url: `/api/content/classes/${CLASS}/materials`,
      headers: bearer("tok-prof"),
      payload: createBody(NOTES, { topicIds: [topics.fractions], title: "Otra" }),
    });
    assert.equal(again.statusCode, 200);
    const json = again.json();
    assert.equal(json.duplicate, true);
    assert.equal(json.material.id, id);
    assert.equal(json.uploadUrl, undefined);
    assert.deepEqual(json.material.topicIds.sort(), [topics.fractions, topics.geometry].sort());
    assert.equal(chunks.rows.size, before);
    assert.equal(materials.rows.size, 1);
  } finally {
    await app.close();
  }
});

test("concurrent creates of one file make one row; an unfinished upload gets a fresh URL", async () => {
  const materials = new InMemoryMaterialRepository();
  const { app } = await makeApp({ materials });
  try {
    const send = () =>
      app.inject({
        method: "POST",
        url: `/api/content/classes/${CLASS}/materials`,
        headers: bearer("tok-prof"),
        payload: createBody("same"),
      });
    const [first, second] = await Promise.all([send(), send()]);
    assert.equal(materials.rows.size, 1);
    assert.equal(first.json().material.id, second.json().material.id);
    // Neither upload completed, so both callers may still upload.
    assert.ok(first.json().uploadUrl && second.json().uploadUrl);
    assert.equal(second.json().duplicate, false);
  } finally {
    await app.close();
  }
});

test("complete rejects a mismatched file and fails one whose bytes are not the declared type", async () => {
  const { app } = await makeApp();
  try {
    const { json } = await upload(app, Buffer.from("different bytes"), createBody("declared"));
    const mismatch = await app.inject({
      method: "POST",
      url: `/api/content/materials/${json.material.id}/complete`,
      headers: bearer("tok-prof"),
    });
    assert.equal(mismatch.statusCode, 400);

    const html = "<html>not a pdf</html>";
    const fake = await upload(
      app,
      Buffer.from(html),
      createBody(html, { mimeType: "application/pdf", filename: "x.pdf" }),
    );
    const sniffed = await app.inject({
      method: "POST",
      url: `/api/content/materials/${fake.json.material.id}/complete`,
      headers: bearer("tok-prof"),
    });
    assert.equal(sniffed.json().status, "failed");
    assert.equal(sniffed.json().errorCode, "unsupported_type");
  } finally {
    await app.close();
  }
});

test("files without text fail visibly; a failing provider fails and a retry recovers", async () => {
  let failNext = true;
  const mock = new MockEmbeddingProvider();
  const flaky: EmbeddingProvider = {
    model: mock.model,
    dimensions: mock.dimensions,
    embedQuery: (text) => mock.embedQuery(text),
    async embedDocuments(items) {
      if (failNext) {
        failNext = false;
        throw new Error("quota exceeded");
      }
      return mock.embedDocuments(items);
    },
  };
  const { app, services } = await makeApp({ embeddings: flaky });
  try {
    const blank = await uploadAndProcess(app, "   \n\n   ");
    assert.equal(blank.processed.status, "failed");
    assert.equal(blank.processed.errorCode, "no_extractable_text");

    const { id, processed } = await uploadAndProcess(app, NOTES);
    assert.equal(processed.status, "failed");
    assert.equal(processed.errorCode, "embedding_failed");
    assert.match(processed.errorMessage, /quota exceeded/);
    const retried = await app.inject({
      method: "POST",
      url: `/api/content/materials/${id}/process`,
      headers: bearer("tok-prof"),
    });
    assert.equal(retried.json().status, "ready");
    assert.equal(retried.json().attempts, 2);
    const statuses = (await services.events.list({ type: "MaterialProcessed" })).map(
      (event) => event.payload.status,
    );
    assert.deepEqual(statuses, ["failed", "failed", "ready"]);
  } finally {
    await app.close();
  }
});

test("bounded steps: repeated process calls finish, and a rebuild keeps serving the old chunks", async () => {
  const materials = new InMemoryMaterialRepository();
  const chunks = new InMemoryChunkRepository(materials);
  const ingestion = { batchSize: 1, budgetMs: 0 };
  const { app } = await makeApp({
    materials,
    chunks,
    chunker: new ParagraphChunker({ targetChars: 80 }),
    ingestion,
  });
  try {
    const { id, processed } = await uploadAndProcess(app, NOTES);
    assert.equal(processed.status, "embedding");
    assert.equal(processed.searchable, false);
    let status = processed.status;
    for (let calls = 0; status !== "ready" && calls < 20; calls += 1) {
      const res = await app.inject({
        method: "POST",
        url: `/api/content/materials/${id}/process`,
        headers: bearer("tok-prof"),
      });
      status = res.json().status;
    }
    assert.equal(status, "ready");
    const live = await chunks.listActive(CLASS);
    assert.ok(live.length > 1);
    assert.ok(live.every((chunk) => chunk.generation === 1));

    // Simulate a reindex: the material rebuilds as generation 2 while generation 1 serves.
    await materials.update(id, { status: "uploaded" });
    const step = await app.inject({
      method: "POST",
      url: `/api/content/materials/${id}/process`,
      headers: bearer("tok-prof"),
    });
    assert.equal(step.json().searchable, true);
    assert.deepEqual(
      (await chunks.listActive(CLASS)).map((chunk) => chunk.id),
      live.map((chunk) => chunk.id),
    );
    for (let calls = 0; status !== "ready" || calls === 0; calls += 1) {
      const res = await app.inject({
        method: "POST",
        url: `/api/content/materials/${id}/process`,
        headers: bearer("tok-prof"),
      });
      status = res.json().status;
      if (calls > 20) break;
    }
    const rebuilt = await chunks.listActive(CLASS);
    assert.ok(rebuilt.every((chunk) => chunk.generation === 2));
    assert.equal(chunks.rows.size, rebuilt.length);
  } finally {
    await app.close();
  }
});

test("a held lease blocks a second worker until it expires", async () => {
  const materials = new InMemoryMaterialRepository();
  const now = new Date("2026-10-25T00:00:00.000Z");
  await materials.insertOrGet({
    id: randomUUID(),
    classId: CLASS,
    courseId: athenaDemoIds.course,
    title: "t",
    filename: "t.md",
    mimeType: "text/markdown",
    byteSize: 1,
    sha256: sha("t"),
    locale: "es",
    topicIds: [],
    status: "uploaded",
    attempts: 0,
    curriculumVersion: 1,
    uploadedBy: PROF,
    storagePath: "x",
    chunksTotal: 0,
    chunksEmbedded: 0,
    verifiedAt: now.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });
  const id = [...materials.rows.keys()][0]!;
  assert.equal((await materials.claim(id, now, 120_000))?.status, "extracting");
  assert.equal(await materials.claim(id, new Date(now.getTime() + 60_000), 120_000), null);
  assert.ok(await materials.claim(id, new Date(now.getTime() + 121_000), 120_000));
});

test("PDF pages are extracted with page numbers for citations", async () => {
  const materials = new InMemoryMaterialRepository();
  const chunks = new InMemoryChunkRepository(materials);
  const storage = new InMemoryMaterialStorage();
  const pdf = makePdf(["Triangulos: base por altura entre dos.", "Rectangulos: base por altura."]);
  const pages = await new DefaultDocumentExtractor().extract(pdf, "application/pdf");
  assert.deepEqual(
    pages.map((page) => page.page),
    [1, 2],
  );
  assert.match(pages[1]!.text, /Rectangulos/);

  const { app } = await makeApp({
    materials,
    chunks,
    storage,
    chunker: new ParagraphChunker({ targetChars: 40, overlapChars: 0 }),
  });
  try {
    const bytes = Buffer.from(pdf);
    const { json } = await upload(app, bytes, {
      ...createBody("x"),
      filename: "notas.pdf",
      mimeType: "application/pdf",
      byteSize: bytes.length,
      sha256: sha(bytes),
    });
    const id = json.material.id;
    await app.inject({
      method: "POST",
      url: `/api/content/materials/${id}/complete`,
      headers: bearer("tok-prof"),
    });
    const res = await app.inject({
      method: "POST",
      url: `/api/content/materials/${id}/process`,
      headers: bearer("tok-prof"),
    });
    assert.equal(res.json().status, "ready", res.body);
    const live = await chunks.listActive(CLASS);
    assert.deepEqual(
      live.map((chunk) => [chunk.pageStart, chunk.pageEnd]),
      [
        [1, 1],
        [2, 2],
      ],
    );
  } finally {
    await app.close();
  }
});

test("chunker keeps sections, pages and overlap, and splits long paragraphs", () => {
  const chunker = new ParagraphChunker({ targetChars: 60, overlapChars: 30 });
  const drafts = chunker.chunk([
    { page: 1, text: "# Intro\n\nPrimer párrafo corto.\n\nSegundo párrafo corto." },
    { page: 2, text: "## Detalle\n\nTercer párrafo que es algo más largo que los otros." },
  ]);
  assert.ok(drafts.length >= 2);
  assert.equal(drafts[0]!.sectionTitle, "Intro");
  assert.equal(drafts[0]!.pageStart, 1);
  assert.equal(drafts.at(-1)!.pageEnd, 2);
  assert.ok(drafts.some((draft) => draft.sectionTitle === "Detalle"));
  assert.deepEqual(
    drafts.map((draft) => draft.chunkIndex),
    drafts.map((_, index) => index),
  );
  const long = chunker.chunk([{ text: "Una frase. ".repeat(30) }]);
  assert.ok(long.length > 1);
  assert.ok(long.every((draft) => draft.content.length <= 60 + 30 + 4));
  assert.deepEqual(chunker.chunk([{ text: "  \n\n " }]), []);
});

test("mock embeddings are deterministic, normalized and similar for shared words", async () => {
  const provider = new MockEmbeddingProvider();
  const [a, b, c] = await provider.embedDocuments([
    { title: "", text: "área del triángulo base altura" },
    { title: "", text: "Area del triangulo: base y altura" },
    { title: "", text: "probabilidad de eventos independientes" },
  ]);
  const dot = (x: number[], y: number[]) => x.reduce((sum, v, i) => sum + v * y[i]!, 0);
  assert.equal(a!.length, 768);
  assert.ok(Math.abs(dot(a!, a!) - 1) < 1e-9);
  assert.ok(dot(a!, b!) > 0.8);
  assert.ok(dot(a!, c!) < 0.3);
  assert.deepEqual(await provider.embedQuery("área del triángulo base altura"), a);
});

test("objectives and milestones: upsert by id, conflicts, validation and soft delete", async () => {
  const { app } = await makeApp();
  const put = (kind: string, id: string, payload: object, token = "tok-prof", classId = CLASS) =>
    app.inject({
      method: "PUT",
      url: `/api/content/classes/${classId}/${kind}/${id}`,
      headers: bearer(token),
      payload,
    });
  const objective = (code: string) => ({
    topicId: topics.geometry,
    code,
    statement: { es: "Calcular el área", en: "Compute the area" },
    position: 0,
  });
  try {
    const first = randomUUID();
    const created = await put("objectives", first, objective("OBJ-1"));
    assert.equal(created.statusCode, 200);
    const updatedAt = created.json().updatedAt;
    assert.equal(
      (
        await put("objectives", first, {
          ...objective("OBJ-1"),
          position: 1,
          expectedUpdatedAt: updatedAt,
        })
      ).statusCode,
      200,
    );
    assert.equal(
      (
        await put("objectives", first, {
          ...objective("OBJ-1"),
          expectedUpdatedAt: "2000-01-01T00:00:00.000Z",
        })
      ).statusCode,
      409,
    );
    assert.equal((await put("objectives", randomUUID(), objective("OBJ-1"))).statusCode, 409);
    assert.equal(
      (await put("objectives", randomUUID(), { ...objective("OBJ-2"), topicId: OTHER_TOPIC }))
        .statusCode,
      400,
    );
    assert.equal(
      (await put("objectives", randomUUID(), { ...objective("OBJ-3"), materialId: randomUUID() }))
        .statusCode,
      400,
    );
    // An id that belongs to another class is not taken over.
    assert.equal(
      (
        await put(
          "objectives",
          first,
          { ...objective("X"), topicId: OTHER_TOPIC },
          "tok-prof-2",
          OTHER_CLASS,
        )
      ).statusCode,
      404,
    );

    const second = randomUUID();
    await put("objectives", second, objective("OBJ-2"));
    const milestone = randomUUID();
    const milestoneBody = {
      title: { es: "Parcial 1", en: "Midterm 1" },
      position: 0,
      objectiveIds: [first, second],
      dueAt: "2026-11-15T00:00:00.000Z",
    };
    assert.equal((await put("milestones", milestone, milestoneBody)).statusCode, 200);
    assert.equal(
      (await put("milestones", randomUUID(), { ...milestoneBody, objectiveIds: [randomUUID()] }))
        .statusCode,
      400,
    );

    const removed = await app.inject({
      method: "DELETE",
      url: `/api/content/classes/${CLASS}/objectives/${second}`,
      headers: bearer("tok-prof"),
    });
    assert.equal(removed.statusCode, 204);
    const objectives = await app.inject({
      method: "GET",
      url: `/api/content/classes/${CLASS}/objectives`,
      headers: bearer("tok-lucia"),
    });
    assert.deepEqual(
      objectives.json().map((o: { id: string }) => o.id),
      [first],
    );
    const milestones = await app.inject({
      method: "GET",
      url: `/api/content/classes/${CLASS}/milestones`,
      headers: bearer("tok-lucia"),
    });
    assert.deepEqual(milestones.json()[0].objectiveIds, [first]);
    assert.equal(
      (
        await app.inject({
          method: "DELETE",
          url: `/api/content/classes/${CLASS}/objectives/${randomUUID()}`,
          headers: bearer("tok-prof"),
        })
      ).statusCode,
      404,
    );
  } finally {
    await app.close();
  }
});

test("the dev upload route rejects unknown tokens and non-binary bodies", async () => {
  const { app } = await makeApp();
  try {
    const unknown = await app.inject({
      method: "PUT",
      url: `/api/content/dev-uploads/${randomUUID()}`,
      headers: { ...bearer("tok-prof"), "content-type": "application/octet-stream" },
      payload: Buffer.from("x"),
    });
    assert.equal(unknown.statusCode, 404);
    const wrongType = await app.inject({
      method: "PUT",
      url: `/api/content/dev-uploads/${randomUUID()}`,
      headers: { ...bearer("tok-prof"), "content-type": "application/json" },
      payload: { x: 1 },
    });
    assert.equal(wrongType.statusCode, 415);
  } finally {
    await app.close();
  }
});

test("ingestion service works directly with injected parts", async () => {
  const materials = new InMemoryMaterialRepository();
  const service = new MaterialIngestionService({
    materials,
    chunks: new InMemoryChunkRepository(materials),
    storage: new InMemoryMaterialStorage(),
    extractor: new DefaultDocumentExtractor(),
    chunker: new ParagraphChunker(),
    embeddings: new MockEmbeddingProvider(),
    events: createPlatformServices().events,
    clock: { now: () => new Date() },
    ids: { next: () => randomUUID() },
  });
  assert.equal(await service.process(randomUUID()), null);
});

/** Minimal valid PDF with one Helvetica text line per page and a correct xref table. */
function makePdf(pageTexts: string[]): Uint8Array {
  const objects: string[] = [];
  const pageIds = pageTexts.map((_, index) => 4 + index * 2);
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageTexts.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  pageTexts.forEach((text, index) => {
    const pageId = pageIds[index]!;
    const stream = `BT /F1 12 Tf 72 720 Td (${text}) Tj ET`;
    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${pageId + 1} 0 R >>`;
    objects[pageId + 1] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = out.length;
    out += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xref = out.length;
  out += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1)
    out += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(out);
}
