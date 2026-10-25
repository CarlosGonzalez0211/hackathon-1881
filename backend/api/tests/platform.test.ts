import assert from "node:assert/strict";
import test from "node:test";
import {
  athenaDemoIds,
  authContextSchema,
  classAnalyticsSchema,
  type DomainEvent,
} from "@athena/shared";
import {
  AllowAllAuthService,
  InMemoryDomainEventStore,
  RoleAuthorizationService,
} from "@athena/platform";
import { createApp } from "../src/app.js";

test("health and CORS preflight never need a caller; real mode refuses the allow-all stub", async () => {
  let calls = 0;
  const app = await createApp({
    logger: false,
    platform: {
      auth: {
        authenticate: async () => {
          calls++;
          throw new Error("no token");
        },
      },
    },
  });
  try {
    assert.equal((await app.inject({ method: "GET", url: "/api/health" })).statusCode, 200);
    await app.inject({ method: "OPTIONS", url: "/api/auth/me" });
    assert.equal(calls, 0);
  } finally {
    await app.close();
  }
  // Real mode without credentials fails loudly instead of falling back to the allow-all stub.
  await assert.rejects(createApp({ logger: false, dataMode: "real" }), /SUPABASE_URL/);
  // Real mode with the stub injected explicitly is also refused.
  await assert.rejects(
    createApp({
      logger: false,
      dataMode: "real",
      platform: { auth: new AllowAllAuthService(), authorization: new RoleAuthorizationService() },
    }),
    /real AuthService/,
  );
});

const event = (overrides: Partial<DomainEvent> = {}) => ({
  id: "00000000-0000-4000-8000-0000000000e1",
  type: "MasteryUpdated",
  aggregateType: "student_topic_mastery",
  aggregateId: athenaDemoIds.topics.geometry,
  studentId: athenaDemoIds.students.lucia,
  classId: athenaDemoIds.class,
  occurredAt: "2026-10-24T12:00:00.000Z",
  payload: { previous: 0.4, next: 0.6 },
  ...overrides,
});

test("event store ignores duplicate ids and notifies handlers once", async () => {
  const store = new InMemoryDomainEventStore();
  const seen: string[] = [];
  store.subscribe((e) => {
    seen.push(e.id);
  });
  assert.equal((await store.append(event())).appended, true);
  assert.equal((await store.append(event())).appended, false);
  assert.equal(seen.length, 1);
  assert.equal((await store.list()).length, 1);
});

test("event store filters, rejects malformed events and isolates handler failures", async () => {
  const errors: unknown[] = [];
  const store = new InMemoryDomainEventStore({ onHandlerError: (error) => errors.push(error) });
  store.subscribe(() => {
    throw new Error("boom");
  });
  await store.append(event());
  await store.append(
    event({
      id: "00000000-0000-4000-8000-0000000000e2",
      type: "AiUsageRecorded",
      studentId: undefined,
    }),
  );
  assert.equal(errors.length, 2);
  assert.equal((await store.list({ type: "AiUsageRecorded" })).length, 1);
  assert.equal((await store.list({ studentId: athenaDemoIds.students.lucia })).length, 1);
  await assert.rejects(store.append({ ...event(), type: "NotAnEvent" }));
});

test("auth/me returns the allow-all demo context", async () => {
  const app = await createApp({ logger: false });
  try {
    const response = await app.inject({ method: "GET", url: "/api/auth/me" });
    assert.equal(response.statusCode, 200);
    const context = authContextSchema.parse(response.json());
    assert.deepEqual(context.classIds, [athenaDemoIds.class]);
  } finally {
    await app.close();
  }
});

test("analytics serves the demo class and 404s unknown classes", async () => {
  const app = await createApp({ logger: false });
  try {
    const ok = await app.inject({
      method: "GET",
      url: `/api/analytics/class/${athenaDemoIds.class}`,
    });
    assert.equal(ok.statusCode, 200);
    assert.equal(classAnalyticsSchema.parse(ok.json()).classId, athenaDemoIds.class);
    const missing = await app.inject({ method: "GET", url: "/api/analytics/class/nope" });
    assert.equal(missing.statusCode, 404);
  } finally {
    await app.close();
  }
});

test("analytics refuses classes the authorization service denies", async () => {
  const app = await createApp({
    logger: false,
    platform: {
      authorization: {
        canAccessClass: () => false,
        canManageClass: () => false,
        canAccessCourse: () => false,
        canAccessStudent: () => false,
      },
    },
  });
  try {
    const response = await app.inject({
      method: "GET",
      url: `/api/analytics/class/${athenaDemoIds.class}`,
    });
    assert.equal(response.statusCode, 403);
  } finally {
    await app.close();
  }
});
