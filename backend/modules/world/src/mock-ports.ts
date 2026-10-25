import {
  athenaDemoCourse,
  demoClassMastery,
  demoRoster,
  demoWorldTopics,
  type CurriculumTopicSummary,
  type StudentMasterySnapshot,
  type TopicMastery,
} from "@athena/shared";
import type {
  CurriculumTopicPort,
  Enrollment,
  EnrollmentPort,
  MasteryReadPort,
  WorldPorts,
} from "./ports.js";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** Stands in for P1 until the curriculum routes exist. Mutable so tests can publish topics. */
export class MockCurriculumTopicPort implements CurriculumTopicPort {
  readonly topics: CurriculumTopicSummary[];

  constructor(topics: CurriculumTopicSummary[] = demoWorldTopics) {
    this.topics = clone(topics);
  }

  async listTopics(courseId: string) {
    return clone(this.topics.filter((topic) => topic.courseId === courseId));
  }

  upsert(topic: CurriculumTopicSummary) {
    const index = this.topics.findIndex((item) => item.id === topic.id);
    if (index >= 0) this.topics[index] = clone(topic);
    else this.topics.push(clone(topic));
  }
}

/** Stands in for P2. Mutable: the demo driver and tests play Learning's role. */
export class MockMasteryPort implements MasteryReadPort {
  private readonly snapshots = new Map<string, StudentMasterySnapshot>();

  constructor(snapshots: StudentMasterySnapshot[] = demoClassMastery) {
    for (const snapshot of snapshots) this.snapshots.set(snapshot.studentId, clone(snapshot));
  }

  async getStudentMastery(studentId: string, topicIds: string[]) {
    const snapshot = this.snapshots.get(studentId) ?? { studentId, topics: [] };
    return clone({
      ...snapshot,
      topics: snapshot.topics.filter((item) => topicIds.includes(item.topicId)),
    });
  }

  /** Learning-side write used only by mocks. Mastery never decreases (proposal 4.4). */
  set(studentId: string, mastery: TopicMastery[], growth?: number) {
    const snapshot = this.snapshots.get(studentId) ?? { studentId, topics: [] };
    for (const next of mastery) {
      const index = snapshot.topics.findIndex((item) => item.topicId === next.topicId);
      const previous = index >= 0 ? snapshot.topics[index]!.mastery : 0;
      const value = { ...next, mastery: Math.max(previous, next.mastery) };
      if (index >= 0) snapshot.topics[index] = value;
      else snapshot.topics.push(value);
    }
    if (growth !== undefined) snapshot.growth = Math.max(snapshot.growth ?? 0, growth);
    this.snapshots.set(studentId, snapshot);
  }
}

/** Stands in for P4: the demo roster, all enrolled in the demo course. */
export class MockEnrollmentPort implements EnrollmentPort {
  constructor(
    private readonly classes: { classId: string; courseId: string; studentIds: string[] }[] = [
      {
        classId: demoRoster.classId,
        courseId: athenaDemoCourse.id,
        studentIds: demoRoster.students.map((student) => student.id),
      },
    ],
  ) {}

  async getEnrollment(studentId: string): Promise<Enrollment | null> {
    const found = this.classes.find((item) => item.studentIds.includes(studentId));
    return found ? { studentId, classId: found.classId, courseId: found.courseId } : null;
  }

  async listStudents(classId: string) {
    return this.classes.find((item) => item.classId === classId)?.studentIds.slice() ?? null;
  }
}

export interface MockWorldPorts extends WorldPorts {
  curriculum: MockCurriculumTopicPort;
  mastery: MockMasteryPort;
  enrollment: MockEnrollmentPort;
}

export function createMockWorldPorts(): MockWorldPorts {
  return {
    curriculum: new MockCurriculumTopicPort(),
    mastery: new MockMasteryPort(),
    enrollment: new MockEnrollmentPort(),
  };
}
