import type { ContentMilestone, ContentObjective } from "@athena/shared";

/** Objectives in the chat's scope: one topic, or every topic for the whole class. */
export function objectivesInScope(objectives: ContentObjective[], topicId: string) {
  return objectives
    .filter((objective) => !topicId || objective.topicId === topicId)
    .sort((a, b) => a.topicId.localeCompare(b.topicId) || a.position - b.position);
}

/** Milestones not yet due (undated ones last), soonest first, at most `limit`. */
export function upcomingMilestones(milestones: ContentMilestone[], now: Date, limit = 3) {
  const time = (milestone: ContentMilestone) =>
    milestone.dueAt ? Date.parse(milestone.dueAt) : Number.POSITIVE_INFINITY;
  return milestones
    .filter((milestone) => time(milestone) >= now.getTime())
    .sort((a, b) => time(a) - time(b) || a.position - b.position)
    .slice(0, limit);
}
