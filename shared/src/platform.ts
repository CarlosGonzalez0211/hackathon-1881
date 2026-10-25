import { z } from "zod";
import { idSchema, isoDateSchema, localeSchema } from "./common.js";

/** Identity, roles and classes (Platform owner). Proposals, not frozen. */
export const roleSchema = z.enum(["student", "professor", "admin"]);
export type Role = z.infer<typeof roleSchema>;

export const authContextSchema = z.object({
  userId: idSchema,
  role: roleSchema,
  classIds: z.array(idSchema),
  courseIds: z.array(idSchema),
});
export type AuthContext = z.infer<typeof authContextSchema>;

export const profileSchema = z.object({
  id: idSchema,
  authUserId: idSchema.nullable(),
  role: roleSchema,
  displayName: z.string().min(1),
  locale: localeSchema,
  accessibilityPreferences: z.record(z.unknown()),
  createdAt: isoDateSchema,
});
export type Profile = z.infer<typeof profileSchema>;

export const classSchema = z.object({
  id: idSchema,
  courseId: idSchema,
  professorId: idSchema,
  title: z.string().min(1),
  term: z.string().optional(),
  createdAt: isoDateSchema,
});
export type Class = z.infer<typeof classSchema>;

export const enrollmentSchema = z.object({
  classId: idSchema,
  studentId: idSchema,
  status: z.enum(["active", "dropped"]),
  enrolledAt: isoDateSchema,
});
export type Enrollment = z.infer<typeof enrollmentSchema>;
