import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import Fastify, { type FastifyInstance } from "fastify";
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
  type ContentRoutesOptions,
  type CurriculumCatalogPort,
} from "@athena/content";

/** Shared identities, classes and helpers for the content route tests. */
export const { students, topics } = athenaDemoIds;
export const CLASS = athenaDemoIds.class;
export const OTHER_CLASS = "00000000-0000-4000-8000-0000000000c2";
export const OTHER_COURSE = "00000000-0000-4000-8000-000000000a02";
export const PROF = "00000000-0000-4000-8000-0000000000f1";
export const PROF_2 = "00000000-0000-4000-8000-0000000000f2";
export const ADMIN = "00000000-0000-4000-8000-0000000000f3";
export const OTHER_TOPIC = "00000000-0000-4000-8000-000000000b99";

export const profile = (
  id: string,
  authUserId: string,
  role: "student" | "professor" | "admin",
) => ({
  id,
  authUserId,
  role,
  displayName: `User ${id.slice(-3)}`,
});
export const directory = new InMemoryIdentityDirectory(
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
export const verifier = new StaticTokenVerifier({
  "tok-prof": "auth-prof",
  "tok-prof-2": "auth-prof-2",
  "tok-admin": "auth-admin",
  "tok-lucia": "auth-lucia",
  "tok-diego": "auth-diego",
});
export const classCatalog = new InMemoryClassCatalog([
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
export const catalog: CurriculumCatalogPort = {
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
export async function makeApp(
  options: ContentRoutesOptions = {},
  platform: Partial<PlatformServices> = {},
  /** Other modules to mount beside content (e.g. analytics); must register before requests. */
  extra?: (api: FastifyInstance) => Promise<void>,
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
  await app.register(
    async (api) => {
      await contentRoutes(api, { catalog, ...options });
      if (extra) await extra(api);
    },
    { prefix: "/api" },
  );
  return { app, services };
}

export const bearer = (token?: string) => (token ? { authorization: `Bearer ${token}` } : {});
export const sha = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");

export const NOTES = [
  "# Área de triángulos",
  "El área de un triángulo es la base por la altura dividida entre dos.",
  "# Rectángulos",
  "El área de un rectángulo es la base por la altura.",
].join("\n\n");

export function createBody(text: string, overrides: Partial<CreateContentMaterialRequest> = {}) {
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

export type App = Awaited<ReturnType<typeof makeApp>>["app"];

export async function upload(app: App, bytes: Buffer, body: object, token = "tok-prof") {
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

export async function uploadAndProcess(app: App, text: string, overrides = {}) {
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
