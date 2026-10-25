import assert from "node:assert/strict";
import test from "node:test";
import { demoCurriculumContextResponse } from "@athena/shared";
import { learningOptionsFor } from "../src/learning.js";

test("Learning composition keeps mock mode deterministic", () => {
  assert.deepEqual(learningOptionsFor(undefined, "mock"), {});
});

test("Learning composition installs the configured text generator in real AI mode", async () => {
  const options = learningOptionsFor(undefined, "real", {
    async generate({ system, user }) {
      assert.match(system, /professor-approved sources/);
      assert.match(user, /Explain triangle area/);
      return "A grounded explanation from the configured provider.";
    },
  });
  assert.ok(options.tutorProvider);
  const source = demoCurriculumContextResponse.chunks[0]!;
  const result = await options.tutorProvider.respond({
    objective: "Explain triangle area",
    strategy: "worked_example",
    evidence: [{ text: source.text, citation: source.citation }],
    studentMessage: "Why do we divide by two?",
    mode: "message",
  });
  assert.equal(result.content, "A grounded explanation from the configured provider.");
  assert.deepEqual(result.citations, [source.citation]);
});
