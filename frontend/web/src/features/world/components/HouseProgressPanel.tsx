"use client";
import { t } from "@/lib/i18n";

import {
  achievementCatalogue,
  type HouseState,
  type TopicMastery,
  type WorldView,
} from "@athena/shared";
import { SubjectProgressView } from "@/features/progress/SubjectProgressView";
import styles from "./HousePage.module.css";

/** Progreso tab (World): the topic's concepts as orbits, plus its quests and badges. */
export function HouseProgressPanel({
  house,
  mastery,
  world,
}: {
  house: HouseState;
  mastery?: TopicMastery;
  world: WorldView;
}) {
  const quests = world.quests.filter((quest) => quest.topicId === house.topicId);
  const steps = quests.flatMap((quest) => quest.objectives);
  const badges = world.achievements.filter((achievement) =>
    achievementCatalogue.some((item) => item.code === achievement.code),
  );
  return (
    <div className={styles.stack}>
      <SubjectProgressView
        topicId={house.topicId}
        title={house.title}
        progress={house.progress}
        demonstrated={mastery?.demonstratedConcepts}
        total={mastery?.totalConcepts}
        questSteps={{
          done: steps.filter((step) => step.current >= step.required).length,
          total: steps.length,
        }}
        badges={badges.length}
      />
      <p className={styles.muted}>
        {t("Your progress grows through checkpoints, not time spent or AI usage.")}
      </p>
    </div>
  );
}
