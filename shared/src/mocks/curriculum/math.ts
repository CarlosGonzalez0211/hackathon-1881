import { demoCourse, demoSource, demoTopics } from "./sources.js";

export const demoMathCourse = demoCourse(
  "course-math-1",
  "prof-ruiz",
  "Matemáticas I",
  "Currículo de demostración: fundamentos y razonamiento matemático.",
  "es",
);
// Functions remain available after Fractions; Geometry is a recommendation, not a hard gate.
export const demoMathTopics = demoTopics(demoMathCourse, [
  ["topic-fractions", "Fracciones", []],
  ["topic-geometry", "Geometría", ["topic-fractions"]],
  ["topic-functions", "Funciones", ["topic-fractions"]],
  ["topic-statistics", "Estadística", ["topic-functions"]],
  ["topic-probability", "Probabilidad", ["topic-statistics"]],
  ["topic-critical-thinking", "Pensamiento crítico", ["topic-probability", "topic-geometry"]],
]);
const texts: Array<Array<{ section: string; text: string; locale?: "en" | "es" }>> = [
  [
    {
      section: "Partes iguales",
      text: "Una fracción representa partes iguales de un todo. Un medio es equivalente a dos cuartos: 1/2 = 2/4.",
    },
  ],
  [
    {
      section: "Área de triángulos",
      text: "El área de un triángulo es (base × altura perpendicular) / 2. Con base 8 cm y altura 3 cm, el área es 12 cm². Multiplicar solo base por altura daría 24 cm² y omitiría dividir entre dos.",
    },
    {
      section: "Descomposición visual",
      text: "Un rectángulo de base 8 cm y altura 3 cm tiene área 24 cm². Una diagonal lo divide en dos triángulos de igual área; cada triángulo ocupa la mitad: 12 cm². Esta descomposición explica el factor 1/2.",
    },
    {
      section: "Base y altura perpendicular",
      text: "Puedes elegir cualquiera de los lados de un triángulo como base. Desde el vértice opuesto, traza un segmento perpendicular a la recta que contiene esa base: forma un ángulo de 90 grados. La longitud de ese segmento es la altura correspondiente a la base elegida. Si cambias la base, debes identificar de nuevo su altura correspondiente. Un lado inclinado no es la altura a menos que sea perpendicular a la base. La altura puede quedar dentro o fuera del triángulo; prolonga la recta de la base si es necesario. Por ejemplo, si eliges una base de 8 cm y el segmento perpendicular mide 3 cm, usa 3 cm como altura, aunque otro lado mida 5 cm. Para identificar base y altura no necesitas calcular el área.",
    },
  ],
  [
    {
      section: "Reglas de correspondencia",
      text: "Una función asigna exactamente una salida a cada entrada de su dominio. En f(x) = 2x, la entrada 3 produce la salida 6.",
    },
  ],
  [
    {
      section: "Media aritmética",
      text: "La media aritmética se calcula sumando los datos y dividiendo entre su cantidad. Para 2, 4 y 6, la media es (2 + 4 + 6) / 3 = 4.",
    },
  ],
  [
    {
      section: "Resultados equiprobables",
      text: "Con resultados equiprobables, la probabilidad es la cantidad de resultados favorables dividida entre el total. En un dado justo de seis caras, obtener 2 tiene probabilidad 1/6.",
    },
  ],
  [
    {
      section: "Comprobar razonamientos",
      text: "Comprueba las unidades y los pasos de un cálculo. Compara el área de un triángulo con el rectángulo de la misma base y altura para detectar la omisión del factor 1/2.",
    },
  ],
];
export const demoMathSources = demoMathTopics.map((topic, index) =>
  demoSource(demoMathCourse, topic, "notes", texts[index]!),
);
