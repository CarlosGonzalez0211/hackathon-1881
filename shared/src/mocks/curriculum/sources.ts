import type { Course, Material, SourceChunk, Topic } from "../../curriculum.js";

export const CURRICULUM_DEMO_NOW = "2026-10-24T00:00:00.000Z";
export const DEMO_PROVENANCE =
  "Authored Athena teaching fixture attributed to a fictional demo instructor. Not a real upload or primary historical source. The storage key is illustrative; text lives in source chunks.";

export function demoCourse(
  id: string,
  ownerId: string,
  title: string,
  description: string,
  locale: "en" | "es",
): Course {
  return {
    id,
    ownerId,
    title,
    description,
    locale,
    activeVersion: 1,
    createdAt: CURRICULUM_DEMO_NOW,
    updatedAt: CURRICULUM_DEMO_NOW,
  };
}
export function demoTopics(course: Course, rows: Array<[string, string, string[]]>): Topic[] {
  return rows.map(([id, title, prerequisiteTopicIds], order) => ({
    id,
    courseId: course.id,
    curriculumVersion: 1,
    title,
    description: `Instructor-owned demo topic: ${title}`,
    order,
    prerequisiteTopicIds,
    masteryThreshold: 0.8,
  }));
}
export function demoSource(
  course: Course,
  topic: Topic,
  kind: "notes" | "slides" | "reading" | "timeline",
  sections: Array<{ section: string; text: string; locale?: "en" | "es" }>,
  references: Material["provenance"]["references"] = [],
): { material: Material; chunks: SourceChunk[] } {
  const materialId = `material-${topic.id}-${kind}`;
  return {
    material: {
      id: materialId,
      courseId: course.id,
      topicIds: [topic.id],
      title: `[DEMO] ${topic.title} — ${kind}`,
      filename: `${topic.id}-${kind}.txt`,
      mimeType: "text/plain",
      storagePath: `demo/${course.id}/${topic.id}-${kind}.txt`,
      status: "ready",
      curriculumVersion: 1,
      uploadedBy: course.ownerId,
      uploadedAt: CURRICULUM_DEMO_NOW,
      provenance: { kind: "authored_demo", description: DEMO_PROVENANCE, references },
    },
    chunks: sections.map((item, index) => ({
      id: `${materialId}-chunk-${index}`,
      materialId,
      courseId: course.id,
      topicId: topic.id,
      curriculumVersion: 1,
      index,
      locale: item.locale ?? course.locale,
      section: item.section,
      text: item.text,
    })),
  };
}
