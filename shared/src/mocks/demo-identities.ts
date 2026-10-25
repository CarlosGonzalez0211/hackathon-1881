/**
 * Fixed UUID-shaped ids shared by every fixture, so mock mode and Postgres uuid columns agree.
 * P1 owns this file. Platform seeded it so all four subsystems can start from the same ids.
 * Note: older fixtures (mocks.ts, world demo data) still use string ids; reconcile before
 * the integration checkpoint.
 */
const uuid = (suffix: string) => `00000000-0000-4000-8000-${suffix.padStart(12, "0")}`;

export const athenaDemoIds = {
  professorRuiz: uuid("1"),
  course: uuid("a01"),
  class: uuid("c01"),
  students: {
    lucia: uuid("101"),
    mateo: uuid("102"),
    sofia: uuid("103"),
    diego: uuid("104"),
    valeria: uuid("105"),
    andres: uuid("106"),
    camila: uuid("107"),
    nicolas: uuid("108"),
  },
  topics: {
    fractions: uuid("b01"),
    geometry: uuid("b02"),
    functions: uuid("b03"),
    statistics: uuid("b04"),
    probability: uuid("b05"),
    criticalThinking: uuid("b06"),
  },
} as const;
