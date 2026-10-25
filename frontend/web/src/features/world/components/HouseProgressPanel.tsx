"use client";
import {
  achievementCatalogue,
  type HouseState,
  type TopicMastery,
  type WorldView,
} from "@athena/shared";
import styles from "./HousePage.module.css";

/** Progreso tab (World): state, concepts, topic quests and badges earned here. */
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
  const badges = world.achievements.flatMap((achievement) => {
    const definition = achievementCatalogue.find((item) => item.code === achievement.code);
    return definition ? [{ achievement, definition }] : [];
  });
  return (
    <div className={styles.stack}>
      <dl className={styles.facts}>
        <div>
          <dt>Progreso demostrado</dt>
          <dd>{Math.round(house.progress * 100)}%</dd>
        </div>
        {mastery?.totalConcepts !== undefined && (
          <div>
            <dt>Conceptos</dt>
            <dd>
              {mastery.demonstratedConcepts ?? 0} de {mastery.totalConcepts}
            </dd>
          </div>
        )}
      </dl>
      {quests.map((quest) => (
        <section key={quest.id} className={styles.resource}>
          <h3>{quest.title}</h3>
          <ul className={styles.objectives}>
            {quest.objectives.map((objective) => (
              <li key={objective.id}>
                <span aria-hidden="true">
                  {objective.current >= objective.required ? "✓" : "○"}
                </span>{" "}
                {objective.label} ({objective.current}/{objective.required})
              </li>
            ))}
          </ul>
        </section>
      ))}
      <section>
        <h3 className={styles.subheading}>Insignias</h3>
        {badges.length === 0 ? (
          <p className={styles.muted}>
            Aún no tienes insignias. Llegan cuando demuestras lo aprendido.
          </p>
        ) : (
          <ul className={styles.badges}>
            {badges.map(({ achievement, definition }) => (
              <li key={achievement.id} title={definition.accessibleDescription.es}>
                <strong>{definition.shortLabel.es}</strong>
                <small>{definition.longLabel.es}</small>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className={styles.muted}>
        Tu progreso sube con puntos de control, no por el tiempo ni por usar la IA.
      </p>
    </div>
  );
}
