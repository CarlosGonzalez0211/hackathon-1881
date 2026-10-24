import { z } from "zod";
import { planetStateSchema, type HouseState, type PlanetState } from "./learning.js";

/**
 * Subsystem 3 (World, Progression, and Collaboration) contracts.
 * PROPOSAL for team review, not frozen. The world consumes learning facts; it never computes
 * mastery, never changes house status from game activity, and Easter eggs never grant mastery.
 */

const idSchema = z.string().min(1);
const isoDateSchema = z.string().datetime();
const unitIntervalSchema = z.number().min(0).max(1);

export const worldLocaleSchema = z.enum(["es", "en"]);
export type WorldLocale = z.infer<typeof worldLocaleSchema>;

/** Spanish first; English is enabled for the demo. */
export const localizedTextSchema = z.object({ es: z.string().min(1), en: z.string().min(1) });
export type LocalizedText = z.infer<typeof localizedTextSchema>;

// ---------------------------------------------------------------------------
// Achievements (proposal 5.7)
// ---------------------------------------------------------------------------

export const achievementCodeSchema = z.enum([
  "first-insight",
  "geometry-builder",
  "strategy-switcher",
  "retention-star",
  "team-spark",
  "world-explorer",
]);
export type AchievementCode = z.infer<typeof achievementCodeSchema>;

export const achievementRaritySchema = z.enum(["common", "uncommon", "rare", "legendary"]);
export type AchievementRarity = z.infer<typeof achievementRaritySchema>;

export const achievementDefinitionSchema = z
  .object({
    code: achievementCodeSchema,
    shortLabel: localizedTextSchema,
    longLabel: localizedTextSchema,
    accessibleDescription: localizedTextSchema,
    rarity: achievementRaritySchema,
    /** Human-readable unlock rule; the executable rule lives in the world module. */
    unlockRule: localizedTextSchema,
    /** SVG icon id, always `badge-<code>`. */
    icon: z.string().regex(/^badge-[a-z0-9-]+$/),
    /** Optional 3D world celebration (e.g. `insight-lantern`). Every 3D effect has a 2D toast. */
    celebrationId: z.string().min(1).optional(),
  })
  .refine((definition) => definition.icon === `badge-${definition.code}`, {
    message: "Achievement icon id must be badge-<code>",
    path: ["icon"],
  });
export type AchievementDefinition = z.infer<typeof achievementDefinitionSchema>;

/** An unlocked achievement instance. Unique per (studentId, code). */
export const achievementSchema = z.object({
  id: idSchema,
  studentId: idSchema,
  code: achievementCodeSchema,
  /** Learning or world facts that justify the reward (event, attempt or discovery ids). */
  evidenceIds: z.array(idSchema).min(1),
  /** Id of the event that triggered the unlock, kept for idempotency audits. */
  sourceEventId: idSchema.optional(),
  unlockedAt: isoDateSchema,
});
export type Achievement = z.infer<typeof achievementSchema>;

export const achievementCatalogue: readonly AchievementDefinition[] = [
  {
    code: "first-insight",
    shortLabel: { es: "Primera luz", en: "First light" },
    longLabel: {
      es: "Primera luz: resolviste tu primera confusión",
      en: "First light: you resolved your first misconception",
    },
    accessibleDescription: {
      es: "Insignia de una linterna encendida. Se obtiene al resolver una confusión por primera vez.",
      en: "Badge showing a lit lantern. Earned the first time you resolve a misconception.",
    },
    rarity: "common",
    unlockRule: {
      es: "Primera confusión resuelta (MisconceptionResolved).",
      en: "First misconception resolved (MisconceptionResolved).",
    },
    icon: "badge-first-insight",
    celebrationId: "insight-lantern",
  },
  {
    code: "geometry-builder",
    shortLabel: { es: "Constructor geométrico", en: "Geometry builder" },
    longLabel: {
      es: "Constructor geométrico: dominaste Geometría",
      en: "Geometry builder: you mastered Geometry",
    },
    accessibleDescription: {
      es: "Insignia de un compás y un triángulo. Se obtiene al alcanzar el umbral de dominio en Geometría.",
      en: "Badge showing a compass and a triangle. Earned on reaching the Geometry mastery threshold.",
    },
    rarity: "uncommon",
    unlockRule: {
      es: "Dominio de Geometría informado por Aprendizaje igual o mayor al umbral.",
      en: "Geometry mastery reported by Learning at or above the threshold.",
    },
    icon: "badge-geometry-builder",
  },
  {
    code: "strategy-switcher",
    shortLabel: { es: "Nueva perspectiva", en: "New perspective" },
    longLabel: {
      es: "Nueva perspectiva: acertaste tras cambiar de estrategia",
      en: "New perspective: you succeeded after a strategy change",
    },
    accessibleDescription: {
      es: "Insignia de un prisma giratorio. Se obtiene al tener éxito después de un cambio de estrategia.",
      en: "Badge showing a rotating prism. Earned by succeeding after a teaching-strategy change.",
    },
    rarity: "uncommon",
    unlockRule: {
      es: "StrategyChanged seguido de un éxito en el mismo tema.",
      en: "StrategyChanged followed by a success on the same topic.",
    },
    icon: "badge-strategy-switcher",
  },
  {
    code: "retention-star",
    shortLabel: { es: "Conocimiento duradero", en: "Lasting knowledge" },
    longLabel: {
      es: "Conocimiento duradero: aprobaste un repaso de retención",
      en: "Lasting knowledge: you passed a retention check",
    },
    accessibleDescription: {
      es: "Insignia de una estrella dentro de un anillo de reloj. Se obtiene al aprobar un repaso de retención.",
      en: "Badge showing a star inside a clock ring. Earned by passing a retention check.",
    },
    rarity: "rare",
    unlockRule: {
      es: "Repaso de retención aprobado (RetentionCheckPassed).",
      en: "Retention check passed (RetentionCheckPassed).",
    },
    icon: "badge-retention-star",
  },
  {
    code: "team-spark",
    shortLabel: { es: "Chispa de equipo", en: "Team spark" },
    longLabel: {
      es: "Chispa de equipo: completaste tu primer reto en equipo",
      en: "Team spark: you completed your first team challenge",
    },
    accessibleDescription: {
      es: "Insignia de cuatro luces conectadas. Se obtiene al completar el primer reto de equipo.",
      en: "Badge showing four connected lights. Earned by completing a first team challenge.",
    },
    rarity: "rare",
    unlockRule: {
      es: "Primer reto de equipo completado.",
      en: "First team challenge completed.",
    },
    icon: "badge-team-spark",
  },
  {
    code: "world-explorer",
    shortLabel: { es: "Explorador", en: "Explorer" },
    longLabel: {
      es: "Explorador: descubriste tu primer secreto del mundo",
      en: "Explorer: you discovered your first world secret",
    },
    accessibleDescription: {
      es: "Insignia de un mapa con un camino brillante. Se obtiene al descubrir el primer huevo de pascua.",
      en: "Badge showing a map with a glowing path. Earned by discovering a first Easter egg.",
    },
    rarity: "common",
    unlockRule: {
      es: "Primer huevo de pascua descubierto. No otorga dominio académico.",
      en: "First Easter egg discovered. Grants no academic mastery.",
    },
    icon: "badge-world-explorer",
  },
];

export function getAchievementDefinition(code: AchievementCode): AchievementDefinition {
  const definition = achievementCatalogue.find((item) => item.code === code);
  if (!definition) throw new Error(`Unknown achievement code: ${code}`);
  return definition;
}

// ---------------------------------------------------------------------------
// Quests, Easter eggs, accessibility, world state, interactions
// ---------------------------------------------------------------------------

export const questStatusSchema = z.enum(["available", "active", "completed"]);
export const questObjectiveSchema = z.object({
  id: idSchema,
  label: z.string().min(1),
  current: z.number().nonnegative(),
  required: z.number().positive(),
});
export const questStateSchema = z.object({
  id: idSchema,
  studentId: idSchema,
  topicId: idSchema.optional(),
  title: z.string().min(1),
  status: questStatusSchema,
  objectives: z.array(questObjectiveSchema),
});
export type QuestState = z.infer<typeof questStateSchema>;

export const easterEggCodeSchema = z.string().regex(/^[a-z0-9-]+$/);
export const easterEggSchema = z.object({
  code: easterEggCodeSchema,
  title: localizedTextSchema,
  /** Shown before discovery; never reveals academic answers. */
  hint: localizedTextSchema,
  /** Engine-side anchor id on the planet surface (2D list exposes the same egg). */
  locationId: idSchema,
});
export type EasterEgg = z.infer<typeof easterEggSchema>;

export const easterEggDiscoveryRequestSchema = z.object({ studentId: idSchema });
export type EasterEggDiscoveryRequest = z.infer<typeof easterEggDiscoveryRequestSchema>;

export const easterEggDiscoveryResultSchema = z.object({
  code: easterEggCodeSchema,
  studentId: idSchema,
  discoveredAt: isoDateSchema,
  /** False when the egg was already found; repeat discoveries grant nothing new. */
  firstDiscovery: z.boolean(),
  /** Achievements newly unlocked by this discovery (empty on repeats). */
  unlockedAchievements: z.array(achievementSchema),
});
export type EasterEggDiscoveryResult = z.infer<typeof easterEggDiscoveryResultSchema>;

export const worldAccessibilitySettingsSchema = z.object({
  reducedMotion: z.boolean(),
  highContrast: z.boolean(),
  musicVolume: unitIntervalSchema,
  sfxVolume: unitIntervalSchema,
  /** Use the 2D world alternative instead of the canvas. */
  mode2d: z.boolean(),
  locale: worldLocaleSchema,
});
export type WorldAccessibilitySettings = z.infer<typeof worldAccessibilitySettingsSchema>;

export const defaultWorldAccessibilitySettings: WorldAccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  musicVolume: 0.6,
  sfxVolume: 0.8,
  mode2d: false,
  locale: "es",
};

export const worldStateSchema = z.object({
  studentId: idSchema,
  /** Projection of authoritative learning state; game activity never edits it. */
  planet: planetStateSchema,
  achievements: z.array(achievementSchema),
  quests: z.array(questStateSchema),
  easterEggs: z.array(easterEggSchema),
  discoveredEasterEggCodes: z.array(easterEggCodeSchema),
  accessibility: worldAccessibilitySettingsSchema,
  /** Pending 3D celebrations to play (2D toast equivalent is always shown). */
  activeCelebrationIds: z.array(z.string().min(1)),
});
export type WorldState = z.infer<typeof worldStateSchema>;

export const worldInteractionKindSchema = z.enum([
  "house_opened",
  "npc_talked",
  "lumen_talked",
  "object_inspected",
  "celebration_seen",
  "accessibility_changed",
]);
export type WorldInteractionKind = z.infer<typeof worldInteractionKindSchema>;

/** A cosmetic world interaction. It never counts as learning evidence. */
export const worldInteractionSchema = z
  .object({
    studentId: idSchema,
    kind: worldInteractionKindSchema,
    targetId: idSchema.optional(),
    accessibility: worldAccessibilitySettingsSchema.partial().optional(),
    at: isoDateSchema,
  })
  .refine(
    (value) => (value.kind === "accessibility_changed") === (value.accessibility !== undefined),
    {
      message: "accessibility is required for, and only allowed on, accessibility_changed",
      path: ["accessibility"],
    },
  );
export type WorldInteraction = z.infer<typeof worldInteractionSchema>;

export const worldInteractionResultSchema = z.object({
  interactionId: idSchema,
  world: worldStateSchema,
});
export type WorldInteractionResult = z.infer<typeof worldInteractionResultSchema>;

// ---------------------------------------------------------------------------
// Teams and team challenges
// ---------------------------------------------------------------------------

const memberIdsSchema = z
  .array(idSchema)
  .min(2)
  .max(4)
  .refine((ids) => new Set(ids).size === ids.length, { message: "Team members must be unique" });

export const teamSchema = z.object({
  id: idSchema,
  classId: idSchema,
  name: z.string().min(1).max(60),
  memberIds: memberIdsSchema,
  createdBy: idSchema,
  createdAt: isoDateSchema,
});
export type Team = z.infer<typeof teamSchema>;

export const createTeamRequestSchema = z
  .object({
    classId: idSchema,
    name: z.string().min(1).max(60),
    createdBy: idSchema,
    memberIds: memberIdsSchema,
  })
  .refine((value) => value.memberIds.includes(value.createdBy), {
    message: "The creator must be a team member",
    path: ["memberIds"],
  });
export type CreateTeamRequest = z.infer<typeof createTeamRequestSchema>;

export const teamChallengeStatusSchema = z.enum(["available", "active", "completed"]);
export const teamChallengeSchema = z.object({
  id: idSchema,
  teamId: idSchema,
  topicId: idSchema,
  title: z.string().min(1),
  memberIds: z.array(idSchema),
  status: teamChallengeStatusSchema,
  /** Game progress: successful attempts / requiredSuccesses. Not academic mastery. */
  sharedProgress: unitIntervalSchema,
  requiredSuccesses: z.number().int().positive(),
  successfulAttemptIds: z.array(idSchema),
  completedAt: isoDateSchema.optional(),
});
export type TeamChallenge = z.infer<typeof teamChallengeSchema>;

export const teamStateSchema = teamSchema.extend({ challenges: z.array(teamChallengeSchema) });
export type TeamState = z.infer<typeof teamStateSchema>;

export const createTeamChallengeRequestSchema = z.object({
  topicId: idSchema,
  title: z.string().min(1),
  requiredSuccesses: z.number().int().positive().max(20).default(3),
});
export type CreateTeamChallengeRequest = z.input<typeof createTeamChallengeRequestSchema>;

/**
 * A member's attempt. `success` and `evidenceId` must come from a Learning evaluation
 * (collaborative-evidence port pending Person 2); the world does not grade answers.
 */
export const teamChallengeAttemptSchema = z.object({
  studentId: idSchema,
  evidenceId: idSchema,
  success: z.boolean(),
  at: isoDateSchema,
});
export type TeamChallengeAttempt = z.infer<typeof teamChallengeAttemptSchema>;

export const teamChallengeAttemptResultSchema = z.object({
  challenge: teamChallengeSchema,
  /** Achievements newly unlocked for team members by this attempt. */
  unlockedAchievements: z.array(achievementSchema),
});
export type TeamChallengeAttemptResult = z.infer<typeof teamChallengeAttemptResultSchema>;

// ---------------------------------------------------------------------------
// Learning events consumed by the world.
// PROPOSALS pending Person 2 (Adaptive Learning): they own the producer side and the final shape.
// ---------------------------------------------------------------------------

const learningEventBase = {
  id: idSchema,
  studentId: idSchema,
  topicId: idSchema,
  occurredAt: isoDateSchema,
  evidenceIds: z.array(idSchema),
};

/** Proposal pending Person 2. Mastery is computed by Learning; the world only reads it. */
export const masteryUpdatedEventSchema = z.object({
  ...learningEventBase,
  type: z.literal("MasteryUpdated"),
  mastery: unitIntervalSchema,
  previousMastery: unitIntervalSchema.optional(),
});
export type MasteryUpdatedEvent = z.infer<typeof masteryUpdatedEventSchema>;

/** Proposal pending Person 2. */
export const misconceptionResolvedEventSchema = z.object({
  ...learningEventBase,
  type: z.literal("MisconceptionResolved"),
  misconceptionId: idSchema,
});
export type MisconceptionResolvedEvent = z.infer<typeof misconceptionResolvedEventSchema>;

/** Proposal pending Person 2. Strategy ids follow Learning's teachingStrategy enum. */
export const strategyChangedEventSchema = z.object({
  ...learningEventBase,
  type: z.literal("StrategyChanged"),
  fromStrategy: z.string().min(1),
  toStrategy: z.string().min(1),
});
export type StrategyChangedEvent = z.infer<typeof strategyChangedEventSchema>;

/** Proposal pending Person 2. */
export const retentionCheckPassedEventSchema = z.object({
  ...learningEventBase,
  type: z.literal("RetentionCheckPassed"),
  conceptId: idSchema.optional(),
});
export type RetentionCheckPassedEvent = z.infer<typeof retentionCheckPassedEventSchema>;

export const learningEventSchema = z.discriminatedUnion("type", [
  masteryUpdatedEventSchema,
  misconceptionResolvedEventSchema,
  strategyChangedEventSchema,
  retentionCheckPassedEventSchema,
]);
export type LearningEvent = z.infer<typeof learningEventSchema>;

// ---------------------------------------------------------------------------
// Demo fixtures (proposal 2.1-2.5, 5.8). Deterministic ids and timestamps.
// ---------------------------------------------------------------------------

export const demoRosterSchema = z.object({
  classId: idSchema,
  name: z.string().min(1),
  locale: worldLocaleSchema,
  professor: z.object({ id: idSchema, displayName: z.string().min(1) }),
  students: z.array(z.object({ id: idSchema, displayName: z.string().min(1) })).length(8),
});
export type DemoRoster = z.infer<typeof demoRosterSchema>;

export const DEMO_CLASS_ID = "class-demo";
export const DEMO_STUDENT_ID = "student-lucia";
export const DEMO_GEOMETRY_TOPIC_ID = "topic-geometry";

export const demoRoster: DemoRoster = {
  classId: DEMO_CLASS_ID,
  name: "Matemáticas I – Grupo A",
  locale: "es",
  professor: { id: "prof-elena-ruiz", displayName: "Prof. Elena Ruiz" },
  students: [
    { id: DEMO_STUDENT_ID, displayName: "Lucía Torres" },
    { id: "student-mateo", displayName: "Mateo Herrera" },
    { id: "student-valentina", displayName: "Valentina Díaz" },
    { id: "student-santiago", displayName: "Santiago Morales" },
    { id: "student-camila", displayName: "Camila Rojas" },
    { id: "student-diego", displayName: "Diego Navarro" },
    { id: "student-sofia", displayName: "Sofía Castro" },
    { id: "student-andres", displayName: "Andrés Vega" },
  ],
};

export const demoTopics = [
  { slot: 0, topicId: "topic-fractions", title: "Fracciones" },
  { slot: 1, topicId: DEMO_GEOMETRY_TOPIC_ID, title: "Geometría" },
  { slot: 2, topicId: "topic-functions", title: "Funciones" },
  { slot: 3, topicId: "topic-statistics", title: "Estadística" },
  { slot: 4, topicId: "topic-probability", title: "Probabilidad" },
  { slot: 5, topicId: "topic-critical-thinking", title: "Pensamiento crítico" },
] as const;

/** Developer-defined identity, same as shared mocks. Not a user appearance picker. */
const demoTheme = { palette: "athena-default", character: "messenger-provisional" };

type HouseSpec = readonly [HouseState["status"], number];
function demoPlanet(studentId: string, growth: number, specs: readonly HouseSpec[]): PlanetState {
  return {
    studentId,
    theme: { ...demoTheme },
    growth,
    houses: demoTopics.map((topic, index) => {
      const [status, progress] = specs[index] ?? ["locked", 0];
      return { topicId: topic.topicId, title: topic.title, slot: topic.slot, status, progress };
    }),
  };
}

const L = "locked" as const;
const A = "available" as const;
const P = "in_progress" as const;
const D = "done" as const;

/** Lucía at the opening of the demo (proposal 2.2). */
export const demoLuciaPlanet: PlanetState = demoPlanet(DEMO_STUDENT_ID, 0.31, [
  [D, 1],
  [P, 0.4],
  [A, 0],
  [L, 0],
  [L, 0],
  [L, 0],
]);

/** Lucía after the successful second checkpoint (proposal 2.5, 5.8). */
export const demoLuciaPlanetAfterCheckpoint: PlanetState = demoPlanet(DEMO_STUDENT_ID, 0.35, [
  [D, 1],
  [P, 0.6],
  [A, 0],
  [L, 0],
  [L, 0],
  [L, 0],
]);

/** Eight planets at different growth stages; Lucía first. */
export const demoClassPlanets: PlanetState[] = [
  demoLuciaPlanet,
  demoPlanet("student-mateo", 0.05, [
    [P, 0.3],
    [L, 0],
    [L, 0],
    [L, 0],
    [L, 0],
    [L, 0],
  ]),
  demoPlanet("student-valentina", 0.18, [
    [D, 1],
    [A, 0],
    [L, 0],
    [L, 0],
    [L, 0],
    [L, 0],
  ]),
  demoPlanet("student-santiago", 0.42, [
    [D, 1],
    [D, 1],
    [P, 0.5],
    [L, 0],
    [L, 0],
    [L, 0],
  ]),
  demoPlanet("student-camila", 0.55, [
    [D, 1],
    [D, 1],
    [D, 1],
    [P, 0.3],
    [L, 0],
    [L, 0],
  ]),
  demoPlanet("student-diego", 0.12, [
    [P, 0.7],
    [L, 0],
    [L, 0],
    [L, 0],
    [L, 0],
    [L, 0],
  ]),
  demoPlanet("student-sofia", 0.71, [
    [D, 1],
    [D, 1],
    [D, 1],
    [D, 1],
    [P, 0.6],
    [L, 0],
  ]),
  demoPlanet("student-andres", 0.0, [
    [A, 0],
    [L, 0],
    [L, 0],
    [L, 0],
    [L, 0],
    [L, 0],
  ]),
];

export const demoEasterEggs: EasterEgg[] = [
  {
    code: "hidden-pi",
    title: { es: "El π escondido", en: "The hidden π" },
    hint: { es: "Busca detrás de la casa de Geometría.", en: "Look behind the Geometry house." },
    locationId: "surface-geometry-backyard",
  },
  {
    code: "fibonacci-garden",
    title: { es: "Jardín de Fibonacci", en: "Fibonacci garden" },
    hint: { es: "Cuenta los pétalos cerca de Fracciones.", en: "Count the petals near Fractions." },
    locationId: "surface-fractions-garden",
  },
];

export const demoLuciaQuests: QuestState[] = [
  {
    id: "quest-triangle-area",
    studentId: DEMO_STUDENT_ID,
    topicId: DEMO_GEOMETRY_TOPIC_ID,
    title: "Practicar el área de triángulos",
    status: "active",
    objectives: [
      {
        id: "obj-checkpoint",
        label: "Supera un punto de control de Geometría",
        current: 0,
        required: 1,
      },
      { id: "obj-explain", label: "Explica por qué se divide entre 2", current: 0, required: 1 },
    ],
  },
  {
    id: "quest-explore-planet",
    studentId: DEMO_STUDENT_ID,
    title: "Explora tu planeta",
    status: "available",
    objectives: [{ id: "obj-easter-egg", label: "Descubre un secreto", current: 0, required: 1 }],
  },
];

/**
 * Deterministic learning events emitted by the mock Learning side after the second checkpoint.
 * Proposals pending Person 2. Only first-insight follows from these (geometry 0.60 < threshold).
 */
export const demoCheckpointEvents: LearningEvent[] = [
  {
    id: "evt-misconception-resolved-1",
    type: "MisconceptionResolved",
    studentId: DEMO_STUDENT_ID,
    topicId: DEMO_GEOMETRY_TOPIC_ID,
    misconceptionId: "misconception-triangle-as-rectangle",
    evidenceIds: ["attempt-checkpoint-2"],
    occurredAt: "2026-10-24T15:05:00.000Z",
  },
  {
    id: "evt-mastery-updated-1",
    type: "MasteryUpdated",
    studentId: DEMO_STUDENT_ID,
    topicId: DEMO_GEOMETRY_TOPIC_ID,
    mastery: 0.6,
    previousMastery: 0.4,
    evidenceIds: ["attempt-checkpoint-2"],
    occurredAt: "2026-10-24T15:05:01.000Z",
  },
];

export const demoFirstInsightAchievement: Achievement = {
  id: `ach-${DEMO_STUDENT_ID}-first-insight`,
  studentId: DEMO_STUDENT_ID,
  code: "first-insight",
  evidenceIds: ["attempt-checkpoint-2"],
  sourceEventId: "evt-misconception-resolved-1",
  unlockedAt: "2026-10-24T15:05:00.000Z",
};

/** Lucía's world after the checkpoint: geometry 0.60, growth 0.35, first-insight unlocked. */
export const demoLuciaWorldAfterCheckpoint: WorldState = {
  studentId: DEMO_STUDENT_ID,
  planet: demoLuciaPlanetAfterCheckpoint,
  achievements: [demoFirstInsightAchievement],
  quests: demoLuciaQuests,
  easterEggs: demoEasterEggs,
  discoveredEasterEggCodes: [],
  accessibility: defaultWorldAccessibilitySettings,
  activeCelebrationIds: ["insight-lantern"],
};
