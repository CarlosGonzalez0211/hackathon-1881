import { randomUUID } from "node:crypto";

/** Time and id sources are injected so demo data and tests stay deterministic. */
export interface Clock {
  now(): Date;
}
export interface IdGenerator {
  next(): string;
}

export const systemClock: Clock = { now: () => new Date() };
export const randomIdGenerator: IdGenerator = { next: () => randomUUID() };

export function fixedClock(iso: string): Clock {
  const instant = new Date(iso);
  return { now: () => new Date(instant) };
}

/** Produces valid UUID-shaped ids: 00000000-0000-4000-8000-<counter>. */
export function sequentialIdGenerator(start = 1): IdGenerator {
  let counter = start;
  return {
    next: () => `00000000-0000-4000-8000-${String(counter++).padStart(12, "0")}`,
  };
}
