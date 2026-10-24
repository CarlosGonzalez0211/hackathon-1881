import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

test("serialized Basis texture worker remains independent of the module registry", async () => {
  const source = await readFile(
    new URL(
      "../../frontend/engine3d/src/extracted/runtime/support/1348-initialize-1348.js",
      import.meta.url,
    ),
    "utf8",
  );
  const registry = { KTX2Loader: {} };
  vm.runInNewContext(source.replace("export function", "function") + ";step1348(scope)", {
    scope: registry,
  });
  const workerSource = registry.KTX2Loader.BasisWorker.toString();
  assert.doesNotMatch(workerSource, /scope\./);
  let subscribed = false;
  vm.runInNewContext("(" + workerSource + ")()", {
    _EngineFormat: {},
    _EngineType: {},
    _TranscoderFormat: {},
    _BasisFormat: {},
    self: {
      addEventListener(type) {
        assert.equal(type, "message");
        subscribed = true;
      },
    },
  });
  assert.equal(subscribed, true);
});
