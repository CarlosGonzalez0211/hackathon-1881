import assert from "node:assert/strict";
import test from "node:test";
import { homeFor } from "../src/features/auth/home.js";

test("students land in the world, staff on the educator dashboard", () => {
  assert.equal(homeFor("student"), "/world");
  assert.equal(homeFor("professor"), "/educator");
  assert.equal(homeFor("admin"), "/educator");
});
