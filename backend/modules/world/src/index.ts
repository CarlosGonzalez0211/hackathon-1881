/** Internal world module (Subsystem 3). Contracts in @athena/shared are proposals. */
export { WorldError } from "./errors.js";
export {
  GEOMETRY_BUILDER_THRESHOLD,
  achievementCodesFor,
  type EasterEggDiscoveredEvent,
  type RuleContext,
  type TeamChallengeCompletedEvent,
  type WorldEvent,
} from "./rules.js";
export { InMemoryWorldStore } from "./store.js";
export { DemoWorldDriver } from "./demo.js";
export {
  MockCurriculumTopicPort,
  MockEnrollmentPort,
  MockMasteryPort,
  createMockWorldPorts,
  type MockWorldPorts,
} from "./mock-ports.js";
export type {
  CurriculumTopicPort,
  Enrollment,
  EnrollmentPort,
  MasteryReadPort,
  WorldPorts,
} from "./ports.js";
export { WorldService, type WorldServiceOptions } from "./service.js";
export { worldRoutes, type WorldRoutesOptions } from "./routes.js";
