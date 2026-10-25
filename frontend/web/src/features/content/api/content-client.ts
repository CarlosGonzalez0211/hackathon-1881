import {
  contentChatResponseSchema,
  contentDownloadResponseSchema,
  contentFlagSchema,
  contentMaterialSchema,
  contentMilestoneSchema,
  contentObjectiveSchema,
  contentPreferencesSchema,
  contentStudentMaterialSchema,
  contentTopicSchema,
  createContentMaterialResponseSchema,
  type ContentChatRequest,
  type CreateContentMaterialRequest,
  type UpdateContentMaterialRequest,
  type UpsertContentMilestoneRequest,
  type UpsertContentObjectiveRequest,
} from "@athena/shared";
import { apiFetch, authHeaders } from "@/lib/api";
import { useMocks } from "@/lib/mode";
import { MockContentClient } from "./mock-content-client";
import { ContentApiError, type ContentClient } from "./types";

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });

/** Sends a request and maps non-2xx answers to ContentApiError with the server's message. */
async function call(path: string, init: RequestInit = {}): Promise<unknown> {
  const res = await apiFetch(`/content${path}`, init);
  if (res.status === 204) return undefined;
  const body: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const { error, retryAfterSeconds } = (body ?? {}) as {
      error?: string;
      retryAfterSeconds?: number;
    };
    throw new ContentApiError(res.status, error ?? `HTTP ${res.status}`, retryAfterSeconds);
  }
  return body;
}

/** The content routes of the api (`/api/content/*`). */
export class ApiContentClient implements ContentClient {
  async getPreferences() {
    return contentPreferencesSchema.parse(await call("/me/preferences"));
  }

  async listTopics(classId: string) {
    return contentTopicSchema.array().parse(await call(`/classes/${classId}/topics`));
  }

  async listMaterials(classId: string) {
    const body = await call(`/classes/${classId}/materials`);
    const professor = contentMaterialSchema.array().safeParse(body);
    return professor.success ? professor.data : contentStudentMaterialSchema.array().parse(body);
  }

  async createMaterial(classId: string, body: CreateContentMaterialRequest) {
    return createContentMaterialResponseSchema.parse(
      await call(`/classes/${classId}/materials`, { method: "POST", ...json(body) }),
    );
  }

  /** Signed Supabase URL in real mode; the api's dev upload route (which needs auth) in mock storage. */
  async uploadFile(uploadUrl: string, file: Blob) {
    const devRoute = uploadUrl.includes("/api/content/dev-uploads/");
    const res = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: devRoute
        ? { ...(await authHeaders()), "Content-Type": "application/octet-stream" }
        : { "Content-Type": file.type || "application/octet-stream" },
    });
    if (!res.ok) throw new ContentApiError(res.status, `Upload failed (${res.status})`);
  }

  async completeUpload(materialId: string) {
    return contentMaterialSchema.parse(
      await call(`/materials/${materialId}/complete`, { method: "POST" }),
    );
  }

  async processMaterial(materialId: string) {
    return contentMaterialSchema.parse(
      await call(`/materials/${materialId}/process`, { method: "POST" }),
    );
  }

  async updateMaterial(materialId: string, body: UpdateContentMaterialRequest) {
    return contentMaterialSchema.parse(
      await call(`/materials/${materialId}`, { method: "PATCH", ...json(body) }),
    );
  }

  async deleteMaterial(materialId: string) {
    await call(`/materials/${materialId}`, { method: "DELETE" });
  }

  async downloadUrl(materialId: string) {
    return contentDownloadResponseSchema.parse(await call(`/materials/${materialId}/download`));
  }

  async listObjectives(classId: string) {
    return contentObjectiveSchema.array().parse(await call(`/classes/${classId}/objectives`));
  }

  async upsertObjective(classId: string, id: string, body: UpsertContentObjectiveRequest) {
    return contentObjectiveSchema.parse(
      await call(`/classes/${classId}/objectives/${id}`, { method: "PUT", ...json(body) }),
    );
  }

  async deleteObjective(classId: string, id: string) {
    await call(`/classes/${classId}/objectives/${id}`, { method: "DELETE" });
  }

  async listMilestones(classId: string) {
    return contentMilestoneSchema.array().parse(await call(`/classes/${classId}/milestones`));
  }

  async upsertMilestone(classId: string, id: string, body: UpsertContentMilestoneRequest) {
    return contentMilestoneSchema.parse(
      await call(`/classes/${classId}/milestones/${id}`, { method: "PUT", ...json(body) }),
    );
  }

  async deleteMilestone(classId: string, id: string) {
    await call(`/classes/${classId}/milestones/${id}`, { method: "DELETE" });
  }

  async listFlags(classId: string) {
    return contentFlagSchema.array().parse(await call(`/classes/${classId}/flags`));
  }

  async reviewFlag(flagId: string) {
    return contentFlagSchema.parse(await call(`/flags/${flagId}/review`, { method: "POST" }));
  }

  async chat(classId: string, body: ContentChatRequest) {
    return contentChatResponseSchema.parse(
      await call(`/classes/${classId}/chat`, { method: "POST", ...json(body) }),
    );
  }
}

let client: ContentClient | undefined;

/** One instance per page session, so mock state survives switching tabs. */
export const getContentClient = (): ContentClient =>
  (client ??= useMocks ? new MockContentClient() : new ApiContentClient());
