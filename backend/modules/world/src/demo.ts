import { DEMO_STUDENT_ID, demoLearningScenario, type DemoWorldStepResult } from "@athena/shared";
import { conflict } from "./errors.js";
import { MockMasteryPort } from "./mock-ports.js";
import type { WorldService } from "./service.js";

/**
 * Plays Learning's (P2) role for the presentation: writes the next scenario step's mastery
 * into the mock port, then sends its events through the same sink P2 will call. World code
 * paths are the real ones; only the producer is fake. Presenter-only, never in production.
 */
export class DemoWorldDriver {
  private readonly applied = new Map<string, number>();

  constructor(private readonly world: WorldService) {}

  async step(studentId = DEMO_STUDENT_ID): Promise<DemoWorldStepResult> {
    const mastery = this.world.ports.mastery;
    if (!(mastery instanceof MockMasteryPort))
      throw conflict("Demo steps need the mock Learning port");
    const steps = demoLearningScenario.filter((item) => item.studentId === studentId);
    const index = this.applied.get(studentId) ?? 0;
    const next = steps[index];
    if (!next) return { step: null, remaining: 0 };
    // Baseline first, so the step's changes surface as transitions even on a cold start.
    await this.world.project(studentId);
    mastery.set(studentId, next.mastery, next.growth);
    for (const event of next.events) await this.world.ingestLearningEvent(event);
    this.applied.set(studentId, index + 1);
    return { step: next.id, remaining: steps.length - index - 1 };
  }
}
