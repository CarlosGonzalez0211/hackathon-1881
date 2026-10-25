import { demoHouseContent, houseContentSchema, type HouseContent } from "@athena/shared";
import { api } from "@/lib/api";
import { useMocks } from "@/lib/mode";

/**
 * What the house page Material tab reads from Curriculum (P1).
 * Contract: docs/contracts/P1-curriculum-world.md. P1 owns the real route.
 */
export interface CurriculumContentClient {
  getHouseContent(topicId: string): Promise<HouseContent>;
}

export class ApiCurriculumContentClient implements CurriculumContentClient {
  async getHouseContent(topicId: string) {
    return houseContentSchema.parse(await api(`/topics/${encodeURIComponent(topicId)}/sources`));
  }
}

export class MockCurriculumContentClient implements CurriculumContentClient {
  async getHouseContent(topicId: string) {
    const content = demoHouseContent[topicId];
    if (!content) throw new Error(`Sin contenido de demostración para ${topicId}`);
    return houseContentSchema.parse(content);
  }
}

let client: CurriculumContentClient | undefined;
export function getCurriculumContentClient(): CurriculumContentClient {
  client ??= useMocks ? new MockCurriculumContentClient() : new ApiCurriculumContentClient();
  return client;
}
