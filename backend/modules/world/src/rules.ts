import { DEMO_GEOMETRY_TOPIC_ID, type AchievementCode, type LearningEvent } from "@athena/shared";

/** Geometry mastery (reported by Learning) needed for geometry-builder. Proposal value. */
export const GEOMETRY_BUILDER_THRESHOLD = 0.8;
export const GEOMETRY_TOPIC_ID = DEMO_GEOMETRY_TOPIC_ID;

/** World-internal facts that also feed achievements (not learning evidence). */
export type TeamChallengeCompletedEvent = {
  type: "TeamChallengeCompleted";
  id: string;
  studentId: string;
  teamId: string;
  challengeId: string;
  evidenceIds: string[];
  occurredAt: string;
};
export type EasterEggDiscoveredEvent = {
  type: "EasterEggDiscovered";
  id: string;
  studentId: string;
  code: string;
  evidenceIds: string[];
  occurredAt: string;
};
export type WorldEvent = LearningEvent | TeamChallengeCompletedEvent | EasterEggDiscoveredEvent;

/** Per-student memory the rules need; owned by the store. */
export interface RuleContext {
  /** Topics where Learning reported a strategy change not yet followed by a success. */
  pendingStrategyTopics: Set<string>;
}

/** A learning success on a topic: resolved misconception or reported mastery increase. */
function isSuccess(event: WorldEvent): boolean {
  if (event.type === "MisconceptionResolved") return true;
  if (event.type === "MasteryUpdated")
    return event.previousMastery !== undefined && event.mastery > event.previousMastery;
  return false;
}

/**
 * Pure mapping from facts to candidate achievement codes. It never computes mastery; it only
 * compares values Learning already reported. Idempotency is enforced by the store on unlock.
 */
export function achievementCodesFor(event: WorldEvent, context: RuleContext): AchievementCode[] {
  const codes: AchievementCode[] = [];
  switch (event.type) {
    case "MisconceptionResolved":
      codes.push("first-insight");
      break;
    case "MasteryUpdated":
      if (event.topicId === GEOMETRY_TOPIC_ID && event.mastery >= GEOMETRY_BUILDER_THRESHOLD)
        codes.push("geometry-builder");
      break;
    case "StrategyChanged":
      context.pendingStrategyTopics.add(event.topicId);
      break;
    case "RetentionCheckPassed":
      codes.push("retention-star");
      break;
    case "TeamChallengeCompleted":
      codes.push("team-spark");
      break;
    case "EasterEggDiscovered":
      codes.push("world-explorer");
      break;
  }
  if ("topicId" in event && isSuccess(event) && context.pendingStrategyTopics.has(event.topicId)) {
    context.pendingStrategyTopics.delete(event.topicId);
    codes.push("strategy-switcher");
  }
  return codes;
}
