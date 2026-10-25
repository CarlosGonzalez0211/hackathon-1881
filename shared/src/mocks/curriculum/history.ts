import { demoCourse, demoSource, demoTopics } from "./sources.js";

export const demoHistoryCourse = demoCourse(
  "course-history-1",
  "prof-rivera",
  "Atlantic Revolutions: Rights, Citizenship, and Change, 1750–1850",
  "Introductory demo survey using authored teaching notes; English and Spanish source sections.",
  "en",
);
export const demoHistoryTopics = demoTopics(demoHistoryCourse, [
  ["topic-historical-evidence", "Historical evidence and chronology", []],
  [
    "topic-atlantic-context",
    "Atlantic societies and political ideas",
    ["topic-historical-evidence"],
  ],
  ["topic-american-revolution", "American Revolution", ["topic-atlantic-context"]],
  ["topic-french-revolution", "French Revolution", ["topic-atlantic-context"]],
  [
    "topic-haitian-revolution",
    "Haitian Revolution",
    ["topic-atlantic-context", "topic-french-revolution"],
  ],
  [
    "topic-comparing-rights",
    "Comparing rights and citizenship",
    ["topic-american-revolution", "topic-french-revolution", "topic-haitian-revolution"],
  ],
]);
const declaration = {
  title: "National Archives: Declaration of Independence transcription",
  url: "https://www.archives.gov/founding-docs/declaration-transcript",
};
const france = {
  title: "Office of the Historian: French Revolution, 1789–1799 (retired historical overview)",
  url: "https://history.state.gov/milestones/1784-1800/french-rev",
};
const haiti = {
  title: "Office of the Historian: Haitian Revolution, 1791–1804 (retired historical overview)",
  url: "https://history.state.gov/milestones/1784-1800/haitian-rev",
};
// Paraphrased teaching text, never a quotation or fabricated archival document.
export const demoHistorySources = [
  demoSource(demoHistoryCourse, demoHistoryTopics[0]!, "notes", [
    {
      section: "Reading method",
      text: "For this course, identify the author, date, audience, and purpose of a document before comparing claims. Put events in chronological order, but do not treat sequence alone as proof of causation. These are instructor-defined study practices.",
    },
  ]),
  demoSource(
    demoHistoryCourse,
    demoHistoryTopics[1]!,
    "reading",
    [
      {
        section: "Rights and Atlantic connections",
        text: "The 1776 American declaration argued for political separation from Britain and for government based on consent. Before Haitian independence, Saint-Domingue was a French colony with an economy dependent on enslaved labor. Compare political claims with the conditions in which people lived.",
      },
    ],
    [declaration, haiti],
  ),
  demoSource(
    demoHistoryCourse,
    demoHistoryTopics[2]!,
    "notes",
    [
      {
        section: "Declaration in 1776",
        text: "The American Declaration of Independence is dated July 4, 1776. It announced separation from Britain and argued that governments derive legitimate power from the consent of the governed. This describes the declaration's claims, not proof that equal rights were available to everyone.",
      },
      {
        section: "Declaración de 1776",
        locale: "es",
        text: "La Declaración de Independencia estadounidense tiene fecha del 4 de julio de 1776. Anunció la separación de Gran Bretaña y defendió el consentimiento de los gobernados. Una afirmación de derechos no demuestra por sí sola igualdad en la práctica.",
      },
    ],
    [declaration],
  ),
  demoSource(
    demoHistoryCourse,
    demoHistoryTopics[3]!,
    "slides",
    [
      {
        section: "French Revolution overview",
        text: "The French Revolution lasted from 1789 to 1799. Political change in France influenced debate in the United States. The revolution also affected the French colony of Saint-Domingue, where different groups contested political authority and civil rights.",
      },
    ],
    [france, haiti],
  ),
  demoSource(
    demoHistoryCourse,
    demoHistoryTopics[4]!,
    "reading",
    [
      {
        section: "Saint-Domingue and revolution",
        text: "Before independence, Haiti was the French colony of Saint-Domingue. An uprising by enslaved people began in northern Saint-Domingue in 1791. The Haitian Revolution ran from 1791 to 1804 and led to an independent Haiti. Enslaved people acted to challenge their conditions; this was not simply a copy of events in France.",
      },
      {
        section: "Saint-Domingue y revolución",
        locale: "es",
        text: "Antes de la independencia, Haití era la colonia francesa de Saint-Domingue. En 1791 comenzó una rebelión de personas esclavizadas en el norte de la colonia. La Revolución haitiana se desarrolló entre 1791 y 1804 y dio lugar a un Haití independiente.",
      },
    ],
    [haiti],
  ),
  demoSource(
    demoHistoryCourse,
    demoHistoryTopics[5]!,
    "timeline",
    [
      {
        section: "Comparative chronology",
        text: "Study timeline: 1776, American Declaration of Independence; 1789–1799, French Revolution; 1791–1804, Haitian Revolution. The French and Haitian revolutions overlapped. Political independence and equal participation are different questions: compare a document's claims with evidence about who could exercise rights.",
      },
      {
        section: "Cronología comparada",
        locale: "es",
        text: "Cronología de estudio: 1776, Declaración de Independencia estadounidense; 1789–1799, Revolución francesa; 1791–1804, Revolución haitiana. Las revoluciones francesa y haitiana coincidieron en el tiempo. Compara las afirmaciones sobre derechos con evidencia de su ejercicio.",
      },
    ],
    [declaration, france, haiti],
  ),
];
