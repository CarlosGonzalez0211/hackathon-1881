import assert from "node:assert/strict";
import test from "node:test";
import { installAthena } from "../src/athena/install";
import { createAthenaGltfLoader } from "../src/loaders/athena-gltf-loader";
import type { LegacyContext } from "../src/runtime/legacy-context";

/** Minimal stand-ins for the recovered Three classes the loader touches. */
const disposed: string[] = [];
class FakeTexture {
  readonly isTexture = true;
  constructor(readonly name: string) {}
  dispose() {
    disposed.push(`texture:${this.name}`);
  }
}
class FakeMaterial {
  opacity = 1;
  constructor(
    readonly name: string,
    readonly map?: FakeTexture,
  ) {}
  clone() {
    return new FakeMaterial(this.name, this.map);
  }
  dispose() {
    disposed.push(`material:${this.name}`);
  }
}
class FakeGeometry {
  constructor(readonly name: string) {}
  dispose() {
    disposed.push(`geometry:${this.name}`);
  }
}
class FakeNode {
  readonly children: FakeNode[] = [];
  constructor(
    readonly isMesh = false,
    public material?: FakeMaterial | FakeMaterial[],
    readonly geometry?: FakeGeometry,
  ) {}
  add(child: FakeNode) {
    this.children.push(child);
    return this;
  }
  traverse(callback: (node: FakeNode) => void) {
    callback(this);
    for (const child of this.children) child.traverse(callback);
  }
  // Like Object3D.clone: new nodes, same material/geometry references.
  clone(): FakeNode {
    const copy = new FakeNode(this.isMesh, this.material, this.geometry);
    for (const child of this.children) copy.add(child.clone());
    return copy;
  }
}

const shared = new FakeTexture("albedo");
let parses = 0;
const scope = {
  GLTFLoader: class {
    setMeshoptDecoder() {}
    async loadAsync() {
      parses++;
      const scene = new FakeNode()
        .add(new FakeNode(true, new FakeMaterial("body", shared), new FakeGeometry("body")))
        .add(
          new FakeNode(
            true,
            [new FakeMaterial("a", shared), new FakeMaterial("b")],
            new FakeGeometry("multi"),
          ),
        );
      return { scene, animations: [] };
    }
  },
} as LegacyContext;

const meshes = (root: FakeNode) => {
  const found: FakeNode[] = [];
  root.traverse((node) => node.isMesh && found.push(node));
  return found;
};

test("loadSceneFromGlb clones materials per call and keeps geometry/textures shared", async () => {
  const loader = createAthenaGltfLoader(scope);
  const [first, second] = await Promise.all([
    loader.loadSceneFromGlb("/athena/a.glb"),
    loader.loadSceneFromGlb("/athena/a.glb"),
  ]);
  const cached = (await loader.load("/athena/a.glb")).scene as FakeNode;
  assert.equal(parses, 1);
  const [cachedBody, cachedMulti] = meshes(cached);
  const [firstBody, firstMulti] = meshes(first.scene as FakeNode);
  const [secondBody] = meshes(second.scene as FakeNode);
  assert.notEqual(firstBody!.material, cachedBody!.material);
  assert.notEqual(firstBody!.material, secondBody!.material);
  assert.ok(Array.isArray(firstMulti!.material));
  assert.equal((firstMulti!.material as FakeMaterial[]).length, 2);
  (firstMulti!.material as FakeMaterial[]).forEach((material, index) =>
    assert.notEqual(material, (cachedMulti!.material as FakeMaterial[])[index]),
  );
  (firstBody!.material as FakeMaterial).opacity = 0.5;
  assert.equal((cachedBody!.material as FakeMaterial).opacity, 1);
  assert.equal((firstBody!.material as FakeMaterial).map, shared);
  assert.equal(firstBody!.geometry, cachedBody!.geometry);

  disposed.length = 0;
  loader.clear();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(disposed.sort(), [
    "geometry:body",
    "geometry:multi",
    "material:a",
    "material:b",
    "material:body",
    "texture:albedo",
  ]);
  await loader.load("/athena/a.glb");
  assert.equal(parses, 2);
});

test("installAthena degrades when scope.GLTFLoader is missing", async () => {
  const warn = console.warn;
  const warnings: unknown[] = [];
  console.warn = (...args: unknown[]) => warnings.push(args[0]);
  try {
    const bare: LegacyContext = {};
    const installation = await installAthena(bare, {
      lifecycle: {} as never,
      athenaAssets: true,
    });
    assert.equal(installation.enabled, false);
    assert.equal(bare.athena, installation);
    assert.equal(warnings.length, 1);
    await assert.rejects(installation.gltf.loadSceneFromGlb("/athena/a.glb"), /unavailable/);
    installation.dispose();
  } finally {
    console.warn = warn;
  }
});
