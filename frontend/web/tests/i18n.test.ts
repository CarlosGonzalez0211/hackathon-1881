import assert from "node:assert/strict";
import test from "node:test";
import { demoHouseContent } from "@athena/shared";
import { appLocale, localizeContent, t } from "../src/lib/i18n";
import english from "../src/lib/locales/en.json";
import spanish from "../src/lib/locales/es.json";

test("English is the default and both languages interpolate names and counts", () => {
  assert.equal(appLocale, process.env.NEXT_PUBLIC_ATHENA_LOCALE === "es" ? "es" : "en");
  assert.equal(
    t("Your planet, {0}: back to your world", { 0: "Lucía" }, "en"),
    "Your planet, Lucía: back to your world",
  );
  assert.equal(
    t("Your planet, {0}: back to your world", { 0: "Lucía" }, "es"),
    "Tu planeta, Lucía: volver a tu mundo",
  );
  assert.equal(t("{0} planets", { 0: 12 }, "es"), "12 planetas");
  assert.equal(t("Cancel", {}, "es"), "Cancelar");
});

test("demo lesson content localizes without changing IDs, files, numbers, or source data", () => {
  const original = demoHouseContent["topic-geometry"]!;
  const before = structuredClone(original);
  const translated = localizeContent(original, "en");
  assert.equal(translated.title, "Geometry");
  assert.equal(translated.materials[0]!.title, "Unit 2: Geometry");
  assert.equal(translated.materials[0]!.id, original.materials[0]!.id);
  assert.equal(translated.materials[0]!.pageCount, original.materials[0]!.pageCount);
  assert.match(translated.resources[0]!.body!, /two equal triangles/);
  assert.deepEqual(original, before);
  assert.equal(localizeContent(original, "es").title, "Geometría");
  assert.equal(
    localizeContent({ title: "Teacher-authored material", topicId: "Geometría" }, "en").topicId,
    "Geometría",
  );
  assert.equal(t("Teacher-authored material", {}, "en"), "Teacher-authored material");
});

test("English and Spanish catalogs keep all placeholders aligned", () => {
  for (const [key, translation] of Object.entries(spanish)) {
    assert.ok(key in english, `Missing English key: ${key}`);
    const placeholders = (text: string) =>
      [...text.matchAll(/\{\w+\}/g)].map((match) => match[0]).sort();
    assert.deepEqual(placeholders(translation), placeholders(key), key);
  }
});
