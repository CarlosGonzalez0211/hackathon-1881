import {
  generatedResourceSchema,
  type Citation,
  type GeneratedResource,
} from "../../../../shared/src/curriculum.js";
import { demoCurriculum } from "../../../../shared/src/mocks/demo-curriculum.js";

export interface HistoryResourceBlock {
  kind: "academic" | "framing";
  label: string;
  body: string;
  citations: Citation[];
}
export interface HistoryResourceContent {
  title: string;
  representation: "script" | "lyrics" | "slide_outline";
  provenance: "authored_demo";
  playable: false;
  blocks: HistoryResourceBlock[];
}
export type HistoryMockResource = GeneratedResource & { structuredContent: HistoryResourceContent };

function authorResources(locale: "en" | "es"): HistoryMockResource[] {
  const chunk = demoCurriculum.chunks.find(
    (c) => c.topicId === "topic-comparing-rights" && c.locale === locale,
  )!;
  const material = demoCurriculum.materials.find((m) => m.id === chunk.materialId)!;
  const facts =
    locale === "en"
      ? [
          "1776, American Declaration of Independence",
          "1789–1799, French Revolution",
          "1791–1804, Haitian Revolution",
          "The French and Haitian revolutions overlapped.",
          "Political independence and equal participation are different questions: compare a document's claims with evidence about who could exercise rights.",
        ]
      : [
          "1776, Declaración de Independencia estadounidense",
          "1789–1799, Revolución francesa",
          "1791–1804, Revolución haitiana",
          "Las revoluciones francesa y haitiana coincidieron en el tiempo.",
          "Compara las afirmaciones sobre derechos con evidencia de su ejercicio.",
        ];
  function academic(label: string, excerpt: string): HistoryResourceBlock {
    if (!chunk.text.includes(excerpt))
      throw new Error("History resource claim is not in its authored source");
    return {
      kind: "academic",
      label,
      body: excerpt,
      citations: [
        {
          materialId: material.id,
          materialTitle: material.title,
          chunkId: chunk.id,
          section: chunk.section,
          excerpt,
        },
      ],
    };
  }
  const framing = (label: string, body: string): HistoryResourceBlock => ({
    kind: "framing",
    label,
    body,
    citations: [],
  });
  const es = locale === "es";
  const definitions = [
    {
      format: "podcast" as const,
      representation: "script" as const,
      title: es
        ? "Tres revoluciones: cronología y preguntas"
        : "Three revolutions: chronology and questions",
      blocks: [
        framing(
          es ? "Presentadora" : "Host",
          es
            ? "Repasemos las notas del curso. ¿Qué fechas aparecen?"
            : "Let's review the course notes. Which dates appear?",
        ),
        ...facts.slice(0, 3).map((fact) => academic(es ? "Copresentador" : "Co-host", fact)),
        academic(es ? "Presentadora" : "Host", facts[3]!),
        framing(
          es ? "Pregunta" : "Question",
          es
            ? "¿Por qué debemos comparar las afirmaciones con la evidencia?"
            : "Why should we compare claims with evidence?",
        ),
        academic(es ? "Copresentador" : "Co-host", facts[4]!),
      ],
    },
    {
      format: "music" as const,
      representation: "lyrics" as const,
      title: es ? "Estribillo de la cronología" : "Chronology memory refrain",
      blocks: [
        framing(
          es ? "Estribillo original" : "Original refrain",
          es ? "Lee, recuerda, vuelve a repasar." : "Read it, recall it, review it again.",
        ),
        ...facts.slice(0, 3).map((fact) => academic(es ? "Verso" : "Verse", fact)),
        framing(
          es ? "Repetición" : "Repeat",
          es ? "Lee, recuerda, vuelve a repasar." : "Read it, recall it, review it again.",
        ),
        academic(es ? "Cierre" : "Closing line", facts[3]!),
      ],
    },
    {
      format: "slides" as const,
      representation: "slide_outline" as const,
      title: es
        ? "Guion de diapositivas: comparar revoluciones"
        : "Slide outline: comparing revolutions",
      blocks: [
        ...facts
          .slice(0, 3)
          .map((fact, i) => academic(`${es ? "Diapositiva" : "Slide"} ${i + 1}`, fact)),
        academic(
          es ? "Diapositiva 4: coincidencia temporal" : "Slide 4: overlapping dates",
          facts[3]!,
        ),
        academic(es ? "Diapositiva 5: comparar derechos" : "Slide 5: comparing rights", facts[4]!),
        framing(
          es ? "Pregunta para discutir" : "Discussion prompt",
          es
            ? "¿Qué evidencia buscarías para ampliar la comparación?"
            : "What evidence would you look for to extend the comparison?",
        ),
      ],
    },
  ];
  return definitions.map(({ format, representation, title, blocks }) => {
    const citations = blocks.flatMap((block) => block.citations);
    const parsed = generatedResourceSchema.parse({
      id: `resource-history-comparison-${format}-${locale}`,
      courseId: "course-history-1",
      topicId: "topic-comparing-rights",
      curriculumVersion: 1,
      format,
      locale,
      status: "approved",
      structuredContent: {
        title,
        representation,
        provenance: "authored_demo",
        playable: false,
        blocks,
      },
      citations,
    });
    // Explicit local mock representation; shared generated-resource schema remains unchanged.
    return {
      ...parsed,
      structuredContent: {
        title,
        representation,
        provenance: "authored_demo",
        playable: false,
        blocks,
      },
    };
  });
}

/** Mock approval only, never a claim that a real instructor reviewed these examples. */
export const historyMockResources: readonly HistoryMockResource[] = [
  ...authorResources("en"),
  ...authorResources("es"),
];
