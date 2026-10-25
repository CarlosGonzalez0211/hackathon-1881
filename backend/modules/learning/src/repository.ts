import {
  demoStrategyPosteriors,
  type CheckpointEvidence,
  type ConceptKnowledgeState,
  type DiagnosticResult,
  type RetentionSchedule,
  type StrategyObservation,
  type StrategyPosterior,
  type StudentTopicMastery,
} from "@athena/shared";

export interface LearningRepository {
  saveDiagnostic(value: DiagnosticResult): Promise<void>;
  listDiagnostics(studentId: string): Promise<DiagnosticResult[]>;
  saveEvidence(value: CheckpointEvidence): Promise<void>;
  listEvidence(studentId: string, topicId: string): Promise<CheckpointEvidence[]>;
  getMastery(studentId: string, topicId: string): Promise<StudentTopicMastery | null>;
  listMastery(studentId: string): Promise<StudentTopicMastery[]>;
  saveMastery(value: StudentTopicMastery): Promise<void>;
  getKnowledge(studentId: string, conceptId: string): Promise<ConceptKnowledgeState | null>;
  saveKnowledge(value: ConceptKnowledgeState): Promise<void>;
  listKnowledge(studentId: string): Promise<ConceptKnowledgeState[]>;
  setActiveMisconceptions(
    studentId: string,
    topicId: string,
    ids: readonly string[],
  ): Promise<void>;
  listActiveMisconceptions(studentId: string, topicId?: string): Promise<string[]>;
  getStrategyPosteriors(studentId: string, contextKey: string): Promise<StrategyPosterior[]>;
  saveStrategyPosterior(studentId: string, value: StrategyPosterior): Promise<void>;
  saveStrategyObservation(value: StrategyObservation): Promise<void>;
  saveRetention(value: RetentionSchedule): Promise<void>;
  listRetention(studentId: string): Promise<RetentionSchedule[]>;
}

export class InMemoryLearningRepository implements LearningRepository {
  private readonly diagnostics: DiagnosticResult[] = [];
  private readonly evidence: CheckpointEvidence[] = [];
  private readonly mastery = new Map<string, StudentTopicMastery>();
  private readonly knowledge = new Map<string, ConceptKnowledgeState>();
  private readonly misconceptions = new Map<string, Set<string>>();
  private readonly posteriors = new Map<string, StrategyPosterior>();
  private readonly observations: StrategyObservation[] = [];
  private readonly retention = new Map<string, RetentionSchedule>();

  async saveDiagnostic(value: DiagnosticResult) {
    this.diagnostics.push(value);
  }

  async listDiagnostics(studentId: string) {
    return this.diagnostics.filter((value) => value.studentId === studentId);
  }

  async saveEvidence(value: CheckpointEvidence) {
    this.evidence.push(value);
  }

  async listEvidence(studentId: string, topicId: string) {
    return this.evidence.filter(
      (value) => value.studentId === studentId && value.topicId === topicId,
    );
  }

  async getMastery(studentId: string, topicId: string) {
    return this.mastery.get(key(studentId, topicId)) ?? null;
  }

  async saveMastery(value: StudentTopicMastery) {
    this.mastery.set(key(value.studentId, value.topicId), value);
  }

  async listMastery(studentId: string) {
    return [...this.mastery.values()].filter((value) => value.studentId === studentId);
  }

  async getKnowledge(studentId: string, conceptId: string) {
    return this.knowledge.get(key(studentId, conceptId)) ?? null;
  }

  async saveKnowledge(value: ConceptKnowledgeState) {
    this.knowledge.set(key(value.studentId, value.conceptId), value);
  }

  async listKnowledge(studentId: string) {
    return [...this.knowledge.values()].filter((value) => value.studentId === studentId);
  }

  async setActiveMisconceptions(studentId: string, topicId: string, ids: readonly string[]) {
    this.misconceptions.set(key(studentId, topicId), new Set(ids));
  }

  async listActiveMisconceptions(studentId: string, topicId?: string) {
    if (topicId) return [...(this.misconceptions.get(key(studentId, topicId)) ?? [])];
    return [
      ...new Set(
        [...this.misconceptions.entries()]
          .filter(([entryKey]) => entryKey.startsWith(`${studentId}:`))
          .flatMap(([, ids]) => [...ids]),
      ),
    ];
  }

  async getStrategyPosteriors(studentId: string, contextKey: string) {
    const seeded = demoStrategyPosteriors.filter((value) => value.contextKey === contextKey);
    return seeded.map(
      (value) => this.posteriors.get(posteriorKey(studentId, value)) ?? { ...value },
    );
  }

  async saveStrategyPosterior(studentId: string, value: StrategyPosterior) {
    this.posteriors.set(posteriorKey(studentId, value), value);
  }

  async saveStrategyObservation(value: StrategyObservation) {
    this.observations.push(value);
  }

  async saveRetention(value: RetentionSchedule) {
    this.retention.set(key(value.studentId, value.conceptId), value);
  }

  async listRetention(studentId: string) {
    return [...this.retention.values()].filter((value) => value.studentId === studentId);
  }
}

function key(left: string, right: string) {
  return `${left}:${right}`;
}

function posteriorKey(studentId: string, value: StrategyPosterior) {
  return `${studentId}:${value.contextKey}:${value.strategy}`;
}
