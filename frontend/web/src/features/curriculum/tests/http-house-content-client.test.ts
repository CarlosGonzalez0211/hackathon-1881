import assert from "node:assert/strict";
import test from "node:test";
import { HttpHouseContentClient, CurriculumContentError } from "../api/http-house-content-client";
const content = {
  topicId: "topic-geometry",
  courseId: "course-math-1",
  title: "Geometría",
  materials: [],
  resources: [],
  updatedAt: "2026-10-24T00:00:00.000Z",
};
const provider = async () => "fixture-session-token";
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

test("uses the authenticated curriculum API, encoded topic IDs, locale, and no-store", async () => {
  let called = false;
  const signal = new AbortController().signal;
  const client = new HttpHouseContentClient({
    apiOrigin: "http://localhost:4000/",
    getAccessToken: provider,
    fetch: async (url, options) => {
      called = true;
      assert.equal(url, "http://localhost:4000/api/topics/topic%2Fone/sources?locale=es");
      assert.deepEqual(options?.headers, {
        Accept: "application/json",
        Authorization: "Bearer fixture-session-token",
      });
      assert.equal(options?.cache, "no-store");
      assert.equal(options?.signal, signal);
      return json(content);
    },
  });
  assert.deepEqual(await client.getHouseContent("topic/one", { locale: "es", signal }), content);
  assert.ok(called);
});
test("does not make anonymous requests or invent tokens", async () => {
  for (const getAccessToken of [
    async () => null,
    async () => {
      throw new Error("No session");
    },
  ]) {
    const client = new HttpHouseContentClient({
      apiOrigin: "",
      getAccessToken,
      fetch: async () => {
        assert.fail("Must not fetch without a session");
      },
    });
    await assert.rejects(
      client.getHouseContent("topic-geometry"),
      (e: unknown) => e instanceof CurriculumContentError && e.code === "unauthenticated",
    );
  }
});
test("reads the latest session for each request and does not cache identity", async () => {
  let token = "first-fixture-token";
  const seen: unknown[] = [];
  const client = new HttpHouseContentClient({
    apiOrigin: "",
    getAccessToken: async () => token,
    fetch: async (_url, options) => {
      seen.push(options?.headers);
      return json(content);
    },
  });
  await client.getHouseContent("topic-geometry");
  token = "second-fixture-token";
  await client.getHouseContent("topic-geometry");
  assert.notDeepEqual(seen[0], seen[1]);
});
test("maps authentication, publication, missing content, and server failures to safe errors", async () => {
  for (const [status, code] of [
    [401, "unauthenticated"],
    [403, "forbidden"],
    [404, "not_found"],
    [500, "network"],
  ] as const) {
    const client = new HttpHouseContentClient({
      apiOrigin: "",
      getAccessToken: provider,
      fetch: async () => json({ error: "Internal details" }, status),
    });
    await assert.rejects(
      client.getHouseContent("topic-geometry"),
      (e: unknown) =>
        e instanceof CurriculumContentError &&
        e.code === code &&
        !e.message.includes("Internal details"),
    );
  }
});
test("rejects invalid responses and reports network failure", async () => {
  const invalid = new HttpHouseContentClient({
    apiOrigin: "",
    getAccessToken: provider,
    fetch: async () => json({}),
  });
  await assert.rejects(
    invalid.getHouseContent("topic-geometry"),
    (e: unknown) => e instanceof CurriculumContentError && e.code === "invalid_response",
  );
  const offline = new HttpHouseContentClient({
    apiOrigin: "",
    getAccessToken: provider,
    fetch: async () => {
      throw new Error("offline");
    },
  });
  await assert.rejects(
    offline.getHouseContent("topic-geometry"),
    (e: unknown) => e instanceof CurriculumContentError && e.code === "network",
  );
});
