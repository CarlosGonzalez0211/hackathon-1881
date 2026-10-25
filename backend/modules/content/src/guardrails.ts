import type { ContentFlagCategory, Locale } from "@athena/shared";

export type GuardrailCategory = ContentFlagCategory | "ok";

export interface GuardrailVerdict {
  category: GuardrailCategory;
  confidence: number;
}

export interface GuardrailInput {
  message: string;
  locale: Locale;
}

/** Decides what kind of request a student message is before anything is retrieved. */
export interface GuardrailClassifier {
  classify(input: GuardrailInput): Promise<GuardrailVerdict>;
}

/** Below this, a model verdict is treated as ok. Heuristic hits are always 0.9. */
export const GUARDRAIL_MIN_CONFIDENCE = 0.7;

// Patterns run on lowercased, accent-folded text, so they are written without accents.
const RULES: { category: ContentFlagCategory; patterns: RegExp[] }[] = [
  {
    category: "self_harm",
    patterns: [
      /\b(kill myself|end my life|want to die|hurt myself|self[- ]?harm|suicid\w*)\b/,
      /\b(quitarme la vida|matarme|hacerme dano|autolesion\w*|no quiero vivir|quiero morir|suicid\w*)\b/,
    ],
  },
  {
    category: "prompt_injection",
    patterns: [
      /\b(ignore|disregard|forget)\b.{0,20}\b(previous|prior|above|all|your)\b.{0,20}\b(instructions|rules|prompt)\b/,
      /\b(system|developer) (prompt|message|instructions)\b/,
      /\b(reveal|show|print|repeat)\b.{0,15}\b(your|the) (prompt|instructions|rules)\b/,
      /\b(jailbreak|dan mode)\b/,
      /\b(ignora|olvida|omite)\b.{0,25}\b(instrucciones|reglas|indicaciones)\b/,
      /\b(prompt|instrucciones|mensaje) del sistema\b/,
      /\b(revela|muestra|dime|repite)\b.{0,15}\b(tu|tus|el|las) (prompt|instrucciones|reglas)\b/,
    ],
  },
  {
    category: "graded_work",
    patterns: [
      /\b(do|write|solve|complete|finish|answer)\b.{0,30}\b(my|the|this)\b.{0,20}\b(homework|assignment|essay|exam|test|quiz|worksheet)\b/,
      /\banswers? (to|for) (the|my|this|tomorrow'?s) (exam|test|quiz|homework|assignment)\b/,
      /\b(haz|hazme|resuelve|resuelveme|escribe|escribeme|contesta|contestame|responde|termina|terminame)\b.{0,30}\b(mi|la|el|este|esta|los|las)\b.{0,20}\b(tarea|ensayo|examen|prueba|quiz|ejercicios?|trabajo)\b/,
      /\brespuestas? (del|de la|para el|para la|de mi) (examen|prueba|tarea|quiz)\b/,
    ],
  },
  {
    category: "unsafe",
    patterns: [
      /\b(make|build|create)\b.{0,10}\b(a )?(bomb|explosive|weapon|poison)\b/,
      /\bhow to (hack|steal|stalk)\b/,
      /\b(fabricar|hacer|construir|crear)\b.{0,10}\b(una |un )?(bomba|explosivo|arma|veneno)\b/,
      /\bcomo (hackear|robar|acosar)\b/,
    ],
  },
];

const fold = (text: string) =>
  text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ");

/** Deterministic Spanish and English rules. This is the whole classifier in mock mode. */
export class HeuristicGuardrailClassifier implements GuardrailClassifier {
  async classify({ message }: GuardrailInput): Promise<GuardrailVerdict> {
    const text = fold(message);
    for (const rule of RULES) {
      if (rule.patterns.some((pattern) => pattern.test(text))) {
        return { category: rule.category, confidence: 0.9 };
      }
    }
    return { category: "ok", confidence: 1 };
  }
}

/**
 * Heuristics first, then an optional model classifier for what rules cannot see (off-topic,
 * paraphrased misuse). Errors propagate: the chat fails closed and abstains.
 */
export class LayeredGuardrailClassifier implements GuardrailClassifier {
  constructor(
    private readonly heuristics: GuardrailClassifier = new HeuristicGuardrailClassifier(),
    private readonly model?: GuardrailClassifier,
  ) {}

  async classify(input: GuardrailInput): Promise<GuardrailVerdict> {
    const first = await this.heuristics.classify(input);
    if (first.category !== "ok" || !this.model) return first;
    const verdict = await this.model.classify(input);
    return verdict.confidence >= GUARDRAIL_MIN_CONFIDENCE
      ? verdict
      : { category: "ok", confidence: verdict.confidence };
  }
}
