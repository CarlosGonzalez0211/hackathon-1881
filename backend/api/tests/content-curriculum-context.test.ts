import assert from "node:assert/strict";
import test from "node:test";
import { athenaDemoIds, demoLearningIds, type AuthContext } from "@athena/shared";
import { InMemoryClassCatalog, InMemoryEnrollmentRegistry } from "@athena/platform";
import {
  ContentCurriculumContext,
  InMemoryChunkRepository,
  InMemoryMaterialRepository,
  InMemoryVersionedRepository,
  MockEmbeddingProvider,
  type MaterialRecord,
  type ObjectiveRecord,
} from "@athena/content";

const OTHER_CLASS = "00000000-0000-4000-8000-0000000000c2";
const MATERIAL = "00000000-0000-4000-8000-000000000e01";
const OTHER_MATERIAL = "00000000-0000-4000-8000-000000000e02";
const OBJECTIVE = "00000000-0000-4000-8000-000000000f01";
const OTHER_OBJECTIVE = "00000000-0000-4000-8000-000000000f02";
const CHUNK = "00000000-0000-4000-8000-000000000d01";
const OTHER_CHUNK = "00000000-0000-4000-8000-000000000d02";
const CREATED = "2026-10-24T00:00:00.000Z";

const context: AuthContext = {
  userId: athenaDemoIds.professorRuiz,
  displayName: "Professor Ruiz",
  role: "professor",
  classIds: [athenaDemoIds.class, OTHER_CLASS],
  courseIds: [athenaDemoIds.course],
  studentIds: [athenaDemoIds.students.lucia, athenaDemoIds.students.diego],
};

const material = (id: string, classId: string, title: string): MaterialRecord => ({
  id,
  classId,
  courseId: athenaDemoIds.course,
  title,
  filename: `${title}.md`,
  mimeType: "text/markdown",
  byteSize: 100,
  sha256: id.replaceAll("-", "").padEnd(64, "0").slice(0, 64),
  locale: "es",
  topicIds: [athenaDemoIds.topics.geometry],
  status: "ready",
  attempts: 1,
  curriculumVersion: 1,
  uploadedBy: athenaDemoIds.professorRuiz,
  createdAt: CREATED,
  updatedAt: CREATED,
  processedAt: CREATED,
  storagePath: `${classId}/${id}.md`,
  chunksTotal: 1,
  chunksEmbedded: 1,
  activeGeneration: 1,
  verifiedAt: CREATED,
});

async function fixture(minSimilarity = 0.05) {
  const materials = new InMemoryMaterialRepository();
  const chunks = new InMemoryChunkRepository(materials);
  const objectives = new InMemoryVersionedRepository<ObjectiveRecord>();
  const embeddings = new MockEmbeddingProvider();
  await materials.insertOrGet(material(MATERIAL, athenaDemoIds.class, "Lucía geometry"));
  await materials.insertOrGet(material(OTHER_MATERIAL, OTHER_CLASS, "Diego geometry"));
  await objectives.upsert(
    {
      id: OBJECTIVE,
      classId: athenaDemoIds.class,
      topicId: athenaDemoIds.topics.geometry,
      materialId: MATERIAL,
      code: "GEO-1",
      statement: { es: "Área de triángulos", en: "Triangle area" },
      conceptId: demoLearningIds.concepts.triangleArea,
      position: 0,
      updatedAt: CREATED,
    },
    undefined,
    athenaDemoIds.professorRuiz,
  );
  await objectives.upsert(
    {
      id: OTHER_OBJECTIVE,
      classId: OTHER_CLASS,
      topicId: athenaDemoIds.topics.geometry,
      materialId: OTHER_MATERIAL,
      code: "GEO-1",
      statement: { es: "Área de triángulos", en: "Triangle area" },
      conceptId: demoLearningIds.concepts.triangleArea,
      position: 0,
      updatedAt: CREATED,
    },
    undefined,
    athenaDemoIds.professorRuiz,
  );
  const [ownEmbedding, otherEmbedding] = await embeddings.embedDocuments([
    { title: "Lucía geometry", text: "El área del triángulo es base por altura entre dos." },
    { title: "Diego geometry", text: "Texto privado de la otra clase sobre triángulos." },
  ]);
  await chunks.insert([
    {
      id: CHUNK,
      materialId: MATERIAL,
      classId: athenaDemoIds.class,
      generation: 1,
      chunkIndex: 0,
      sectionTitle: "Área de triángulos",
      content: "El área del triángulo es base por altura entre dos.",
      contentHash: "own",
      tokenEstimate: 12,
      embedding: ownEmbedding,
      embeddingModel: embeddings.model,
    },
    {
      id: OTHER_CHUNK,
      materialId: OTHER_MATERIAL,
      classId: OTHER_CLASS,
      generation: 1,
      chunkIndex: 0,
      sectionTitle: "Privado",
      content: "Texto privado de la otra clase sobre triángulos.",
      contentHash: "other",
      tokenEstimate: 10,
      embedding: otherEmbedding,
      embeddingModel: embeddings.model,
    },
  ]);
  const adapter = new ContentCurriculumContext({
    classes: new InMemoryClassCatalog([
      {
        id: athenaDemoIds.class,
        courseId: athenaDemoIds.course,
        professorId: athenaDemoIds.professorRuiz,
        title: "A",
        createdAt: CREATED,
      },
      {
        id: OTHER_CLASS,
        courseId: athenaDemoIds.course,
        professorId: athenaDemoIds.professorRuiz,
        title: "B",
        createdAt: CREATED,
      },
    ]),
    enrollments: new InMemoryEnrollmentRegistry([
      {
        classId: athenaDemoIds.class,
        students: [{ studentId: athenaDemoIds.students.lucia, displayName: "Lucía" }],
      },
      {
        classId: OTHER_CLASS,
        students: [{ studentId: athenaDemoIds.students.diego, displayName: "Diego" }],
      },
    ]),
    catalog: {
      async listTopics() {
        return [{ id: athenaDemoIds.topics.geometry, title: "Geometry" }];
      },
      async activeVersion() {
        return 1;
      },
    },
    materials,
    chunks,
    embeddings,
    objectives,
    minSimilarity,
  });
  const request = {
    studentId: athenaDemoIds.students.lucia,
    courseId: athenaDemoIds.course,
    topicId: athenaDemoIds.topics.geometry,
    conceptId: demoLearningIds.concepts.triangleArea,
    query: "¿Cómo calculo el área del triángulo?",
    curriculumVersion: 1,
    locale: "es" as const,
    limit: 5,
  };
  return { adapter, request };
}

test("Content-backed Curriculum retrieval resolves the learner's class and never crosses classes", async () => {
  const { adapter, request } = await fixture();
  const result = await adapter.retrieve(request, context);
  assert.equal(result.unsupported, false);
  if (result.unsupported) return;
  assert.deepEqual(
    result.chunks.map((chunk) => chunk.citation.materialId),
    [MATERIAL],
  );
  assert.doesNotMatch(result.chunks[0]!.text, /otra clase/);
});

test("Content-backed Curriculum retrieval enforces version, concept mapping, and evidence", async () => {
  const { adapter, request } = await fixture(0.95);
  const denied = await adapter.retrieve(request, { ...context, studentIds: [] });
  assert.equal(denied.unsupported && denied.unsupportedReason, "no_approved_content");

  const stale = await adapter.retrieve({ ...request, curriculumVersion: 2 }, context);
  assert.equal(stale.unsupported && stale.unsupportedReason, "curriculum_version_mismatch");

  const unknown = await adapter.retrieve(
    { ...request, conceptId: demoLearningIds.concepts.rectangleArea },
    context,
  );
  assert.equal(unknown.unsupported && unknown.unsupportedReason, "concept_not_found");

  const weak = await adapter.retrieve({ ...request, query: "astronomy galaxies" }, context);
  assert.equal(weak.unsupported && weak.unsupportedReason, "insufficient_evidence");
});
