import { strict as assert } from "node:assert";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { NodeIO, getBounds } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  RADIUS,
  TAU,
  MERIDIAN,
  advance,
  arcDistance,
  canOccupy,
  direction,
  doorDirection,
  dot,
  houseObstacles,
  mainLatitude,
  pathDistance,
  plots,
  scatter,
  surfaceRadius,
  tangent,
  bridges,
  landmarks,
  walkingRadius,
  HOUSE_FOOTPRINT,
  lakes,
  mountains,
  mountainHeight,
  WATER_LEVEL,
  HOUSE_SCALE,
  buildingObstacle,
  waterDepth,
  type Vec,
} from "../src/village/layout";
import { SphericalWalker } from "../src/village/walker";

test("a complete spherical circuit returns to the same point and heading", () => {
  for (const start of [direction(0, 0), direction(1, 1.5), direction(-2, -1.5)]) {
    let up = start,
      heading = tangent([0, 1, 0], up);
    const original = heading;
    for (let i = 0; i < 2400; i++) ({ up, heading } = advance(up, heading, (TAU * RADIUS) / 2400));
    assert.ok(arcDistance(up, start) < 0.00001);
    assert.ok(dot(original, heading) > 0.999999);
  }
});

test("walker keeps finite grounded orientation with consistent movement at 30/60/120 fps", () => {
  const results: Vec[] = [];
  for (const fps of [30, 60, 120]) {
    const walker = new SphericalWalker([]);
    walker.up = direction(0, 0);
    walker.forward = [0, 1, 0];
    for (let frame = 0; frame < fps * 50; frame++) {
      walker.step(1 / fps, 0, 1, false);
      assert.ok(walker.position.every(Number.isFinite));
      assert.ok(Math.abs(dot(walker.up, walker.forward)) < 1e-8);
    }
    results.push(walker.up);
  }
  assert.ok(arcDistance(results[0]!, results[1]!) < 0.00001);
  assert.ok(arcDistance(results[1]!, results[2]!) < 0.00001);
});

test("main loop and hemisphere connectors have continuous path coverage", () => {
  for (let i = 0; i <= 720; i++) {
    const angle = (i / 720) * TAU;
    for (const up of [
      direction(angle, mainLatitude(angle)),
      direction(MERIDIAN, angle),
      [Math.cos(angle), Math.sin(angle), 0] as Vec,
    ])
      assert.ok(pathDistance(up) < 0.00001);
  }
});

test("all six topic doors are outside building collision and connected to the paths", () => {
  for (const plot of plots) {
    assert.equal(canOccupy(plot.up, houseObstacles), false);
    assert.equal(canOccupy(doorDirection(plot.slot), houseObstacles), true);
    assert.ok(pathDistance(doorDirection(plot.slot)) < 0.2);
  }
});

test("jump returns to the same grounded surface without falling through the planet", () => {
  const walker = new SphericalWalker([]);
  walker.jump();
  let apex = 0;
  for (let i = 0; i < 240; i++) {
    walker.step(1 / 120, 0, 0, false);
    apex = Math.max(apex, walker.altitude);
  }
  assert.ok(apex > 0.8 && apex < 1.2);
  assert.equal(walker.altitude, 0);
  assert.equal(walker.verticalSpeed, 0);
  assert.ok(Math.abs(Math.hypot(...walker.position) - walkingRadius(walker.up)) < 1e-8);
});

test("obstacles stop sustained input and diagonal movement can slide along them", () => {
  const walker = new SphericalWalker(houseObstacles);
  walker.up = advance(plots[0]!.up, plots[0]!.forward, 6).up;
  walker.forward = tangent(plots[0]!.up, walker.up);
  for (let i = 0; i < 600; i++) walker.step(1 / 60, 0, 1, true);
  assert.ok(canOccupy(walker.up, houseObstacles));
  assert.ok(arcDistance(walker.up, plots[0]!.up) < HOUSE_FOOTPRINT + 0.45);
});

test("bridges meet their banks without discontinuities or submerged decks", () => {
  for (const bridge of bridges) {
    let previous = walkingRadius(advance(bridge.up, bridge.forward, -3.45).up);
    for (let i = 0; i <= 138; i++) {
      const up = advance(bridge.up, bridge.forward, -3.45 + i * 0.05).up;
      const radius = walkingRadius(up);
      assert.ok(radius >= surfaceRadius(up));
      assert.ok(Math.abs(radius - previous) < 0.15);
      previous = radius;
    }
  }
});

test("vegetation distribution is deterministic and preserves walking clearances", () => {
  assert.deepEqual(scatter(100), scatter(100));
  for (const up of scatter(100)) assert.ok(pathDistance(up) >= 2.8);
});

test("lake beds have physical depth and deep water rejects the walker", () => {
  for (const lake of lakes) {
    assert.ok(WATER_LEVEL - surfaceRadius(lake.up) > 1.5);
    assert.equal(canOccupy(lake.up, []), false);
    const walker = new SphericalWalker([]);
    walker.up = advance(lake.up, tangent([1, 0, 0], lake.up), lake.radius + 2).up;
    walker.forward = tangent(lake.up, walker.up);
    if (!canOccupy(walker.up, [])) continue;
    for (let i = 0; i < 600; i++) walker.step(1 / 60, 0, 1, true);
    assert.ok(canOccupy(walker.up, []));
  }
});

test("mountains have raised relief and prevent walking through the steep peaks", () => {
  const peaks = mountains.filter((m) => mountainHeight(m.up) > 2);
  assert.ok(peaks.length >= 3);
  for (const peak of peaks) {
    assert.ok(surfaceRadius(peak.up) > RADIUS + 2);
    assert.equal(canOccupy(peak.up, []), false);
  }
});

test("bridge centres are walkable over deep water", () => {
  for (const bridge of bridges) {
    assert.ok(walkingRadius(bridge.up) > WATER_LEVEL + 0.3);
    assert.ok(canOccupy(bridge.up, []));
  }
});

test("rectangular colliders protect building corners while keeping doors reachable", () => {
  const up = direction(0.4, 0);
  const forward = tangent([0, 1, 0], up);
  const obstacle = { up, radius: 4, forward, halfWidth: 3, halfDepth: 2 };
  assert.equal(canOccupy(advance(up, forward, 1.8).up, [obstacle]), false);
  assert.equal(canOccupy(advance(up, forward, 2.6).up, [obstacle]), true);
});

test("every actual house model leaves its entrance and the main loop walkable at the larger scale", async () => {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  for (const status of ["locked", "available", "in-progress", "done"]) {
    const obstacles = [];
    for (const plot of plots) {
      const path = fileURLToPath(
        new URL(
          `../athena-assets/models/buildings/athena-house-${status}-v${plot.slot}.glb`,
          import.meta.url,
        ),
      );
      const doc = await io.read(path);
      const bounds = getBounds(doc.getRoot().listScenes()[0]!);
      obstacles.push(buildingObstacle(bounds, plot.up, plot.forward, HOUSE_SCALE));
    }
    for (const plot of plots)
      assert.ok(canOccupy(doorDirection(plot.slot), obstacles), `${status} door ${plot.slot}`);
    for (let i = 0; i < 360; i++) {
      const lon = (i / 360) * TAU;
      assert.ok(
        canOccupy(direction(lon, mainLatitude(lon)), obstacles),
        `${status} path at ${lon}`,
      );
    }
  }
});

test("dry public paths have gentle ground instead of tangent-foundation spikes", () => {
  for (let i = 0; i < 360; i++)
    for (let j = 0; j < 90; j++) {
      const up = direction((i / 360) * TAU, (j / 90) * Math.PI - Math.PI / 2);
      if (pathDistance(up) > 1.5 || waterDepth(up) > 0.001) continue;
      for (const heading of [
        [1, 0, 0],
        [0, 1, 0],
      ] as Vec[]) {
        const next = advance(up, heading, 0.08).up;
        if (waterDepth(next) > 0.001) continue;
        assert.ok(
          Math.abs(surfaceRadius(next) - surfaceRadius(up)) / 0.08 < 0.3,
          "a dry path must not grow a foundation ridge",
        );
      }
    }
});

test("jumping lands on a supplied terrace floor instead of dropping through it", () => {
  const walker = new SphericalWalker([], () => RADIUS + 1.5);
  walker.jump();
  for (let i = 0; i < 240; i++) walker.step(1 / 120, 0, 0, false);
  assert.equal(walker.altitude, 0);
  assert.ok(Math.abs(Math.hypot(...walker.position) - (RADIUS + 1.5)) < 1e-8);
});

test("bridge decks and both approaches clear every building and foundation", async () => {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const obstacles = [];
  for (const plot of [
    ...plots.map((p) => ({ ...p, id: `house-done-v${p.slot}`, scale: HOUSE_SCALE })),
    ...landmarks.map((p) => ({ ...p, id: `building-${p.id}` })),
  ]) {
    const path = fileURLToPath(
      new URL(`../athena-assets/models/buildings/athena-${plot.id}.glb`, import.meta.url),
    );
    const doc = await io.read(path);
    const bounds = getBounds(doc.getRoot().listScenes()[0]!);
    // Include the connected terrace and its approach steps, not just the wall collider.
    bounds.min[0] -= 0.12 / plot.scale;
    bounds.min[2] -= 0.12 / plot.scale;
    bounds.max[0] += 0.12 / plot.scale;
    bounds.max[2] += 1.32 / plot.scale;
    obstacles.push(buildingObstacle(bounds, plot.up, plot.forward, plot.scale));
  }
  for (const [index, bridge] of bridges.entries())
    for (let along = -6; along <= 6; along += 0.2) {
      const up = advance(bridge.up, bridge.forward, along).up;
      assert.ok(canOccupy(up, obstacles), `crossing ${index}, ${along.toFixed(1)}m`);
      assert.ok(pathDistance(up) < 0.1, "crossings continue along public paths");
    }
});
