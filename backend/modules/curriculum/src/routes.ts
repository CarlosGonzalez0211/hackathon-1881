import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { PlatformError, unauthorized, forbidden } from "@athena/platform";
import {
  authContextSchema,
  demoCurriculum,
  curriculumTopicSummarySchema,
  houseContentSchema,
} from "@athena/shared";
import { MockCurriculumRepository } from "./mock-repository.js";
import {
  WorldCurriculumTopicAdapter,
  type WorldCurriculumAdapterOptions,
} from "./world-curriculum-adapter.js";
import { WorldHouseContentAdapter } from "./house-content-adapter.js";
import { CurriculumRetrievalService } from "./retrieval-service.js";
import { curriculumCourseId, curriculumTopicId } from "./learning-context-adapter.js";
import {
  CurriculumError,
  type CourseAccessPolicy,
  type CurriculumReadRepository,
} from "./ports.js";

const id = z.string().trim().min(1).max(200);
const courseParams = z.object({ courseId: id }).strict();
const topicParams = z.object({ topicId: id }).strict();
const topicQuery = z.object({ published: z.enum(["true", "false"]).optional() }).strict();
const contentQuery = z.object({ locale: z.enum(["en", "es"]).optional() }).strict();
export interface CurriculumRoutesOptions extends WorldCurriculumAdapterOptions {
  repository?: CurriculumReadRepository;
  /** Server-owned routing metadata, never supplied by a request. */
  topicCourses?: readonly { topicId: string; courseId: string }[];
}
function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new PlatformError("Invalid curriculum request", 400);
  return result.data;
}
async function execute<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof CurriculumError) {
      const status = error.code === "FORBIDDEN" ? 403 : error.code === "NOT_FOUND" ? 404 : 400;
      throw new PlatformError(error.message, status);
    }
    throw error;
  }
}
/** Bridge to Platform's decision using only server-authenticated identity/grants. */
function readersFor(
  app: FastifyInstance,
  request: FastifyRequest,
  repository: CurriculumReadRepository,
) {
  const auth = request.auth;
  const access = { userId: auth.userId, courseIds: auth.courseIds.map(curriculumCourseId) };
  const policy: CourseAccessPolicy = {
    async assertCanRead(_access, courseId) {
      const aliases = [
        courseId,
        ...auth.courseIds.filter((grant) => curriculumCourseId(grant) === courseId),
      ];
      if (!aliases.some((value) => app.platform.authorization.canAccessCourse(auth, value)))
        throw forbidden("Course access denied");
    },
  };
  return { access, policy, catalog: new CurriculumRetrievalService(repository, policy) };
}

/** Two read-only World endpoints. Root Platform services must be installed first. */
export async function curriculumRoutes(
  app: FastifyInstance,
  options: CurriculumRoutesOptions = {},
) {
  const repository = options.repository ?? new MockCurriculumRepository();
  const publication = {
    publishedTopicIds: options.publishedTopicIds
      ? Object.freeze([...options.publishedTopicIds])
      : undefined,
    preserveMathematicsDemo: options.preserveMathematicsDemo,
  };
  const routing = new Map<string, string>();
  for (const entry of options.topicCourses ??
    demoCurriculum.topics.map((t) => ({ topicId: t.id, courseId: t.courseId }))) {
    const topicId = curriculumTopicId(parse(id, entry.topicId));
    const courseId = curriculumCourseId(parse(id, entry.courseId));
    if (routing.has(topicId)) throw new Error("Duplicate curriculum routing topic");
    routing.set(topicId, courseId);
  }
  app.addHook("preHandler", async (request) => {
    const header = request.headers.authorization;
    if (
      !header?.startsWith("Bearer ") ||
      !header.slice(7).trim() ||
      !authContextSchema.safeParse(request.auth).success
    )
      throw unauthorized("Authentication required");
  });
  app.get("/courses/:courseId/topics", async (request, reply) => {
    const { courseId: rawId } = parse(courseParams, request.params);
    const query = parse(topicQuery, request.query);
    const courseId = curriculumCourseId(rawId);
    const { access, policy, catalog } = readersFor(app, request, repository);
    return execute(async () => {
      // HTTP contract requires 404 for an authorized unknown course, unlike the World port's [].
      await catalog.getCourse(courseId, access);
      const topics = await new WorldCurriculumTopicAdapter(
        repository,
        policy,
        access,
        publication,
      ).listTopics(courseId);
      reply.header("Cache-Control", "private, no-store");
      return curriculumTopicSummarySchema
        .array()
        .parse(
          query.published === undefined
            ? topics
            : topics.filter((topic) => topic.published === (query.published === "true")),
        );
    });
  });
  app.get("/topics/:topicId/sources", async (request, reply) => {
    const { topicId: rawId } = parse(topicParams, request.params);
    const query = parse(contentQuery, request.query);
    const topicId = curriculumTopicId(rawId);
    const courseId = routing.get(topicId);
    if (!courseId) throw new PlatformError("Topic not found", 404);
    const { access, policy, catalog } = readersFor(app, request, repository);
    return execute(async () => {
      const course = await catalog.getCourse(courseId, access);
      const adapter = new WorldHouseContentAdapter(repository, policy, access, {
        ...publication,
        courseId,
        locale: query.locale ?? course.locale,
      });
      const content = await adapter.getHouseContent(topicId);
      reply.header("Cache-Control", "private, no-store");
      return houseContentSchema.parse(content);
    });
  });
}
