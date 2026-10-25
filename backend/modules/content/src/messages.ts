import type { Locale } from "@athena/shared";

/**
 * Fixed tutor replies. They never come from the model, so refusals and abstentions read the
 * same every time and exist in both languages.
 */
const messages = {
  abstain: {
    es: "El material de esta clase no cubre esa pregunta. Prueba con uno de estos temas o pregúntale a tu profesor.",
    en: "The class material doesn't cover that question. Try one of these topics or ask your professor.",
  },
  offTopic: {
    es: "Solo puedo ayudarte con el material de esta clase. ¿Quieres repasar alguno de estos temas?",
    en: "I can only help with this class's material. Would you like to review one of these topics?",
  },
  gradedWork: {
    es: "No puedo hacer la tarea por ti, pero sí ayudarte a entender el tema con el material de la clase. ¿Qué parte se te complica?",
    en: "I can't do the assignment for you, but I can help you understand the topic with the class material. Which part is giving you trouble?",
  },
  promptInjection: {
    es: "No puedo cambiar mis instrucciones. Con gusto te ayudo con preguntas sobre el material de la clase.",
    en: "I can't change my instructions. I'm happy to help with questions about the class material.",
  },
  unsafe: {
    es: "No puedo ayudar con eso. Si quieres, pregúntame sobre el material de la clase.",
    en: "I can't help with that. Feel free to ask me about the class material.",
  },
  selfHarm: {
    es: "Siento mucho que estés pasando por algo así, y me alegra que lo hayas dicho. No tienes que enfrentarlo a solas: habla hoy con alguien de confianza, como un familiar, tu profesor o el orientador de tu escuela. Si estás en peligro inmediato, llama a los servicios de emergencia de tu país.",
    en: "I'm really sorry you're going through this, and I'm glad you said something. You don't have to face it alone: talk today with someone you trust, like a family member, your professor or your school counselor. If you are in immediate danger, call your local emergency services.",
  },
  rateLimited: {
    es: "Has enviado muchos mensajes. Intenta de nuevo en un momento.",
    en: "You've sent a lot of messages. Please try again in a moment.",
  },
  guideLead: {
    es: "No te daré la respuesta final, pero el material explica la idea clave:",
    en: "I won't give you the final answer, but the material explains the key idea:",
  },
  guideFollowUp: {
    es: "¿Cómo la aplicarías a tu ejercicio?",
    en: "How would you apply it to your exercise?",
  },
  answerLead: {
    es: "Según el material de la clase:",
    en: "According to the class material:",
  },
} satisfies Record<string, Record<Locale, string>>;

export type MessageKey = keyof typeof messages;

export const message = (key: MessageKey, locale: Locale) => messages[key][locale];
