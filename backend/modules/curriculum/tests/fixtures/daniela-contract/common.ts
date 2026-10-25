import { z } from "zod";

/** Cross-subsystem primitives (Platform owner). Proposals, not frozen. */
export const idSchema = z.string().min(1);
export const uuidSchema = z.string().uuid();
export const isoDateSchema = z.string().datetime();
export const localeSchema = z.enum(["en", "es"]);
export type Locale = z.infer<typeof localeSchema>;

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(25),
});
export type Pagination = z.infer<typeof paginationSchema>;

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  traceId: z.string().optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;
