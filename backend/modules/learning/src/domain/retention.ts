import type { RetentionSchedule } from "@athena/shared";

const SUCCESS_INTERVALS = [1, 3, 7, 14, 30] as const;

export function scheduleRetention(input: {
  studentId: string;
  conceptId: string;
  recalledSuccessfully: boolean;
  previousSuccessfulRecallStreak?: number;
  now: Date;
}): RetentionSchedule {
  const streak = input.recalledSuccessfully ? (input.previousSuccessfulRecallStreak ?? 0) + 1 : 0;
  const intervalDays = input.recalledSuccessfully
    ? (SUCCESS_INTERVALS[Math.min(streak - 1, SUCCESS_INTERVALS.length - 1)] ?? 1)
    : 1;
  const due = new Date(input.now);
  due.setUTCDate(due.getUTCDate() + intervalDays);
  return {
    studentId: input.studentId,
    conceptId: input.conceptId,
    successfulRecallStreak: streak,
    intervalDays,
    dueAt: due.toISOString(),
  };
}
