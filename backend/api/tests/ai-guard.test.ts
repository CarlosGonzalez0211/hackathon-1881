import assert from "node:assert/strict";
import test from "node:test";
import { RoleAuthorizationService } from "@athena/platform";
import type { AuthContext } from "@athena/shared";
import { createApp } from "../src/app.js";

const caller = (role: AuthContext["role"], userId = "u"): AuthContext => ({
  userId,
  displayName: "U",
  role,
  classIds: [],
  courseIds: [],
  studentIds: [],
});

async function appFor(context: AuthContext) {
  return createApp({
    logger: false,
    dataMode: "mock",
    platform: {
      auth: { authenticate: async () => context },
      authorization: new RoleAuthorizationService(),
    },
  });
}

const post = (app: Awaited<ReturnType<typeof appFor>>, prompt = "") =>
  app.inject({ method: "POST", url: "/api/ai/prompt", payload: { prompt } });

test("students cannot use the AI proxy", async () => {
  const app = await appFor(caller("student"));
  try {
    assert.equal((await post(app, "hello")).statusCode, 403);
  } finally {
    await app.close();
  }
});

test("staff are rate limited per caller before Gemini is reached", async () => {
  const app = await appFor(caller("professor", "prof-1"));
  try {
    // An empty prompt fails validation (400) but still counts against the limit.
    for (let i = 0; i < 10; i += 1) assert.equal((await post(app)).statusCode, 400);
    assert.equal((await post(app)).statusCode, 429);
  } finally {
    await app.close();
  }
});
