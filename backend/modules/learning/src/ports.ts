import type {
  Citation,
  CurriculumContextRequest,
  CurriculumContextResponse,
  TeachingStrategy,
} from "@athena/shared";

/** Curriculum-owned boundary. The production adapter will point at Vianey's retrieval service. */
export interface CurriculumContextPort {
  retrieve(input: CurriculumContextRequest): Promise<CurriculumContextResponse>;
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
