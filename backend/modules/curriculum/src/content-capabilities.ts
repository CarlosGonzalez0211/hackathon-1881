import { learningFormatSchema } from "@athena/shared";
import type { UnsupportedContextReason } from "./learning-context-adapter.js";

export type LearningFormat = ReturnType<typeof learningFormatSchema.parse>;
export type ContentRepresentation =
  | "text_excerpt"
  | "outline"
  | "slide_outline"
  | "presentation_file"
  | "script"
  | "lyrics"
  | "playable_audio"
  | "playable_video";

/** Format vocabulary describes possible outputs, not current availability. */
export const learningFormatDefinitions: readonly {
  format: LearningFormat;
  representations: readonly ContentRepresentation[];
}[] = Object.freeze(
  [
    { format: "text", representations: ["text_excerpt"] },
    { format: "worked_example", representations: ["text_excerpt"] },
    { format: "visual_summary", representations: ["outline"] },
    { format: "slides", representations: ["slide_outline", "presentation_file"] },
    { format: "audio", representations: ["script", "playable_audio"] },
    { format: "podcast", representations: ["script", "playable_audio"] },
    { format: "music", representations: ["lyrics", "playable_audio"] },
    { format: "video", representations: ["script", "playable_video"] },
    { format: "reel", representations: ["script", "playable_video"] },
  ].map((definition) =>
    Object.freeze({
      format: learningFormatSchema.parse(definition.format),
      representations: Object.freeze(definition.representations as ContentRepresentation[]),
    }),
  ),
);

export interface CurriculumCapabilityRequest {
  courseId: string;
  topicId: string;
  conceptId: string;
  curriculumVersion: number;
  locale: "en" | "es";
}
export type CapabilityUnavailableReason = UnsupportedContextReason | "not_authored";
export interface LearningFormatCapability {
  format: LearningFormat;
  available: boolean;
  availableRepresentations: ContentRepresentation[];
  sourceChunkIds: string[];
  /** Generation and media rendering are not implemented by the TXT mock system. */
  generationAvailable: false;
  playableMediaAvailable: false;
  unavailableReason?: CapabilityUnavailableReason;
}
export interface CurriculumCapabilityResponse {
  contractVersion: 1;
  courseId: string;
  topicId: string;
  conceptId: string;
  curriculumVersion: number;
  locale: "en" | "es";
  formats: LearningFormatCapability[];
}
/** One argument; composition binds trusted server access, as with retrieval. */
export interface CurriculumCapabilityPort {
  getCapabilities(input: CurriculumCapabilityRequest): Promise<CurriculumCapabilityResponse>;
}

/** Topic-level resource discovery; no concept identifier is invented for History. */
export type CurriculumTopicCapabilityRequest = Omit<CurriculumCapabilityRequest, "conceptId">;
export interface TopicLearningFormatCapability extends LearningFormatCapability {
  /** Existing authored resource IDs. Empty for source-text excerpts. */
  resourceIds: string[];
}
export interface CurriculumTopicCapabilityResponse {
  contractVersion: 1;
  courseId: string;
  topicId: string;
  curriculumVersion: number;
  locale: "en" | "es";
  formats: TopicLearningFormatCapability[];
}
export interface CurriculumTopicCapabilityPort {
  getTopicCapabilities(
    input: CurriculumTopicCapabilityRequest,
  ): Promise<CurriculumTopicCapabilityResponse>;
}
