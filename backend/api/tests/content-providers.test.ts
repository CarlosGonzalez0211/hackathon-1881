import assert from "node:assert/strict";
import test from "node:test";
import { LayeredGuardrailClassifier, MockEmbeddingProvider } from "@athena/content";
import {
  AnthropicGuardrailClassifier,
  anthropicAnswerGenerator,
  type AnthropicMessages,
} from "../src/content-anthropic.js";
import {
  GeminiEmbeddingProvider,
  GeminiGuardrailClassifier,
  GeminiTextGenerator,
  geminiAnswerGenerator,
  type GenAiModels,
} from "../src/content-gemini.js";
import {
  iso,
  materialPatchToRow,
  parseVector,
  rowToMaterial,
  vectorLiteral,
} from "../src/content-supabase.js";
import { contentOptionsFor } from "../src/content.js";
import { bearer, CLASS, makeApp, NOTES, uploadAndProcess } from "./content-fixtures.js";

type EmbedRequest = Parameters<GenAiModels["embedContent"]>[0];
type GenerateRequest = Parameters<GenAiModels["generateContent"]>[0];

/** Fake @google/genai models: embeds with the mock bag-of-words, scripts text replies. */
function fakeModels(reply: (request: GenerateRequest) => string = () => "{}") {
  const embedCalls: EmbedRequest[] = [];
  const generateCalls: GenerateRequest[] = [];
  const mock = new MockEmbeddingProvider();
  const models: GenAiModels = {
    async embedContent(request) {
      embedCalls.push(request);
      const vectors = await Promise.all(
        request.contents.map((text) => mock.embedQuery(text.replace(/^.*?(text|query): /, ""))),
      );
      // Unnormalized on purpose: the adapter must normalize.
      return { embeddings: vectors.map((values) => ({ values: values.map((v) => v * 3) })) };
    },
    async generateContent(request) {
      generateCalls.push(request);
      return { text: reply(request) };
    },
  };
  return { models, embedCalls, generateCalls };
}

test("Gemini embeddings: task prefixes, 768 dims, batches of 100, normalized vectors", async () => {
  const { models, embedCalls } = fakeModels();
  const provider = new GeminiEmbeddingProvider(models, "gemini-embedding-2");
  const items = Array.from({ length: 150 }, (_, i) => ({
    title: i ? "Notas" : " ",
    text: `texto ${i}`,
  }));
  const vectors = await provider.embedDocuments(items);
  assert.equal(vectors.length, 150);
  assert.deepEqual(
    embedCalls.map((call) => call.contents.length),
    [100, 50],
  );
  assert.equal(embedCalls[0]!.contents[0], "title: none | text: texto 0");
  assert.equal(embedCalls[0]!.contents[1], "title: Notas | text: texto 1");
  assert.equal(embedCalls[0]!.config?.outputDimensionality, 768);
  assert.equal(embedCalls[0]!.config?.taskType, undefined);
  assert.ok(Math.abs(Math.hypot(...vectors[1]!) - 1) < 1e-9);

  await provider.embedQuery("¿Qué es el área?");
  assert.deepEqual(embedCalls.at(-1)!.contents, [
    "task: question answering | query: ¿Qué es el área?",
  ]);

  const legacy = new GeminiEmbeddingProvider(models, "gemini-embedding-001");
  await legacy.embedQuery("área");
  assert.deepEqual(embedCalls.at(-1)!.contents, ["área"]);
  assert.equal(embedCalls.at(-1)!.config?.taskType, "RETRIEVAL_QUERY");
});

test("Gemini embeddings reject responses that do not match the request", async () => {
  const models: GenAiModels = {
    embedContent: async () => ({ embeddings: [{ values: [1, 2, 3] }] }),
    generateContent: async () => ({ text: "" }),
  };
  await assert.rejects(new GeminiEmbeddingProvider(models, "gemini-embedding-2").embedQuery("x"));
});

test("Gemini text generation sends the system prompt and asks for JSON", async () => {
  const { models, generateCalls } = fakeModels(
    () => '{"answer":"Base por altura [S1]","citedSources":["S1"],"unsupported":false}',
  );
  assert.match(
    await new GeminiTextGenerator(models, "gemini-3.8-flash").generate({ system: "S", user: "U" }),
    /S1/,
  );
  const [call] = generateCalls;
  assert.equal(call!.model, "gemini-3.8-flash");
  assert.equal(call!.contents, "U");
  assert.equal(call!.config?.systemInstruction, "S");
  assert.equal(call!.config?.responseMimeType, "application/json");
  assert.ok(call!.config?.abortSignal);

  const answer = await geminiAnswerGenerator(models, "gemini-3.8-flash").generate({
    mode: "answer",
    message: "q",
    history: [],
    sources: [{ label: "S1", materialTitle: "Notas", text: "x" }],
    locale: "es",
    simplifiedLanguage: false,
  });
  assert.deepEqual(answer.citedSources, ["S1"]);
});

test("Gemini text generation can return plain text for the Learning tutor", async () => {
  const { models, generateCalls } = fakeModels(() => "Grounded lesson");
  const text = await new GeminiTextGenerator(models, "gemini-3.8-flash", {
    responseMimeType: "text/plain",
  }).generate({ system: "Teach from sources", user: "Explain triangles" });
  assert.equal(text, "Grounded lesson");
  assert.equal(generateCalls[0]!.config?.responseMimeType, "text/plain");
});

test("Gemini text generation retries overload errors and falls back to the next model", async () => {
  const overloaded = Object.assign(new Error("UNAVAILABLE"), { status: 503 });
  const tried: string[] = [];
  const models: GenAiModels = {
    embedContent: async () => ({ embeddings: [] }),
    async generateContent(request) {
      tried.push(request.model);
      if (request.model !== "backup") throw overloaded;
      return { text: '{"ok":true}' };
    },
  };
  const generator = new GeminiTextGenerator(models, "primary", {
    fallbackModels: ["flaky", "backup"],
    backoffMs: 1,
  });
  assert.equal(await generator.generate({ system: "S", user: "U" }), '{"ok":true}');
  assert.deepEqual(tried, ["primary", "flaky", "backup"]);

  tried.length = 0;
  await assert.rejects(
    new GeminiTextGenerator(models, "primary", { rounds: 2, backoffMs: 1 }).generate({
      system: "S",
      user: "U",
    }),
    overloaded,
  );
  assert.deepEqual(tried, ["primary", "primary"]);
});

test("Anthropic adapters send system + fenced user text and parse the JSON reply", async () => {
  const requests: Parameters<AnthropicMessages["create"]>[0][] = [];
  const reply = (text: string, stop_reason: string | null = "end_turn") => ({
    content: [{ type: "thinking" }, { type: "text", text }],
    stop_reason,
  });
  let next = reply('{"answer":"Base por altura [S1]","citedSources":["S1"],"unsupported":false}');
  const messages: AnthropicMessages = {
    async create(request) {
      requests.push(request);
      return next;
    },
  };

  const answer = await anthropicAnswerGenerator(messages, "claude-sonnet-5-5").generate({
    mode: "answer",
    message: "q",
    history: [],
    sources: [{ label: "S1", materialTitle: "Notas", text: "x" }],
    locale: "es",
    simplifiedLanguage: false,
  });
  assert.deepEqual(answer.citedSources, ["S1"]);
  assert.equal(requests[0]!.model, "claude-sonnet-5-5");
  assert.ok(requests[0]!.system.length > 0);
  assert.equal(requests[0]!.messages[0]!.role, "user");

  next = reply('{"category":"graded_work","confidence":0.9}');
  const classifier = new AnthropicGuardrailClassifier(messages, "claude-haiku-5-5");
  assert.deepEqual(await classifier.classify({ message: "hazme el examen", locale: "es" }), {
    category: "graded_work",
    confidence: 0.9,
  });
  assert.match(requests[1]!.messages[0]!.content, /^MESSAGE <<</);

  // Garbage, a refusal and a cut-off reply all throw, so the chat fails closed.
  next = reply("not json");
  await assert.rejects(classifier.classify({ message: "hola", locale: "es" }));
  next = reply('{"category":"ok","confidence":1}', "refusal");
  await assert.rejects(classifier.classify({ message: "hola", locale: "es" }), /refusal/);
  next = reply('{"category":"ok"', "max_tokens");
  await assert.rejects(classifier.classify({ message: "hola", locale: "es" }), /max_tokens/);
});

test("Gemini text generation does not retry client errors", async () => {
  let calls = 0;
  const models: GenAiModels = {
    embedContent: async () => ({ embeddings: [] }),
    async generateContent() {
      calls += 1;
      throw Object.assign(new Error("bad request"), { status: 400 });
    },
  };
  await assert.rejects(
    new GeminiTextGenerator(models, "primary", {
      fallbackModels: ["backup"],
      backoffMs: 1,
    }).generate({ system: "S", user: "U" }),
    /bad request/,
  );
  assert.equal(calls, 1);
});

test("Gemini guardrail parses verdicts, fences the message and fails on garbage", async () => {
  let reply = '```json\n{"category":"off_topic","confidence":0.92}\n```';
  const { models, generateCalls } = fakeModels(() => reply);
  const classifier = new GeminiGuardrailClassifier(models, "gemini-3.5-flash-lite");
  assert.deepEqual(await classifier.classify({ message: "Cuéntame un chiste", locale: "es" }), {
    category: "off_topic",
    confidence: 0.92,
  });
  const call = generateCalls[0]!;
  assert.match(call.config?.systemInstruction ?? "", /untrusted data/);
  assert.match(call.contents, /^MESSAGE <<<[0-9a-f]{16}\nCuéntame un chiste\n[0-9a-f]{16}>>>$/);

  reply = "I think it's fine";
  await assert.rejects(classifier.classify({ message: "hola", locale: "es" }));

  reply = '{"category":"graded_work","confidence":0.4}';
  const layered = new LayeredGuardrailClassifier(undefined, classifier);
  assert.equal((await layered.classify({ message: "hola", locale: "es" })).category, "ok");
  // Heuristic hits never reach the model.
  const before = generateCalls.length;
  assert.equal(
    (await layered.classify({ message: "quiero morir", locale: "es" })).category,
    "self_harm",
  );
  assert.equal(generateCalls.length, before);
});

test("the chat route works end to end on the Gemini adapters (faked client)", async () => {
  const { models } = fakeModels((request) =>
    request.config?.systemInstruction?.startsWith("You label")
      ? '{"category":"ok","confidence":0.99}'
      : '{"answer":"El área es base por altura entre dos [S1].","citedSources":["S1"],"unsupported":false}',
  );
  const { app } = await makeApp({
    embeddings: new GeminiEmbeddingProvider(models, "gemini-embedding-2"),
    generator: geminiAnswerGenerator(models, "gemini-3.8-flash"),
    classifier: new LayeredGuardrailClassifier(
      undefined,
      new GeminiGuardrailClassifier(models, "gemini-3.5-flash-lite"),
    ),
    retrieval: { minSimilarity: 0.2 },
  });
  try {
    await uploadAndProcess(app, NOTES);
    const res = await app.inject({
      method: "POST",
      url: `/api/content/classes/${CLASS}/chat`,
      headers: bearer("tok-lucia"),
      payload: { message: "¿Cómo se calcula el área de un triángulo?" },
    });
    assert.equal(res.statusCode, 200, res.body);
    assert.equal(res.json().outcome, "answered");
    assert.equal(res.json().answer, "El área es base por altura entre dos [1].");
    assert.equal(res.json().citations[0].materialTitle, "Notas de geometría");
  } finally {
    await app.close();
  }
});

test("Supabase rows map to records: ISO timestamps, nulls dropped, topics sorted", () => {
  const record = rowToMaterial({
    id: "m1",
    class_id: "c1",
    course_id: "k1",
    title: "Notas",
    filename: "n.pdf",
    mime_type: "application/pdf",
    byte_size: "1024",
    sha256: "a".repeat(64),
    storage_path: "c1/aaa",
    locale: "es",
    status: "ready",
    error_code: null,
    error_message: null,
    attempts: 1,
    chunks_total: 3,
    chunks_embedded: 3,
    active_generation: 1,
    building_generation: null,
    curriculum_version: 1,
    uploaded_by: "p1",
    verified_at: "2026-10-25 10:00:00.5+00",
    claimed_at: null,
    created_at: "2026-10-25T09:00:00+00:00",
    updated_at: "2026-10-25T10:00:01.123456+00:00",
    processed_at: null,
    content_material_topics: [{ topic_id: "t2" }, { topic_id: "t1" }],
  });
  assert.equal(record.byteSize, 1024);
  assert.equal(record.verifiedAt, "2026-10-25T10:00:00.500Z");
  assert.equal(record.createdAt, "2026-10-25T09:00:00.000Z");
  assert.equal(record.errorCode, undefined);
  assert.equal(record.buildingGeneration, undefined);
  assert.deepEqual(record.topicIds, ["t1", "t2"]);
  assert.equal(iso("2026-10-25T10:00:00Z"), "2026-10-25T10:00:00.000Z");
});

test("material patches clear columns for undefined and leave topics to their table", () => {
  assert.deepEqual(
    materialPatchToRow({
      status: "extracting",
      errorCode: undefined,
      claimedAt: undefined,
      topicIds: ["t1"],
    }),
    { status: "extracting", error_code: null, claimed_at: null },
  );
  assert.deepEqual(parseVector(vectorLiteral([0.5, -1, 2e-3])), [0.5, -1, 0.002]);
  assert.deepEqual(parseVector([1, 2]), [1, 2]);
});

test("mock data and AI modes share the seeded in-memory graph", async () => {
  const options = contentOptionsFor("mock", "mock");
  assert.ok(options.materials);
  assert.ok(options.chunks);
  assert.ok(options.objectives);
  assert.equal((await options.materials.listByClass(CLASS)).length, 2);
});
