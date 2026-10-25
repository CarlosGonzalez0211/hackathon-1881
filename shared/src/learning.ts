import { z } from "zod";

/** Proposed GAMEPLAN contracts. Coordinate with the team before treating these as frozen. */
export const houseStatusSchema = z.enum(["locked", "available", "in_progress", "done"]);
export const houseStateSchema = z.object({
  topicId: z.string().min(1),
  title: z.string().min(1),
  slot: z.number().int().nonnegative(),
  status: houseStatusSchema,
  progress: z.number().min(0).max(1),
});
export type HouseState = z.infer<typeof houseStateSchema>;

export const planetStateSchema = z.object({
  studentId: z.string().min(1),
  // Developer-defined identity. This is not a user appearance picker.
  theme: z.object({ palette: z.string().min(1), character: z.string().min(1) }),
  growth: z.number().min(0).max(1),
  houses: z.array(houseStateSchema).superRefine((houses, ctx) => {
    const slots = new Set<number>();
    for (const [index, house] of houses.entries()) {
      if (slots.has(house.slot))
        ctx.addIssue({
          code: "custom",
          path: [index, "slot"],
          message: "A planet slot can contain only one topic",
        });
      slots.add(house.slot);
    }
  }),
});
export type PlanetState = z.infer<typeof planetStateSchema>;

/**
 * Proposed: the class orbit view. One planet per enrolled student, with the name the class
 * sees. Ordering is the class roster order (it fixes each student's ring in the sky).
 */
export const classOrbitStudentSchema = z.object({
  studentId: z.string().min(1),
  displayName: z.string().min(1),
  planet: planetStateSchema,
});
export type ClassOrbitStudent = z.infer<typeof classOrbitStudentSchema>;
export const classOrbitSchema = z.object({
  classId: z.string().min(1),
  students: z.array(classOrbitStudentSchema),
});
export type ClassOrbit = z.infer<typeof classOrbitSchema>;

export const aiEventKindSchema = z.enum([
  "chat",
  "podcast",
  "video",
  "summary",
  "hint",
  "quiz_answer",
]);
export const aiEventSchema = z.object({
  studentId: z.string().min(1),
  topicId: z.string().min(1),
  kind: aiEventKindSchema,
  at: z.string().datetime(),
  meta: z.record(z.unknown()),
});
export type AiEvent = z.infer<typeof aiEventSchema>;
const aiUsageSchema = z.object({
  chat: z.number().int().nonnegative(),
  podcast: z.number().int().nonnegative(),
  video: z.number().int().nonnegative(),
  summary: z.number().int().nonnegative(),
  hint: z.number().int().nonnegative(),
  quiz_answer: z.number().int().nonnegative(),
});
const topicProgressSchema = z.object({
  topicId: z.string(),
  title: z.string(),
  progress: z.number().min(0).max(1),
});
export const classSummarySchema = z.object({
  classId: z.string().min(1),
  topics: z.array(topicProgressSchema),
  aiUsage: aiUsageSchema,
  students: z.array(
    z.object({
      studentId: z.string(),
      growth: z.number().min(0).max(1),
      topics: z.array(topicProgressSchema),
      aiUsage: aiUsageSchema,
    }),
  ),
});
export type ClassSummary = z.infer<typeof classSummarySchema>;
