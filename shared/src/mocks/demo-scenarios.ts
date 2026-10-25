/**
 * STUB (P1 owns). The deterministic demo state machine that every mock client will read, so
 * one action ripples through learning, world and analytics. Only the state names exist so far.
 */
export const DEMO_SCENARIO_STATES = [
  "DEMO_INITIAL",
  "DIAGNOSTIC_COMPLETE",
  "WORKED_EXAMPLE_SHOWN",
  "FIRST_CHECKPOINT_FAILED",
  "VISUAL_STRATEGY_SHOWN",
  "SECOND_CHECKPOINT_PASSED",
  "MASTERY_UPDATED",
  "WORLD_TRANSFORMED",
  "ANALYTICS_UPDATED",
] as const;
export type DemoScenarioState = (typeof DEMO_SCENARIO_STATES)[number];
