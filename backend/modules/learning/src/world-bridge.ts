import {
  studentMasterySnapshotSchema,
  worldLearningEventIngestResultSchema,
  worldLearningEventSchema,
  type DomainEvent,
  type StudentMasterySnapshot,
  type WorldLearningEvent,
  type WorldLearningEventIngestResult,
} from "@athena/shared";
import type { DomainEventStore } from "@athena/platform";
import type { AssessmentRepository } from "./assessment.js";
import type { LearningRepository } from "./repository.js";

export interface MasteryReadPort {
  getStudentMastery(studentId: string, topicIds: string[]): Promise<StudentMasterySnapshot>;
}

export class LearningMasteryReadAdapter implements MasteryReadPort {
  constructor(
    private readonly repository: LearningRepository,
    private readonly assessments: AssessmentRepository,
  ) {}

  async getStudentMastery(studentId: string, topicIds: string[]) {
    const all = await this.repository.listMastery(studentId);
    const selected =
      topicIds.length === 0
        ? all
        : topicIds.map(
            (topicId) =>
              all.find((item) => item.topicId === topicId) ?? {
                studentId,
                topicId,
                mastery: 0,
                demonstratedConceptIds: [],
                evidenceIds: [],
                confidence: 0,
              },
          );
    const topics = await Promise.all(
      selected.map(async (item) => {
        const required = await this.assessments.listRequiredConceptIds(item.topicId);
        const nextAction =
          required.length > item.demonstratedConceptIds.length
            ? "Practice the next required concept"
            : "Review this topic for retention";
        return {
          topicId: item.topicId,
          mastery: item.mastery,
          demonstratedConcepts: item.demonstratedConceptIds.length,
          totalConcepts: Math.max(required.length, 1),
          nextAction,
          updatedAt: "updatedAt" in item ? item.updatedAt : undefined,
        };
      }),
    );
    const growth =
      topics.length === 0 ? 0 : topics.reduce((sum, item) => sum + item.mastery, 0) / topics.length;
    return studentMasterySnapshotSchema.parse({ studentId, topics, growth });
  }
}

export interface WorldEventSink {
  publish(event: WorldLearningEvent): Promise<WorldLearningEventIngestResult>;
}

export class InMemoryWorldEventSink implements WorldEventSink {
  private readonly events = new Map<string, WorldLearningEvent>();

  async publish(input: WorldLearningEvent) {
    const event = worldLearningEventSchema.parse(input);
    this.events.set(event.id, event);
    return worldLearningEventIngestResultSchema.parse({
      unlockedAchievements: [],
      transitions: [],
    });
  }

  list() {
    return [...this.events.values()];
  }
}

export class HttpWorldEventSink implements WorldEventSink {
  constructor(
    private readonly apiBaseUrl: string,
    private readonly fetchImplementation: typeof fetch = fetch,
    private readonly maxAttempts = 3,
  ) {}

  async publish(input: WorldLearningEvent) {
    const event = worldLearningEventSchema.parse(input);
    let lastError: unknown;
    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      try {
        const response = await this.fetchImplementation(
          `${this.apiBaseUrl.replace(/\/$/, "")}/api/world/events`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(event),
          },
        );
        if (!response.ok) throw new Error(`World event sink returned ${response.status}`);
        return worldLearningEventIngestResultSchema.parse(await response.json());
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }
}

export function connectLearningEventsToWorld(events: DomainEventStore, sink: WorldEventSink) {
  return events.subscribe(async (event) => {
    const mapped = mapDomainEventToWorld(event);
    if (mapped) await sink.publish(mapped);
  });
}

export function mapDomainEventToWorld(event: DomainEvent): WorldLearningEvent | null {
  if (!event.studentId) return null;
  const topicId = stringValue(event.payload.topicId);
  if (!topicId) return null;
  const evidenceIds = stringArray(event.payload.evidenceIds);
  if (event.type === "MasteryUpdated") {
    return worldLearningEventSchema.parse({
      id: event.id,
      type: "MasteryUpdated",
      studentId: event.studentId,
      topicId,
      mastery: numberValue(event.payload.next),
      previousMastery: optionalNumber(event.payload.previous),
      evidenceIds,
      occurredAt: event.occurredAt,
    });
  }
  if (event.type === "MisconceptionResolved") {
    const misconceptionId = stringValue(event.payload.misconceptionId);
    if (!misconceptionId) return null;
    return worldLearningEventSchema.parse({
      id: event.id,
      type: "MisconceptionResolved",
      studentId: event.studentId,
      topicId,
      misconceptionId,
      evidenceIds,
      occurredAt: event.occurredAt,
    });
  }
  if (event.type === "TeachingStrategySelected") {
    const fromStrategy = stringValue(event.payload.previousStrategy);
    const toStrategy = stringValue(event.payload.selectedStrategy);
    if (!fromStrategy || !toStrategy) return null;
    return worldLearningEventSchema.parse({
      id: event.id,
      type: "StrategyChanged",
      studentId: event.studentId,
      topicId,
      fromStrategy,
      toStrategy,
      evidenceIds,
      occurredAt: event.occurredAt,
    });
  }
  if (event.type === "RetentionCheckPassed") {
    return worldLearningEventSchema.parse({
      id: event.id,
      type: "RetentionCheckPassed",
      studentId: event.studentId,
      topicId,
      conceptId: stringValue(event.payload.conceptId),
      evidenceIds,
      occurredAt: event.occurredAt,
    });
  }
  return null;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function numberValue(value: unknown) {
  if (typeof value !== "number") throw new Error("Learning event is missing a numeric value");
  return value;
}

function optionalNumber(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}
