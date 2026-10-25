import assert from "node:assert/strict";
import test from "node:test";
import { graphics } from "./helpers/recovered-graphics";
import { createGroves, createMeadows, createCloudBelt } from "../src/village/botanical";
import { createWelcomeCourtyard } from "../src/village/welcome";
import { createAtmosphere } from "../src/village/atmosphere";
import { createLivingLandmarks } from "../src/village/landscape-life";
import { ensureAthenaThreeClasses } from "../src/materials/three-shims";
import { createAthenaToon } from "../src/materials/athena-toon-material";
import {
  bridges,
  welcomeCenter,
  tangent,
  surfaceRadius,
  advance,
  canOccupy,
  scatter,
  houseObstacles,
  type Obstacle,
} from "../src/village/layout";
import type { AthenaInstallContext } from "../src/athena/install";
import type { LegacyContext } from "../src/runtime/legacy-context";

test("authored landscape uses recovered primitives, finite instance transforms, and clear bridge approaches", async () => {
  const s = await graphics();
  s.athenaStandardPipeline = true;
  ensureAthenaThreeClasses(s);
  const toon = createAthenaToon(s);
  const ctx = { scope: s, toon } as AthenaInstallContext;
  const root = new s.Group(),
    time = { value: 0 };
  const obstacles: Obstacle[] = [...houseObstacles];
  const groves = createGroves(ctx, root, scatter(16, 923), time);
  createMeadows(ctx, root, obstacles, time, true);
  const clouds = createCloudBelt(ctx, root);
  const life = createLivingLandmarks(ctx, root, obstacles, []);
  root.updateMatrixWorld(true);
  let instances = 0;
  root.traverse((object: LegacyContext) => {
    if (!object.isMesh) return;
    for (const x of object.geometry.attributes.position.array)
      assert.ok(Number.isFinite(x), object.name);
    if (object.isInstancedMesh) {
      instances += object.count;
      for (const x of object.instanceMatrix.array) assert.ok(Number.isFinite(x), object.name);
      assert.ok(object.boundingSphere.radius > 0, `${object.name} has usable culling bounds`);
    }
  });
  assert.ok(instances > 1000, "the environment has real geometric detail");
  assert.equal(groves.canopy.count, 16 * 6);
  assert.ok(root.getObjectByName("athena-working-windmill"), "the moving landmark is placed");
  for (const bridge of bridges)
    for (let meters = -6; meters <= 6; meters += 0.5)
      assert.ok(
        canOccupy(advance(bridge.up, bridge.forward, meters).up, obstacles),
        "landmarks leave crossings clear",
      );
  const rotor = root.getObjectByName("athena-windmill-sails");
  life.tick(0);
  clouds.tick(0);
  assert.ok(rotor.rotation.z === 0);
  life.tick(2);
  clouds.tick(2);
  assert.equal(rotor.rotation.z, -0.56);
  assert.ok(root.getObjectByName("athena-drifting-cloud-belt").rotation.y > 0);
  life.tick(0);
  clouds.tick(0);
  assert.ok(rotor.rotation.z === 0);
  const seen = new Set<LegacyContext>();
  root.traverse((o: LegacyContext) => {
    if (o.geometry && !seen.has(o.geometry)) {
      seen.add(o.geometry);
      o.geometry.dispose();
    }
  });
  toon.dispose();
});

test("walking and overhead cameras share a sky with finite camera-relative framing", async () => {
  const s = await graphics();
  const scene = new s.Scene(),
    camera = new s.PerspectiveCamera(50, 1, 0.1, 260);
  const atmosphere = createAtmosphere({ scope: s } as AthenaInstallContext, scene);
  const sky = scene.getObjectByName("athena-painted-sky"),
    material = sky.material;
  camera.position.set(0, 24, -4);
  camera.up.set(0, 1, 0);
  camera.lookAt(0, 23, 6);
  atmosphere.tick(camera, [0, 1, 0], [0, 0, 1], 7, false, false);
  assert.equal(material.uniforms.uOverview.value, 0);
  assert.equal(material.uniforms.uTime.value, 7);
  camera.position.set(0, 70, -25);
  camera.lookAt(0, 0, 0);
  atmosphere.tick(camera, [0, 1, 0], [0, 0, 1], 7, false, true);
  assert.equal(sky.material, material, "both views keep the same painted sky material");
  assert.equal(material.uniforms.uOverview.value, 1);
  assert.ok(sky.position.distanceTo(camera.position) < 1e-8);
  const axes = ["uViewForward", "uViewUp", "uViewRight"].map((key) => material.uniforms[key].value);
  for (const axis of axes) assert.ok(Math.abs(axis.length() - 1) < 1e-8);
  assert.ok(Math.abs(axes[0].dot(axes[1])) < 1e-8);
  atmosphere.tick(camera, [0, 1, 0], [0, 0, 1], 9, true, true);
  assert.equal(material.uniforms.uTime.value, 0, "reduced motion freezes cloud time in both views");
  scene.traverse((o: LegacyContext) => {
    o.geometry?.dispose();
    o.material?.dispose();
  });
});

test("welcome courtyard has upward paving, clear central passage and no black ground hull", async () => {
  const s = await graphics();
  s.athenaStandardPipeline = true;
  ensureAthenaThreeClasses(s);
  const toon = createAthenaToon(s),
    ctx = { scope: s, toon } as AthenaInstallContext;
  const root = new s.Group(),
    obstacles: Obstacle[] = [],
    cameraObjects: LegacyContext[] = [];
  const gate = createWelcomeCourtyard(ctx, root, obstacles, cameraObjects, { value: 0 });
  assert.equal(cameraObjects.length, 1);
  assert.equal(obstacles.length, 2);
  const forward = tangent([1, 0, 0], welcomeCenter);
  for (let d = -6; d <= 6; d += 0.25)
    assert.ok(
      canOccupy(advance(welcomeCenter, forward, d).up, obstacles),
      "arch centre stays open",
    );
  let floorMeshes = 0;
  gate.traverse((o: LegacyContext) => {
    if (!o.isMesh || o.userData.athenaInk) return;
    const g = o.geometry;
    g.computeBoundingBox();
    for (const v of g.attributes.position.array) assert.ok(Number.isFinite(v));
    if (o.material.side !== s.DoubleSide || g.boundingBox.max.y + o.position.y > 1) return;
    floorMeshes++;
    assert.ok(
      !o.children.some((c: LegacyContext) => c.userData.athenaInk),
      "ground has no inverted ink hull",
    );
    const pos = g.attributes.position,
      normal = g.attributes.normal;
    for (let i = 0; i < normal.count; i++)
      assert.ok(normal.getY(i) > 0.75, "paving normals face the sky");
    for (let i = 0; i < pos.count; i++) {
      const local = new s.Vector3().fromBufferAttribute(pos, i);
      gate.updateMatrixWorld(true);
      local.applyMatrix4(o.matrixWorld);
      const direction = [local.x, local.y, local.z].map(
        (x) => x / local.length(),
      ) as unknown as readonly [number, number, number];
      assert.ok(
        Math.abs(local.length() - surfaceRadius(direction)) < 0.12,
        "courtyard conforms to walking ground",
      );
    }
  });
  assert.ok(floorMeshes >= 2, "courtyard and inset stone bindings are real geometry");
  toon.dispose();
});
