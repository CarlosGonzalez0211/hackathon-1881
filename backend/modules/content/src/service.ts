import {
  contentMaterialSchema,
  contentStudentMaterialSchema,
  type AuthContext,
  type ContentDownloadResponse,
  type ContentMaterial,
  type ContentMilestone,
  type ContentObjective,
  type ContentStudentMaterial,
  type CreateContentMaterialRequest,
  type CreateContentMaterialResponse,
  type UpdateContentMaterialRequest,
  type UpsertContentMilestoneRequest,
  type UpsertContentObjectiveRequest,
} from "@athena/shared";
import {
  forbidden,
  notFound,
  PlatformError,
  type AuthorizationService,
  type ClassCatalog,
  type Clock,
  type DomainEventStore,
  type IdGenerator,
} from "@athena/platform";
import { sha256Hex, sniffMatches } from "./extraction.js";
import type { MaterialIngestionService } from "./ingestion.js";
import type {
  ChunkRepository,
  CurriculumCatalogPort,
  MaterialRecord,
  MaterialRepository,
  MaterialStorage,
  MilestoneRecord,
  ObjectiveRecord,
  VersionedRepository,
} from "./ports.js";

/** 409 for stale edits and duplicate codes; PlatformError covers 400-404 only. */
export class ContentConflictError extends Error {
  readonly statusCode = 409;
  constructor(message: string) {
    super(message);
    this.name = "ContentConflictError";
  }
}

const badRequest = (message: string) => new PlatformError(message, 400);
const DOWNLOAD_SECONDS = 60;

export interface ContentServiceDeps {
  authorization: AuthorizationService;
  classes: ClassCatalog;
  catalog: CurriculumCatalogPort;
  materials: MaterialRepository;
  chunks: ChunkRepository;
  storage: MaterialStorage;
  ingestion: MaterialIngestionService;
  objectives: VersionedRepository<ObjectiveRecord>;
  milestones: VersionedRepository<MilestoneRecord>;
  events: DomainEventStore;
  clock: Clock;
  ids: IdGenerator;
}

/**
 * Class material, objectives and milestones. Only the class professor (or an admin) writes;
 * class members read. Class routes check authorization before existence, like analytics.
 * Material-id routes answer 404 both for unknown ids and for classes the caller is not in,
 * so ids from other classes do not leak.
 */
export class ContentService {
  constructor(private readonly deps: ContentServiceDeps) {}

  async createMaterial(
    context: AuthContext,
    classId: string,
    body: CreateContentMaterialRequest,
  ): Promise<CreateContentMaterialResponse> {
    this.assertManage(context, classId);
    const courseId = await this.courseOf(context, classId);
    await this.assertTopics(courseId, body.topicIds);
    const now = this.now();
    const { record, created } = await this.deps.materials.insertOrGet({
      id: this.deps.ids.next(),
      classId,
      courseId,
      title: body.title,
      filename: body.filename,
      mimeType: body.mimeType,
      byteSize: body.byteSize,
      sha256: body.sha256,
      locale: body.locale,
      topicIds: [...new Set(body.topicIds)],
      status: "uploaded",
      attempts: 0,
      curriculumVersion: await this.deps.catalog.activeVersion(courseId),
      uploadedBy: context.userId,
      storagePath: `${classId}/${body.sha256}`,
      chunksTotal: 0,
      chunksEmbedded: 0,
      createdAt: now,
      updatedAt: now,
    });
    if (created) {
      return {
        duplicate: false,
        material: this.professorView(record),
        uploadUrl: await this.deps.storage.createUploadUrl(record.storagePath),
      };
    }
    const merged = await this.deps.materials.addTopics(record.id, body.topicIds);
    // The earlier upload never completed: hand out a fresh URL instead of a dead end.
    if (!merged.verifiedAt) {
      return {
        duplicate: false,
        material: this.professorView(merged),
        uploadUrl: await this.deps.storage.createUploadUrl(merged.storagePath),
      };
    }
    return { duplicate: true, material: this.professorView(merged) };
  }

  /** The server re-hashes and sniffs the stored object before anything trusts it. */
  async completeUpload(context: AuthContext, materialId: string): Promise<ContentMaterial> {
    const record = await this.loadForManage(context, materialId);
    if (record.verifiedAt) return this.professorView(record);
    const bytes = await this.deps.storage.read(record.storagePath);
    if (!bytes) throw badRequest("The file has not been uploaded yet");
    if (bytes.length !== record.byteSize || sha256Hex(bytes) !== record.sha256) {
      await this.deps.storage.remove(record.storagePath);
      throw badRequest("The uploaded file does not match its declared size or hash");
    }
    if (!sniffMatches(bytes, record.mimeType)) {
      const failed = await this.deps.materials.update(record.id, {
        status: "failed",
        errorCode: "unsupported_type",
        errorMessage: `The file content is not ${record.mimeType}`,
        updatedAt: this.now(),
      });
      return this.professorView(failed);
    }
    const verified = await this.deps.materials.update(record.id, {
      verifiedAt: this.now(),
      updatedAt: this.now(),
    });
    await this.deps.events.append({
      id: this.deps.ids.next(),
      type: "MaterialUploaded",
      aggregateType: "content_material",
      aggregateId: verified.id,
      actorId: context.userId,
      classId: verified.classId,
      courseId: verified.courseId,
      occurredAt: this.now(),
      payload: { materialId: verified.id, topicIds: verified.topicIds },
    });
    return this.professorView(verified);
  }

  async processMaterial(context: AuthContext, materialId: string): Promise<ContentMaterial> {
    const record = await this.loadForManage(context, materialId);
    if (!record.verifiedAt && record.status === "uploaded") {
      throw badRequest("Complete the upload before processing");
    }
    const after = await this.deps.ingestion.process(record.id);
    return this.professorView(after ?? record);
  }

  async listMaterials(
    context: AuthContext,
    classId: string,
  ): Promise<ContentMaterial[] | ContentStudentMaterial[]> {
    if (this.deps.authorization.canManageClass(context, classId)) {
      return (await this.deps.materials.listByClass(classId)).map((r) => this.professorView(r));
    }
    this.assertAccess(context, classId);
    return (await this.deps.materials.listByClass(classId))
      .filter((record) => record.activeGeneration !== undefined)
      .map((record) => this.studentView(record));
  }

  async getMaterial(
    context: AuthContext,
    materialId: string,
  ): Promise<ContentMaterial | ContentStudentMaterial> {
    const record = await this.loadVisible(context, materialId);
    if (this.deps.authorization.canManageClass(context, record.classId)) {
      return this.professorView(record);
    }
    if (record.activeGeneration === undefined) throw notFound("Material", materialId);
    return this.studentView(record);
  }

  async updateMaterial(
    context: AuthContext,
    materialId: string,
    body: UpdateContentMaterialRequest,
  ): Promise<ContentMaterial> {
    const record = await this.loadForManage(context, materialId);
    if (body.topicIds) await this.assertTopics(record.courseId, body.topicIds);
    const updated = await this.deps.materials.update(record.id, {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.topicIds && { topicIds: [...new Set(body.topicIds)] }),
      updatedAt: this.now(),
    });
    return this.professorView(updated);
  }

  /** Row first (chunks go with it), stored file last; an orphaned file is harmless. */
  async deleteMaterial(context: AuthContext, materialId: string): Promise<void> {
    const record = await this.loadForManage(context, materialId);
    await this.deps.chunks.deleteForMaterial(record.id);
    await this.deps.materials.delete(record.id);
    await this.deps.storage.remove(record.storagePath).catch(() => undefined);
  }

  async downloadUrl(context: AuthContext, materialId: string): Promise<ContentDownloadResponse> {
    const record = await this.loadForManage(context, materialId);
    return {
      url: await this.deps.storage.createDownloadUrl(record.storagePath, DOWNLOAD_SECONDS),
      expiresAt: new Date(this.deps.clock.now().getTime() + DOWNLOAD_SECONDS * 1000).toISOString(),
    };
  }

  async listObjectives(context: AuthContext, classId: string): Promise<ContentObjective[]> {
    this.assertAccess(context, classId);
    return (await this.deps.objectives.list(classId))
      .sort((a, b) => a.topicId.localeCompare(b.topicId) || a.position - b.position)
      .map(({ deletedAt: _deleted, ...objective }) => objective);
  }

  async upsertObjective(
    context: AuthContext,
    classId: string,
    objectiveId: string,
    body: UpsertContentObjectiveRequest,
  ): Promise<ContentObjective> {
    this.assertManage(context, classId);
    const courseId = await this.courseOf(context, classId);
    await this.assertTopics(courseId, [body.topicId]);
    await this.assertOwnRecord(this.deps.objectives, classId, objectiveId, "Objective");
    if (body.materialId) {
      const material = await this.deps.materials.get(body.materialId);
      if (material?.classId !== classId) throw badRequest("Unknown material for this class");
    }
    const live = await this.deps.objectives.list(classId);
    if (
      live.some((o) => o.id !== objectiveId && o.topicId === body.topicId && o.code === body.code)
    ) {
      throw new ContentConflictError(`Objective code already used in this topic: ${body.code}`);
    }
    const { expectedUpdatedAt, ...fields } = body;
    const saved = await this.deps.objectives.upsert(
      { ...fields, id: objectiveId, classId, updatedAt: this.now() },
      expectedUpdatedAt,
    );
    if (saved === "conflict") throw new ContentConflictError("The objective changed; reload it");
    return saved;
  }

  async deleteObjective(context: AuthContext, classId: string, objectiveId: string) {
    this.assertManage(context, classId);
    if (!(await this.assertOwnRecord(this.deps.objectives, classId, objectiveId, "Objective"))) {
      throw notFound("Objective", objectiveId);
    }
    await this.deps.objectives.softDelete(objectiveId, this.now());
  }

  async listMilestones(context: AuthContext, classId: string): Promise<ContentMilestone[]> {
    this.assertAccess(context, classId);
    const live = new Set((await this.deps.objectives.list(classId)).map((o) => o.id));
    return (await this.deps.milestones.list(classId))
      .sort((a, b) => a.position - b.position)
      .map(({ deletedAt: _deleted, ...milestone }) => ({
        ...milestone,
        // Soft-deleted objectives drop out of milestones without rewriting them.
        objectiveIds: milestone.objectiveIds.filter((id) => live.has(id)),
      }));
  }

  async upsertMilestone(
    context: AuthContext,
    classId: string,
    milestoneId: string,
    body: UpsertContentMilestoneRequest,
  ): Promise<ContentMilestone> {
    this.assertManage(context, classId);
    const courseId = await this.courseOf(context, classId);
    if (body.topicId) await this.assertTopics(courseId, [body.topicId]);
    await this.assertOwnRecord(this.deps.milestones, classId, milestoneId, "Milestone");
    const live = new Set((await this.deps.objectives.list(classId)).map((o) => o.id));
    if (body.objectiveIds.some((id) => !live.has(id))) {
      throw badRequest("Unknown objective for this class");
    }
    const { expectedUpdatedAt, ...fields } = body;
    const saved = await this.deps.milestones.upsert(
      {
        ...fields,
        objectiveIds: [...new Set(body.objectiveIds)],
        id: milestoneId,
        classId,
        updatedAt: this.now(),
      },
      expectedUpdatedAt,
    );
    if (saved === "conflict") throw new ContentConflictError("The milestone changed; reload it");
    return saved;
  }

  async deleteMilestone(context: AuthContext, classId: string, milestoneId: string) {
    this.assertManage(context, classId);
    if (!(await this.assertOwnRecord(this.deps.milestones, classId, milestoneId, "Milestone"))) {
      throw notFound("Milestone", milestoneId);
    }
    await this.deps.milestones.softDelete(milestoneId, this.now());
  }

  professorView(record: MaterialRecord): ContentMaterial {
    // Parsing strips server-only fields (storage path, generations, lease) from the output.
    return contentMaterialSchema.parse({
      ...record,
      searchable: record.activeGeneration !== undefined,
      progress: { embedded: record.chunksEmbedded, total: record.chunksTotal },
    });
  }

  private studentView(record: MaterialRecord): ContentStudentMaterial {
    return contentStudentMaterialSchema.parse(this.professorView(record));
  }

  private assertManage(context: AuthContext, classId: string) {
    if (!this.deps.authorization.canManageClass(context, classId)) {
      throw forbidden("Only the class professor can manage class material");
    }
  }

  private assertAccess(context: AuthContext, classId: string) {
    if (!this.deps.authorization.canAccessClass(context, classId)) {
      throw forbidden("Not a member of this class");
    }
  }

  private async loadVisible(context: AuthContext, materialId: string) {
    const record = await this.deps.materials.get(materialId);
    if (!record || !this.deps.authorization.canAccessClass(context, record.classId)) {
      throw notFound("Material", materialId);
    }
    return record;
  }

  private async loadForManage(context: AuthContext, materialId: string) {
    const record = await this.loadVisible(context, materialId);
    this.assertManage(context, record.classId);
    return record;
  }

  private async courseOf(context: AuthContext, classId: string) {
    const found = (await this.deps.classes.listFor(context)).find((item) => item.id === classId);
    if (!found) throw notFound("Class", classId);
    return found.courseId;
  }

  private async assertTopics(courseId: string, topicIds: string[]) {
    if (topicIds.length === 0) return;
    const known = new Set((await this.deps.catalog.listTopics(courseId)).map((t) => t.id));
    const unknown = topicIds.filter((id) => !known.has(id));
    if (unknown.length > 0)
      throw badRequest(`Unknown topic for this course: ${unknown.join(", ")}`);
  }

  /** Returns whether the id exists in this class; an id owned by another class is a 404. */
  private async assertOwnRecord<T extends { classId: string }>(
    repository: { get(id: string): Promise<T | null> },
    classId: string,
    id: string,
    what: string,
  ) {
    const existing = await repository.get(id);
    if (existing && existing.classId !== classId) throw notFound(what, id);
    return existing !== null;
  }

  private now() {
    return this.deps.clock.now().toISOString();
  }
}
