import {
  demoWorldStepResultSchema,
  houseEntryResultSchema,
  worldInteractionResultSchema,
  worldLayoutSchema,
  worldViewSchema,
  type DemoWorldStepResult,
  type HouseEntryRequest,
  type HouseEntryResult,
  type WorldInteraction,
  type WorldLayout,
  type WorldView,
} from "@athena/shared";
import { api } from "@/lib/api";
import { useMocks } from "@/lib/mode";

/**
 * Everything the student world needs from the backend. Contract: docs/contracts/world-api.md.
 * Both implementations validate with the same shared schemas.
 */
export interface WorldClient {
  getWorld(studentId: string): Promise<WorldView>;
  enterHouse(request: HouseEntryRequest): Promise<HouseEntryResult>;
  recordInteraction(interaction: WorldInteraction): Promise<void>;
  getLayout(courseId: string): Promise<WorldLayout>;
  /** Presenter-only: advance / restart the mocked Learning scenario. */
  demoStep(studentId: string): Promise<DemoWorldStepResult>;
  demoReset(): Promise<void>;
}

const post = (body: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(body) });

export class ApiWorldClient implements WorldClient {
  async getWorld(studentId: string) {
    return worldViewSchema.parse(await api(`/world/${encodeURIComponent(studentId)}`));
  }
  async enterHouse(request: HouseEntryRequest) {
    return houseEntryResultSchema.parse(await api("/world/houses/enter", post(request)));
  }
  async recordInteraction(interaction: WorldInteraction) {
    worldInteractionResultSchema.parse(await api("/world/interactions", post(interaction)));
  }
  async getLayout(courseId: string) {
    return worldLayoutSchema.parse(
      await api(`/courses/${encodeURIComponent(courseId)}/world-layout`),
    );
  }
  async demoStep(studentId: string) {
    return demoWorldStepResultSchema.parse(await api("/demo/world/step", post({ studentId })));
  }
  async demoReset() {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/demo/world/reset`, {
      method: "POST",
    });
  }
}

/**
 * Runs the real World service in the browser on mock Curriculum/Learning ports, so mock mode
 * follows exactly the server's rules. Loaded lazily: never part of the API-mode bundle path.
 */
export class MockWorldClient implements WorldClient {
  private runtime?: Promise<{
    service: import("@athena/world").WorldService;
    driver: import("@athena/world").DemoWorldDriver;
  }>;

  private load() {
    this.runtime ??= import("@athena/world").then(({ WorldService, DemoWorldDriver }) => {
      const service = new WorldService();
      return { service, driver: new DemoWorldDriver(service) };
    });
    return this.runtime;
  }

  async getWorld(studentId: string) {
    const { service } = await this.load();
    return worldViewSchema.parse(await service.getWorld(studentId));
  }
  async enterHouse(request: HouseEntryRequest) {
    const { service } = await this.load();
    return houseEntryResultSchema.parse(await service.enterHouse(request));
  }
  async recordInteraction(interaction: WorldInteraction) {
    const { service } = await this.load();
    await service.recordInteraction(interaction);
  }
  async getLayout(courseId: string) {
    const { service } = await this.load();
    return worldLayoutSchema.parse(await service.getWorldLayout(courseId));
  }
  async demoStep(studentId: string) {
    const { driver } = await this.load();
    return driver.step(studentId);
  }
  async demoReset() {
    this.runtime = undefined;
  }
}

let client: WorldClient | undefined;
export function getWorldClient(): WorldClient {
  client ??= useMocks ? new MockWorldClient() : new ApiWorldClient();
  return client;
}
