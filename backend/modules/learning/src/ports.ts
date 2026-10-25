import type { Citation, TeachingStrategy } from "@athena/shared";

/** Curriculum-owned boundary. The production adapter will point at Vianey's retrieval service. */
export interface CurriculumContextPort {
  retrieve(input: {
    courseId: string;
    topicId: string;
    conceptId: string;
    query: string;
    curriculumVersion: number;
  }): Promise<{
    chunks: { text: string; citation: Citation }[];
    curriculumVersion: number;
    unsupported: boolean;
  }>;
}

/** Provider boundary; model output is never allowed to update mastery directly. */
export interface TutorProvider {
  respond(input: {
    objective: string;
    strategy: TeachingStrategy;
    evidence: { text: string; citation: Citation }[];
  }): Promise<{
    content: string;
    citations: Citation[];
    unsupported: boolean;
  }>;
}
