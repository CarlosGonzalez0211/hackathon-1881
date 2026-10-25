import { athenaDemoTopics } from "@athena/shared";

export type SubjectStatus = "done" | "in_progress" | "available" | "locked";

export interface SubjectProgress {
  topicId: string;
  title: string;
  /** Orbit colour for this subject's ring, swatch and bar. */
  hue: string;
  status: SubjectStatus;
  /** 0..1, share of concepts with checkpoint evidence. */
  progress: number;
  conceptsDone: number;
  conceptsTotal: number;
  minutesThisWeek: number;
  /** Best checkpoint score so far, 0..100. */
  bestCheckpoint?: number;
  next: string;
}

export interface StudentProgress {
  studentName: string;
  planetGrowth: number;
  streakDays: number;
  checkpointsPassed: number;
  /** Minutes studied Monday..Sunday. */
  week: number[];
  subjects: SubjectProgress[];
}

const HUES = ["#5fb3a1", "#f0b84a", "#8b7fe0", "#5aa6dc", "#e07a9a", "#9cb85a"];

const DETAILS: Record<string, Omit<SubjectProgress, "topicId" | "title" | "hue">> = {
  fractions: {
    status: "done",
    progress: 1,
    conceptsDone: 4,
    conceptsTotal: 4,
    minutesThisWeek: 25,
    bestCheckpoint: 92,
    next: "Review anytime to keep it fresh",
  },
  geometry: {
    status: "in_progress",
    progress: 0.64,
    conceptsDone: 3,
    conceptsTotal: 5,
    minutesThisWeek: 96,
    bestCheckpoint: 78,
    next: "Practice triangle areas",
  },
  functions: {
    status: "in_progress",
    progress: 0.38,
    conceptsDone: 2,
    conceptsTotal: 6,
    minutesThisWeek: 54,
    bestCheckpoint: 70,
    next: "Read a graph's slope",
  },
  statistics: {
    status: "in_progress",
    progress: 0.17,
    conceptsDone: 1,
    conceptsTotal: 6,
    minutesThisWeek: 18,
    next: "Mean, median and mode",
  },
  probability: {
    status: "available",
    progress: 0.06,
    conceptsDone: 0,
    conceptsTotal: 5,
    minutesThisWeek: 6,
    next: "Start with simple events",
  },
  criticalThinking: {
    status: "locked",
    progress: 0,
    conceptsDone: 0,
    conceptsTotal: 4,
    minutesThisWeek: 0,
    next: "Opens after Probability",
  },
};

/** Demo data for the progress page; real progress comes from Learning checkpoints. */
export const mockStudentProgress: StudentProgress = {
  studentName: "Lucía",
  planetGrowth: 0.47,
  streakDays: 5,
  checkpointsPassed: 11,
  week: [22, 35, 0, 48, 61, 30, 38],
  subjects: athenaDemoTopics.map((topic, index) => ({
    topicId: topic.id,
    title: topic.title,
    hue: HUES[index % HUES.length]!,
    ...DETAILS[topic.key]!,
  })),
};
