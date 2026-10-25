import assert from "node:assert/strict";
import test from "node:test";
import { healthResponseSchema } from "@athena/shared";
import { createApp } from "../src/app.js";

test("health responds without credentials or a network listener", async () => {
  const app = await createApp({ logger: false });
  try {
    const response = await app.inject({ method: "GET", url: "/api/health" });
    assert.equal(response.statusCode, 200);
    assert.equal(healthResponseSchema.parse(response.json()).status, "ok");
    assert.equal(
      (await app.inject({ method: "GET", url: "/api/learning/quiz/topic-1" })).statusCode,
      400,
    );
  } finally {
    await app.close();
  }
});
test("legacy generic AI endpoint validates before invoking external services", async () => {
  const app = await createApp({ logger: false });
  try {
    const response = await app.inject({
      method: "POST",
      url: "/api/ai/prompt",
      payload: { prompt: "" },
    });
    assert.equal(response.statusCode, 400);
  } finally {
    await app.close();
  }
});
