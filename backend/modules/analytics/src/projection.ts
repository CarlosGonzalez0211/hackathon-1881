import {
  aiUsageRecordedPayloadSchema,
  classAnalyticsSchema,
  emptyAiUsage,
  masteryUpdatedPayloadSchema,
  type AiUsageCounts,
  type ClassAnalytics,
  type DomainEvent,
  type Intervention,
} from "@athena/shared";

/** Names and structure the event log does not carry. Comes from curriculum and platform data. */
export interface ClassRoster {
  classId: string;
  courseId: string;
  students: { id: string; displayName: string }[];
  topics: { id: string; title: string }[];
}

export const MASTERED_AT = 0.8;
export const STRUGGLING_BELOW = 0.5;
export const HIGH_SEVERITY_BELOW = 0.3;

const round = (value: number) => Math.round(value * 1000) / 1000;
const mean = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

interface TopicState {
  first: number;
  latest: number;
  misconceptions: Map<string, string>;
}

/**
 * Pure fold of domain events into the class read model. Events are sorted by time and
 * deduplicated by id, so replaying the same log always yields the same result.
 * AI usage is counted beside mastery and never changes it.
 */
export function projectClassAnalytics(roster: ClassRoster, events: DomainEvent[]): ClassAnalytics {
  const studentIds = new Set(roster.students.map((student) => student.id));
  const topicIds = new Set(roster.topics.map((topic) => topic.id));
  const mastery = new Map<string, Map<string, TopicState>>();
  const usage = new Map<string, AiUsageCounts>();
  const seen = new Set<string>();

  const ordered = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  for (const event of ordered) {
    if (seen.has(event.id)) continue;
    seen.add(event.id);
    if (event.classId !== roster.classId || !event.studentId || !studentIds.has(event.studentId)) {
      continue;
    }
    if (event.type === "MasteryUpdated") {
      const parsed = masteryUpdatedPayloadSchema.safeParse(event.payload);
      if (!parsed.success || !topicIds.has(parsed.data.topicId)) continue;
      const topics = mastery.get(event.studentId) ?? new Map<string, TopicState>();
      const state = topics.get(parsed.data.topicId) ?? {
        first: parsed.data.previous,
        latest: parsed.data.next,
        misconceptions: new Map<string, string>(),
      };
      state.latest = parsed.data.next;
      state.misconceptions = new Map(
        parsed.data.misconceptions.map((item) => [item.code, item.label]),
      );
      topics.set(parsed.data.topicId, state);
      mastery.set(event.studentId, topics);
    } else if (event.type === "AiUsageRecorded") {
      const parsed = aiUsageRecordedPayloadSchema.safeParse(event.payload);
      if (!parsed.success) continue;
      const counts = usage.get(event.studentId) ?? emptyAiUsage();
      counts[parsed.data.kind] += 1;
      usage.set(event.studentId, counts);
    }
  }

  const interventions: Intervention[] = [];
  for (const student of roster.students) {
    for (const topic of roster.topics) {
      const state = mastery.get(student.id)?.get(topic.id);
      if (!state || state.latest >= STRUGGLING_BELOW) continue;
      interventions.push({
        id: `${student.id}:${topic.id}`,
        studentId: student.id,
        topicId: topic.id,
        severity: state.latest < HIGH_SEVERITY_BELOW ? "high" : "medium",
        reason: `${student.displayName} is at ${Math.round(state.latest * 100)}% mastery in ${topic.title}.`,
        recommendedAction: `Review ${topic.title} with ${student.displayName} before the next checkpoint.`,
        status: "open",
      });
    }
  }

  const classUsage = emptyAiUsage();
  for (const counts of usage.values()) {
    for (const key of Object.keys(classUsage) as (keyof AiUsageCounts)[]) {
      classUsage[key] += counts[key];
    }
  }

  return classAnalyticsSchema.parse({
    classId: roster.classId,
    courseId: roster.courseId,
    topics: roster.topics.map((topic) => {
      const states = roster.students.flatMap((student) => {
        const state = mastery.get(student.id)?.get(topic.id);
        return state ? [state] : [];
      });
      const misconceptions = new Map<string, { label: string; studentCount: number }>();
      for (const state of states) {
        for (const [code, label] of state.misconceptions) {
          const entry = misconceptions.get(code) ?? { label, studentCount: 0 };
          entry.studentCount += 1;
          misconceptions.set(code, entry);
        }
      }
      return {
        topicId: topic.id,
        title: topic.title,
        averageMastery: round(mean(states.map((state) => state.latest))),
        masteredStudents: states.filter((state) => state.latest >= MASTERED_AT).length,
        strugglingStudents: states.filter((state) => state.latest < STRUGGLING_BELOW).length,
        commonMisconceptions: [...misconceptions]
          .map(([code, entry]) => ({ code, ...entry }))
          .sort((a, b) => b.studentCount - a.studentCount || a.code.localeCompare(b.code)),
      };
    }),
    aiUsage: classUsage,
    interventions,
    students: roster.students.map((student) => {
      const topics = [...(mastery.get(student.id)?.values() ?? [])];
      return {
        studentId: student.id,
        displayName: student.displayName,
        growth: round(Math.min(1, Math.max(0, mean(topics.map((s) => s.latest - s.first))))),
        averageMastery: round(mean(topics.map((state) => state.latest))),
        openInterventions: interventions.filter((item) => item.studentId === student.id).length,
        aiUsage: usage.get(student.id) ?? emptyAiUsage(),
      };
    }),
  });
}
