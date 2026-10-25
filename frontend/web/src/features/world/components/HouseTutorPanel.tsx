"use client";
import { TutorSession } from "@/features/learning";

/**
 * Aprender tab. Slot owned by Learning (P2): `POST /api/learning/session` with these props,
 * checkpoints, hints. When mastery changes, P2 emits learning events to World; call
 * `onProgress` so the world refreshes. Contract: docs/contracts/P2-learning-world.md.
 */
export function HouseTutorPanel(props: {
  studentId: string;
  topicId: string;
  entryId: string;
  onProgress?: () => void;
}) {
  return (
    <TutorSession studentId={props.studentId} topicId={props.topicId} entryId={props.entryId} />
  );
}
