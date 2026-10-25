import type { FastifyInstance } from "fastify";

/**
 * STUB (P1 owns). Courses, topics, materials, ingestion and cited retrieval. Reach platform
 * services through `app.platform` and the caller through `request.auth`. Registers no routes yet.
 */
export async function curriculumRoutes(_app: FastifyInstance) {
  // P1: add routes here (see ATHENA_SUBSYSTEM_IMPLEMENTATION_PROPOSAL section 3).
}

// Person 1's offline services; route registration remains the existing stub.
export * from "./ports.js";
export * from "./mock-repository.js";
export * from "./retrieval-service.js";
export * from "./geometry-concept-catalog.js";
export * from "./geometry-source-map.js";
export * from "./learning-context-adapter.js";
export * from "./content-capabilities.js";
export * from "./capability-service.js";
export * from "./history-resource-catalog.js";
export * from "./history-resource-service.js";
export * from "./topic-capability-service.js";
