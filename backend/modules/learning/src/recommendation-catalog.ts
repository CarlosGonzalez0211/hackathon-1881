import { athenaDemoIds, demoLearningIds } from "@athena/shared";

export interface RecommendationTopic {
  topicId: string;
  prerequisiteTopicIds: readonly string[];
  conceptIds: readonly string[];
}

export interface RecommendationCatalogPort {
  listTopics(courseId: string): Promise<RecommendationTopic[]>;
}

/** Replace with Vianey's published prerequisite graph after contract approval. */
export class InMemoryRecommendationCatalog implements RecommendationCatalogPort {
  async listTopics(courseId: string) {
    if (courseId !== athenaDemoIds.course) return [];
    return [
      {
        topicId: athenaDemoIds.topics.fractions,
        prerequisiteTopicIds: [],
        conceptIds: ["math.fractions.equivalent_fractions"],
      },
      {
        topicId: athenaDemoIds.topics.geometry,
        prerequisiteTopicIds: [],
        conceptIds: Object.values(demoLearningIds.concepts),
      },
      {
        topicId: athenaDemoIds.topics.functions,
        prerequisiteTopicIds: [athenaDemoIds.topics.geometry],
        conceptIds: ["math.functions.function_notation"],
      },
    ];
  }
}
