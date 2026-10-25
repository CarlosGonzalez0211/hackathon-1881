import type {
  ContentChatRequest,
  ContentChatResponse,
  ContentDownloadResponse,
  ContentFlag,
  ContentMaterial,
  ContentMilestone,
  ContentObjective,
  ContentPreferences,
  ContentStudentMaterial,
  ContentTopic,
  CreateContentMaterialRequest,
  CreateContentMaterialResponse,
  UpdateContentMaterialRequest,
  UpsertContentMilestoneRequest,
  UpsertContentObjectiveRequest,
} from "@athena/shared";

/** Failed request with its HTTP status, so screens can tell a conflict from a refusal. */
export class ContentApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "ContentApiError";
  }
}

export type { ContentTopic } from "@athena/shared";

/** Everything the content screens need. Mock and Api implementations share it. */
export interface ContentClient {
  getPreferences(): Promise<ContentPreferences>;
  listTopics(classId: string): Promise<ContentTopic[]>;
  /** Professors get every material with status; students only searchable ones. */
  listMaterials(classId: string): Promise<ContentMaterial[] | ContentStudentMaterial[]>;
  createMaterial(
    classId: string,
    body: CreateContentMaterialRequest,
  ): Promise<CreateContentMaterialResponse>;
  uploadFile(uploadUrl: string, file: Blob): Promise<void>;
  completeUpload(materialId: string): Promise<ContentMaterial>;
  processMaterial(materialId: string): Promise<ContentMaterial>;
  updateMaterial(materialId: string, body: UpdateContentMaterialRequest): Promise<ContentMaterial>;
  deleteMaterial(materialId: string): Promise<void>;
  downloadUrl(materialId: string): Promise<ContentDownloadResponse>;
  listObjectives(classId: string): Promise<ContentObjective[]>;
  upsertObjective(
    classId: string,
    id: string,
    body: UpsertContentObjectiveRequest,
  ): Promise<ContentObjective>;
  deleteObjective(classId: string, id: string): Promise<void>;
  listMilestones(classId: string): Promise<ContentMilestone[]>;
  upsertMilestone(
    classId: string,
    id: string,
    body: UpsertContentMilestoneRequest,
  ): Promise<ContentMilestone>;
  deleteMilestone(classId: string, id: string): Promise<void>;
  listFlags(classId: string): Promise<ContentFlag[]>;
  reviewFlag(flagId: string): Promise<ContentFlag>;
  /** Throws ContentApiError(429) with retryAfterSeconds when rate limited. */
  chat(classId: string, body: ContentChatRequest): Promise<ContentChatResponse>;
}
