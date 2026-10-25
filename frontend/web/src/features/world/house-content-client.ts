import { t } from "@/lib/i18n";
import {
  athenaDemoCourse,
  canonicalDemoTopicId,
  demoHouseContent,
  houseContentSchema,
  legacyDemoTopicId,
  type HouseContent,
} from "@athena/shared";
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
    const content = demoHouseContent[legacyDemoTopicId(topicId)];
    if (!content) throw new Error(t("No demo content for {0}", { 0: topicId }));
    return houseContentSchema.parse({
      ...content,
      courseId: athenaDemoCourse.id,
      topicId: canonicalDemoTopicId(topicId),
    });
  }
}

let client: CurriculumContentClient | undefined;
export function getCurriculumContentClient(): CurriculumContentClient {
  client ??= useMocks ? new MockCurriculumContentClient() : new ApiCurriculumContentClient();
  return client;
}
