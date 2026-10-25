import english from "./locales/en.json";
import spanish from "./locales/es.json";
import contentKeys from "./locales/content.json";
const contentMessages: Record<string, string> = contentKeys;

/** One application-wide choice for server rendering, UI copy, and demo content. */
export const appLocale: "en" | "es" = process.env.NEXT_PUBLIC_ATHENA_LOCALE === "es" ? "es" : "en";
type Locale = "en" | "es";
const catalogs: Record<Locale, Record<string, string>> = { en: english, es: spanish };
const presentationFields = new Set([
  "title",
  "summary",
  "body",
  "label",
  "name",
  "reason",
  "recommendedAction",
  "nextAction",
  "message",
]);

/** Catalog lookup with named/numbered placeholders; unknown authored content is preserved. */
export function t(
  message: string,
  values: Record<string, string | number> = {},
  locale: Locale = appLocale,
): string {
  const key = contentMessages[message] ?? message;
  const text = catalogs[locale][key] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));
}

/** Localize known demo presentation fields without changing identifiers or API contracts. */
export function localizeContent<T>(value: T, locale: Locale = appLocale): T {
  if (Array.isArray(value)) return value.map((item) => localizeContent(item, locale)) as T;
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      typeof item === "string" && presentationFields.has(key)
        ? t(item, {}, locale)
        : typeof item === "object"
          ? localizeContent(item, locale)
          : item,
    ]),
  ) as T;
}
