import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import {
  createPlatformServices,
  installPlatform,
  DirectoryAuthService,
  InMemoryIdentityDirectory,
  StaticTokenVerifier,
  RoleAuthorizationService,
  AllowAllAuthService,
} from "@athena/platform";
import {
  curriculumTopicSummarySchema,
  houseContentSchema,
  demoCurriculum,
  demoCurriculumTopics,
} from "@athena/shared";
import { curriculumRoutes, type CurriculumRoutesOptions } from "../src/routes.js";
import { MockCurriculumRepository } from "../src/mock-repository.js";

const profiles = [
  {
    id: "student-math",
    authUserId: "auth-math",
    role: "student" as const,
    displayName: "Math student",
  },
  {
    id: "student-history",
    authUserId: "auth-history",
    role: "student" as const,
    displayName: "History student",
  },
  {
    id: "professor",
    authUserId: "auth-prof",
    role: "professor" as const,
    displayName: "Professor",
  },
  { id: "admin", authUserId: "auth-admin", role: "admin" as const, displayName: "Admin" },
  {
    id: "alias-student",
    authUserId: "auth-alias",
    role: "student" as const,
    displayName: "Alias student",
  },
];
const directory = new InMemoryIdentityDirectory(profiles, [
  {
    id: "class-math",
    courseId: "course-math-1",
    professorId: "professor",
    studentIds: ["student-math"],
  },
  {
    id: "class-history",
    courseId: "course-history-1",
    professorId: "other-professor",
    studentIds: ["student-history"],
  },
  {
    id: "class-alias",
    courseId: "00000000-0000-4000-8000-000000000a01",
    professorId: "other-professor",
    studentIds: ["alias-student"],
  },
]);
const auth = new DirectoryAuthService(
  new StaticTokenVerifier({
    "math-token": "auth-math",
    "history-token": "auth-history",
    "prof-token": "auth-prof",
    "admin-token": "auth-admin",
    "alias-token": "auth-alias",
  }),
  directory,
);
const headers = (token = "math-token") => ({ authorization: `Bearer ${token}` });
async function setup(options: CurriculumRoutesOptions = {}, mockAuth = false) {
  const app = Fastify({ logger: false });
  installPlatform(
    app,
    createPlatformServices({
      auth: mockAuth ? new AllowAllAuthService() : auth,
      authorization: new RoleAuthorizationService(),
    }),
  );
  app.setErrorHandler((error: Error & { statusCode?: number }, _req, reply) => {
    const status = error.statusCode ?? 500;
    reply.status(status).send({ error: status >= 500 ? "Internal server error" : error.message });
  });
  await app.register(curriculumRoutes, { ...options, prefix: "/api" });
  return app;
}
async function withApp(
  run: (app: Awaited<ReturnType<typeof setup>>) => Promise<void>,
  options: CurriculumRoutesOptions = {},
  mockAuth = false,
) {
  const app = await setup(options, mockAuth);
  try {
    await run(app);
  } finally {
    await app.close();
  }
}

test("both routes require valid authenticated bearer identity", async () =>
  withApp(async (app) => {
    for (const url of ["/api/courses/course-math-1/topics", "/api/topics/topic-geometry/sources"]) {
      for (const token of [undefined, "bad-token", ""]) {
        const response = await app.inject({
          url,
          ...(token === undefined ? {} : { headers: headers(token) }),
        });
        assert.equal(response.statusCode, 401);
      }
    }
  }));

test("anonymous requests remain rejected even when local Platform uses its demo auth stub", async () =>
  withApp(
    async (app) => {
      assert.equal(
        (await app.inject({ url: "/api/topics/topic-geometry/sources" })).statusCode,
        401,
      );
    },
    {},
    true,
  ));

test("authorized student receives exact World Mathematics summaries", async () =>
  withApp(async (app) => {
    const response = await app.inject({
      url: "/api/courses/course-math-1/topics?published=true",
      headers: headers(),
    });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(
      curriculumTopicSummarySchema.array().parse(response.json()),
      demoCurriculumTopics,
    );
    assert.equal(response.headers["cache-control"], "private, no-store");
  }));

test("HouseContent keeps World's shape, shows TXT text, and preserves source references", async () =>
  withApp(async (app) => {
    const response = await app.inject({
      url: "/api/topics/topic-geometry/sources",
      headers: headers(),
    });
    assert.equal(response.statusCode, 200);
    const content = houseContentSchema.parse(response.json());
    assert.equal(content.courseId, "course-math-1");
    assert.equal(content.materials[0]!.mimeType, "text/plain");
    assert.equal(content.resources.length, 3);
    assert.ok(content.resources.every((r) => r.body!.includes("chunkId=") && r.url === undefined));
  }));

test("students and professors cannot access another course", async () =>
  withApp(async (app) => {
    for (const token of ["math-token", "prof-token"]) {
      assert.equal(
        (await app.inject({ url: "/api/courses/course-history-1/topics", headers: headers(token) }))
          .statusCode,
        403,
      );
      assert.equal(
        (
          await app.inject({
            url: "/api/topics/topic-comparing-rights/sources",
            headers: headers(token),
          })
        ).statusCode,
        403,
      );
    }
    assert.equal(
      (
        await app.inject({
          url: "/api/topics/topic-geometry/sources",
          headers: headers("history-token"),
        })
      ).statusCode,
      403,
    );
  }));

test("professor and admin grants are honored without module-local role bypasses", async () =>
  withApp(async (app) => {
    for (const token of ["prof-token", "admin-token"]) {
      assert.equal(
        (await app.inject({ url: "/api/topics/topic-geometry/sources", headers: headers(token) }))
          .statusCode,
        200,
      );
    }
  }));

test("unknown courses and topics return 404 to authorized callers", async () =>
  withApp(async (app) => {
    assert.equal(
      (await app.inject({ url: "/api/courses/missing/topics", headers: headers("admin-token") }))
        .statusCode,
      404,
    );
    assert.equal(
      (await app.inject({ url: "/api/topics/missing/sources", headers: headers() })).statusCode,
      404,
    );
  }));

test("History is published by default and returns content to authorized students", async () =>
  withApp(async (app) => {
    const response = await app.inject({
      url: "/api/courses/course-history-1/topics?published=true",
      headers: headers("history-token"),
    });
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().length, 6);
    assert.ok(response.json().every((topic: { published: boolean }) => topic.published));
    assert.equal(
      (
        await app.inject({
          url: "/api/topics/topic-comparing-rights/sources",
          headers: headers("history-token"),
        })
      ).statusCode,
      200,
    );
  }));

test("explicitly published History returns approved resources in English and Spanish", async () =>
  withApp(
    async (app) => {
      for (const locale of ["en", "es"]) {
        const response = await app.inject({
          url: `/api/topics/topic-comparing-rights/sources?locale=${locale}`,
          headers: headers("history-token"),
        });
        assert.equal(response.statusCode, 200);
        const content = houseContentSchema.parse(response.json());
        assert.equal(content.resources.length, 4);
        const scripts = content.resources.filter((r) => r.format !== "text");
        assert.equal(scripts.length, 3);
        assert.ok(scripts.every((r) => r.id.endsWith(`-${locale}`) && r.body && !r.url));
      }
    },
    { publishedTopicIds: ["topic-comparing-rights"] },
  ));

test("unready materials force publication false and deny content", async () => {
  const data = structuredClone(demoCurriculum);
  data.materials.find((m) => m.topicIds.includes("topic-geometry"))!.status = "extracting";
  await withApp(
    async (app) => {
      const response = await app.inject({
        url: "/api/courses/course-math-1/topics?published=false",
        headers: headers(),
      });
      assert.equal(response.statusCode, 200);
      assert.deepEqual(
        response.json().map((t: { id: string }) => t.id),
        ["topic-geometry"],
      );
      assert.equal(
        (await app.inject({ url: "/api/topics/topic-geometry/sources", headers: headers() }))
          .statusCode,
        403,
      );
    },
    { repository: new MockCurriculumRepository(data) },
  );
});

test("invalid filters, languages, and client-supplied grants return 400", async () =>
  withApp(async (app) => {
    for (const url of [
      "/api/courses/course-math-1/topics?published=maybe",
      "/api/courses/course-math-1/topics?courseIds=course-history-1",
      "/api/topics/topic-geometry/sources?locale=fr",
      "/api/topics/topic-geometry/sources?courseId=course-history-1",
    ]) {
      assert.equal((await app.inject({ url, headers: headers() })).statusCode, 400);
    }
  }));

test("trusted UUID membership aliases authorize canonical curriculum without changing World IDs", async () =>
  withApp(async (app) => {
    const response = await app.inject({
      url: "/api/courses/00000000-0000-4000-8000-000000000a01/topics?published=true",
      headers: headers("alias-token"),
    });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), demoCurriculumTopics);
    assert.equal(
      (
        await app.inject({
          url: "/api/topics/00000000-0000-4000-8000-000000000b02/sources",
          headers: headers("alias-token"),
        })
      ).statusCode,
      200,
    );
  }));

test("Platform denial wins even when the caller is an admin", async () =>
  withApp(async (app) => {
    app.platform.authorization.canAccessCourse = () => false;
    for (const url of ["/api/courses/course-math-1/topics", "/api/topics/topic-geometry/sources"]) {
      assert.equal((await app.inject({ url, headers: headers("admin-token") })).statusCode, 403);
    }
  }));

test("denied requests do not read curriculum data", async () => {
  const repository = new MockCurriculumRepository();
  repository.getCourse = async () => {
    throw new Error("Unexpected data read");
  };
  await withApp(
    async (app) => {
      for (const url of [
        "/api/courses/course-history-1/topics",
        "/api/topics/topic-comparing-rights/sources",
      ]) {
        assert.equal((await app.inject({ url, headers: headers() })).statusCode, 403);
      }
    },
    { repository },
  );
});
