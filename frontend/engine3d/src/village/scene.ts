import type { PlanetState } from "@athena/shared";
import type { AthenaInstallContext } from "../athena/install";
import { ClipPlayer, loadAthenaModel, localBounds, type AthenaModel } from "../athena/models";
import { mergeStaticMeshes } from "../athena/merge";
import type { LegacyContext } from "../runtime/legacy-context";
import { createWater } from "./water";
import { createTerrain } from "./terrain";
import { paintMaterial, windMaterial } from "./look";
import { dressHouse } from "./houses-look";
import { buildAmbience, createBanners } from "./ambience";
import { createGroves, createMeadows, createCloudBelt } from "./botanical";
import { createLivingLandmarks } from "./landscape-life";
import { createWelcomeCourtyard } from "./welcome";
import { createTerrace } from "./terrace";
import { roundedBox, taperedTube } from "./geometry";
import { dressWithCloth, type Cloth } from "./cloth";
import { illuminateLumen } from "./lumen";
import { createSpiritDressing } from "./spirit";
import {
  direction,
  surfacePoint,
  walkingRadius,
  scatter,
  plots,
  houseObstacles,
  landmarks,
  tangent,
  doorDirection,
  bridges,
  advance,
  mul,
  cross,
  arcDistance,
  TAU,
  HOUSE_SCALE,
  canOccupy,
  buildingObstacle,
  buildingClearance,
  pathDistance,
  waterDepth,
  inWelcomeCourtyard,
  dot,
  type Vec,
  type Obstacle,
} from "./layout";
export function orient(scope: LegacyContext, object: LegacyContext, up: Vec, forward: Vec) {
  const y = new scope.Vector3(...up);
  const z = new scope.Vector3(...tangent(forward, up));
  const x = new scope.Vector3().crossVectors(y, z).normalize();
  object.quaternion.setFromRotationMatrix(new scope.Matrix4().makeBasis(x, y, z));
}
/** One draw per source part, irrespective of vegetation count. */
async function instanceModel(
  ctx: AthenaInstallContext,
  root: LegacyContext,
  key: string,
  points: Vec[],
  scale: number,
  breeze?: { value: number },
) {
  if (!points.length) return;
  const s = ctx.scope;
  const model = await loadAthenaModel(ctx, key);
  if (ctx.lifecycle.disposed) return;
  model.root.updateMatrixWorld(true);
  const transform = new s.Object3D(),
    matrix = new s.Matrix4();
  model.root.traverse((part: LegacyContext) => {
    if (!part.isMesh || part.isSkinnedMesh) return;
    const material = breeze ? part.material.clone() : part.material;
    if (breeze) windMaterial(material, breeze);
    const batch = new s.InstancedMesh(part.geometry, material, points.length);
    batch.name = `village-${key.split("/").pop()}-${part.name}`;
    batch.castShadow = !part.userData.athenaInk;
    batch.receiveShadow = !part.userData.athenaInk;
    points.forEach((up, i) => {
      transform.position.set(...surfacePoint(up, -0.025));
      orient(s, transform, up, [Math.sin(i * 2.4), 0.7, Math.cos(i * 2.4)]);
      transform.scale.setScalar(scale * (0.85 + (i % 7) * 0.045));
      transform.updateMatrix();
      matrix.multiplyMatrices(transform.matrix, part.matrixWorld);
      batch.setMatrixAt(i, matrix);
    });
    batch.instanceMatrix.needsUpdate = true;
    batch.computeBoundingSphere();
    root.add(batch);
  });
}
export interface VillageActor {
  id: string;
  root: LegacyContext;
  player: ClipPlayer;
  up: Vec;
  home: Vec;
  forward: Vec;
  patrol: boolean;
  name: string;
  travel: number;
  travelSign: number;
  /** Signature cape (people only; animals, Lumen and the study trio go without). */
  cloth?: Cloth;
}
const CAPELESS = new Set(["lumen", "owl-sage", "hare-pip", "study-trio"]);
export async function buildVillage(ctx: AthenaInstallContext, state: PlanetState, low = false) {
  const s = ctx.scope;
  const root = new s.Group();
  root.name = "athena-village";
  const ground = createTerrain(ctx, low);
  const water = createWater(ctx);
  root.add(ground.mesh, water.mesh);
  const cameraObstacles: LegacyContext[] = [];
  const houses = new Map<
    number,
    {
      group: LegacyContext;
      model?: AthenaModel;
      terrace?: LegacyContext;
      status?: string;
      version: number;
    }
  >();
  const actors: VillageActor[] = [];
  const breeze = { value: 0 };
  const terraces: ReturnType<typeof createTerrace>[] = [];
  let ambience: Awaited<ReturnType<typeof buildAmbience>> | undefined;
  let lumenLight: ReturnType<typeof illuminateLumen> | undefined;
  /** Window/beacon materials per house slot, breathing with the topic's status. */
  const lamps = new Map<
    number,
    { materials: { material: LegacyContext; weight: number }[]; base: number; flicker: number }
  >();
  // Learning state reads as light: dark when locked, a soft welcome when available, warm
  // flickering lamplight in progress and a golden blaze once done (HDR, so it blooms).
  const LAMP: Record<string, { base: number; flicker: number }> = {
    locked: { base: 0, flicker: 0 },
    available: { base: 0.9, flicker: 0.08 },
    in_progress: { base: 1.7, flicker: 0.35 },
    done: { base: 2.2, flicker: 0.12 },
  };
  function lightWindows(slot: number, model: AthenaModel, status: string) {
    const materials: { material: LegacyContext; weight: number }[] = [];
    model.root.traverse((part: LegacyContext) => {
      if (!part.isMesh) return;
      for (const material of Array.isArray(part.material) ? part.material : [part.material]) {
        const name = String(material?.name);
        // Windows carry the glow; lanterns follow, beacons, gilt trim and vine buds accent it.
        const weight = /window_glow/.test(name)
          ? 1
          : /lantern_glow/.test(name)
            ? 0.6
            : /beacon/.test(name)
              ? 0.35
              : /gilt/.test(name)
                ? 0.2
                : /vine_bloom/.test(name)
                  ? 0.15
                  : 0;
        if (weight && material.emissive) materials.push({ material, weight });
      }
    });
    const lamp = LAMP[status] ?? LAMP.available!;
    dressHouse(model, status, breeze);
    lamps.set(slot, { materials, ...lamp });
    for (const { material, weight } of materials) material.emissiveIntensity = lamp.base * weight;
  }
  const groves = [
    direction(-0.8, 0.95),
    direction(0.8, -1.05),
    direction(2, -0.7),
    direction(-2, 0.6),
    direction(2.7, 0.8),
  ];
  const forest = scatter(360)
    .filter((up, i) => i % 2 === 0 || groves.some((center) => arcDistance(up, center) < 10))
    .slice(0, low ? 100 : 260);
  const rocks = scatter(low ? 15 : 35, 52);
  const obstacles: Obstacle[] = [
    ...houseObstacles.map((p) => ({ ...p })),
    ...forest.map((up) => ({ up, radius: 0.6 })),
    ...rocks.map((up) => ({ up, radius: 0.65 })),
  ];
  const tasks: Promise<unknown>[] = [];
  /**
   * Ground-level footprint: only geometry in the lower part of the model counts, so roof
   * eaves, awnings and signs no longer push the invisible wall out past the real walls.
   */
  const footprint = (root: LegacyContext) => {
    const full = localBounds(s, root);
    const cut = full.min.y + (full.max.y - full.min.y) * 0.32;
    const box = new s.Box3(),
      point = new s.Vector3(),
      toLocal = root.matrixWorld.clone().invert(),
      matrix = new s.Matrix4();
    root.updateMatrixWorld(true);
    root.traverse((child: LegacyContext) => {
      if (!child.isMesh || child.userData.athenaInk || child.isInstancedMesh) return;
      const position = child.geometry.attributes.position;
      if (!position) return;
      matrix.multiplyMatrices(toLocal, child.matrixWorld);
      for (let i = 0; i < position.count; i++) {
        point.fromBufferAttribute(position, i).applyMatrix4(matrix);
        if (point.y <= cut) box.expandByPoint(point);
      }
    });
    return box.isEmpty() ? full : box;
  };
  const fitObstacle = (
    model: AthenaModel,
    up: Vec,
    forward: Vec,
    scale: number,
    obstacle?: Obstacle,
  ) => {
    const bounds = footprint(model.root);
    const fitted = buildingObstacle(
      {
        min: [bounds.min.x, bounds.min.y, bounds.min.z],
        max: [bounds.max.x, bounds.max.y, bounds.max.z],
      },
      up,
      forward,
      scale,
    );
    if (obstacle) Object.assign(obstacle, fitted);
    else obstacles.push(fitted);
  };
  const optional = (promise: Promise<unknown>) =>
    promise.catch((error) =>
      console.warn("[Athena] optional village decoration unavailable", error),
    );
  createGroves(ctx, root, forest, breeze);
  const clouds = createCloudBelt(ctx, root);
  tasks.push(optional(instanceModel(ctx, root, "models/nature/athena-rock-set.glb", rocks, 0.65)));
  for (const plot of plots) {
    const group = new s.Group();
    group.name = `athena-house-${plot.slot}`;
    group.position.set(...surfacePoint(plot.up));
    orient(s, group, plot.up, plot.forward);
    group.scale.setScalar(HOUSE_SCALE);
    root.add(group);
    cameraObstacles.push(group);
    houses.set(plot.slot, { group, version: 0 });
  }
  const fades: { old: LegacyContext; next: LegacyContext; elapsed: number }[] = [];
  let reduced = false;
  async function update(next: PlanetState, initial = false) {
    const present = new Set(next.houses.map((house) => house.slot));
    for (const [slot, house] of houses) house.group.visible = present.has(slot);
    await Promise.all(
      next.houses.map(async (house) => {
        const item = houses.get(house.slot);
        if (!item || item.status === house.status) return;
        const version = ++item.version;
        const model = await loadAthenaModel(ctx, `slot:house/${house.slot}/${house.status}`);
        if (ctx.lifecycle.disposed || version !== item.version) return;
        const previous = item.model;
        item.model = model;
        item.status = house.status;
        item.group.add(model.root);
        paintArchitecture(model.root);
        lightWindows(house.slot, model, house.status);
        const plot = plots[house.slot]!;
        fitObstacle(model, plot.up, plot.forward, HOUSE_SCALE, obstacles[house.slot]);
        if (item.terrace) {
          item.terrace.removeFromParent();
          const collider = cameraObstacles.indexOf(item.terrace);
          if (collider >= 0) cameraObstacles.splice(collider, 1);
          const previous = terraces.findIndex((t) => t.root === item.terrace);
          if (previous >= 0) terraces.splice(previous, 1);
        }
        item.terrace = terrace(model, plot.up, plot.forward, HOUSE_SCALE);
        if (previous) {
          if (initial || reduced || low) previous.root.removeFromParent();
          else {
            ctx.toon.setOpacity(model.root, 0);
            fades.push({ old: previous.root, next: model.root, elapsed: 0 });
          }
        }
      }),
    );
  }
  tasks.push(update(state, true));
  // Explicit placement on the new surface, with landmarks framing the main loop.
  function terrace(model: AthenaModel, up: Vec, forward: Vec, scale: number) {
    const bounds = localBounds(s, model.root);
    const platform = createTerrace(
      ctx,
      up,
      forward,
      {
        min: [bounds.min.x, bounds.min.y, bounds.min.z],
        max: [bounds.max.x, bounds.max.y, bounds.max.z],
      },
      scale,
    );
    terraces.push(platform);
    root.add(platform.root);
    cameraObstacles.push(platform.root);
    ctx.onDispose(() => {
      platform.root.traverse((part: LegacyContext) => {
        if (part.isMesh && !part.userData.athenaInk) part.geometry.dispose();
      });
    });
    return platform.root;
  }
  function paintArchitecture(object: LegacyContext) {
    object.traverse((part: LegacyContext) => {
      if (!part.isMesh || part.userData.athenaInk) return;
      for (const material of Array.isArray(part.material) ? part.material : [part.material])
        paintMaterial(material, "architecture");
    });
  }
  async function place(key: string, up: Vec, forward: Vec, scale = 1) {
    const model = await loadAthenaModel(ctx, key);
    if (ctx.lifecycle.disposed) return;
    if (key.includes("prop-bench")) {
      const bounds = localBounds(s, model.root),
        size = bounds.getSize(new s.Vector3());
      const clearance = Math.hypot(size.x, size.z) * scale * 0.5 + 0.25;
      const clear = (candidate: Vec) =>
        pathDistance(candidate) > 2.0 + clearance &&
        buildingClearance(candidate) > clearance + 0.3 &&
        canOccupy(candidate, obstacles, clearance) &&
        waterDepth(candidate) < 0.01 &&
        !inWelcomeCourtyard(candidate);
      if (!clear(up)) {
        let candidate: Vec | undefined;
        for (let i = 0; i < 96; i++) {
          const angle = i * 2.399963;
          const heading = tangent([Math.cos(angle), Math.sin(angle), Math.sin(angle * 0.7)], up);
          const point = advance(up, heading, 1.3 + Math.floor(i / 16) * 1.2).up;
          if (clear(point)) {
            candidate = point;
            break;
          }
        }
        if (!candidate) return;
        up = candidate;
      }
    }
    const group = new s.Group();
    group.add(model.root);
    group.position.set(...surfacePoint(up));
    orient(s, group, up, forward);
    group.scale.setScalar(scale);
    root.add(group);
    if (key.includes("/buildings/") || key.includes("/props/")) paintArchitecture(model.root);
    if (key.includes("/props/"))
      model.root.traverse((part: LegacyContext) => {
        if (!part.isMesh || part.userData.athenaInk) return;
        for (const material of Array.isArray(part.material) ? part.material : [part.material])
          material.side = s.DoubleSide;
      });
    if (!key.includes("/npcs/") && key !== "new:npc.cat") cameraObstacles.push(group);
    if (/building-(?!gate|stairs|bridge)/.test(key)) fitObstacle(model, up, forward, scale);
    if (/building-(school-hall|library|greenhouse|workshop|observatory|cottage)/.test(key))
      terrace(model, up, forward, scale);
    if (
      /prop-(bench|barrel|crates-books|post-box|potted-plant|notice-board|topic-sign|lamp-post)/.test(
        key,
      )
    )
      fitObstacle(model, up, forward, scale);
    return { model, group };
  }
  for (const landmark of landmarks) {
    tasks.push(
      place(
        `models/buildings/athena-building-${landmark.id}.glb`,
        landmark.up,
        landmark.forward,
        landmark.scale,
      ),
    );
    const side = cross(landmark.forward, landmark.up);
    if (landmark.id === "school-hall" || landmark.id === "workshop") {
      for (const sign of [-1, 1]) {
        const up = advance(advance(landmark.up, landmark.forward, 6).up, side, sign * 3.6).up;
        tasks.push(
          place("models/buildings/athena-building-market-stall.glb", up, mul(side, -sign), 1.25),
        );
      }
      const wellUp = advance(landmark.up, side, 6.5).up;
      tasks.push(place("models/buildings/athena-building-well.glb", wellUp, landmark.forward, 1.4));
    }
  }
  createWelcomeCourtyard(ctx, root, obstacles, cameraObstacles, breeze);
  for (const plot of plots) {
    const side = cross(plot.up, plot.forward);
    const entry = advance(doorDirection(plot.slot), plot.forward, 0.6).up;
    const signUp = advance(entry, side, -1.65).up;
    tasks.push(
      optional(place("models/props/athena-prop-topic-sign.glb", signUp, plot.forward, 0.9)),
    );
    if (!low)
      tasks.push(
        optional(
          place(
            "models/props/athena-prop-lamp-post.glb",
            advance(entry, side, 1.9).up,
            plot.forward,
            0.8,
          ),
        ),
      );
    if (!low) {
      tasks.push(
        optional(
          place(
            "models/props/athena-prop-potted-plant.glb",
            advance(entry, side, -2.5).up,
            plot.forward,
            1.15,
          ),
        ),
      );
      tasks.push(
        optional(
          place(
            plot.slot % 2
              ? "models/props/athena-prop-crates-books.glb"
              : "models/props/athena-prop-post-box.glb",
            advance(entry, side, 3.2).up,
            plot.forward,
            1,
          ),
        ),
      );
      const benchUp = advance(advance(plot.up, plot.forward, 6.8).up, side, -4.4).up;
      tasks.push(
        optional(place("models/props/athena-prop-bench.glb", benchUp, mul(side, -1), 1.15)),
      );
    }
  }
  if (!low) {
    createBanners(ctx, root, breeze, (object, up, forward) => {
      orient(s, object, up, forward);
      cameraObstacles.push(object);
    });
    tasks.push(
      optional(
        buildAmbience(ctx, root).then((value) => {
          ambience = value;
        }),
      ),
    );
  }
  // Wooden bridges follow the exact same arch sampled by the walking controller.
  for (const bridge of bridges) {
    const group = new s.Group();
    group.name = "athena-wooden-bridge";
    const wood = new s.MeshStandardMaterial({ color: "#a07f5f", roughness: 1 });
    const plankShape = roundedBox(s, 2.2, 0.1, 0.22, 0.2, 8);
    const postShape = taperedTube(s, 0.05, 0.065, 0.7, 10, 1);
    const capShape = roundedBox(s, 0.16, 0.12, 0.16, 0.5, 6);
    for (let index = 0; index <= 28; index++) {
      const up = advance(bridge.up, bridge.forward, -3.4 + (index * 6.8) / 28).up;
      const plank = new s.Mesh(plankShape, wood);
      plank.position.set(...mul(up, walkingRadius(up) - 0.045));
      orient(s, plank, up, bridge.forward);
      group.add(plank);
      if (index % 4 === 0)
        for (const side of [-1, 1]) {
          const edge = advance(up, bridge.side, side * 1.1).up;
          const post = new s.Mesh(postShape, wood);
          post.position.set(...mul(edge, walkingRadius(up) + 0.3));
          orient(s, post, edge, bridge.forward);
          const cap = new s.Mesh(capShape, wood);
          cap.position.set(...mul(edge, walkingRadius(up) + 0.68));
          orient(s, cap, edge, bridge.forward);
          group.add(post, cap);
        }
    }
    mergeStaticMeshes(s, group, new Set());
    ctx.toon.apply(group);
    group.traverse((part: LegacyContext) => {
      if (part.isMesh && !part.userData.athenaInk) {
        part.castShadow = true;
        part.receiveShadow = true;
      }
    });
    root.add(group);
    cameraObstacles.push(group);
  }
  if (!low) {
    const npcs = [
      ["mentor-elena", "Elena", -0.25, -0.01, false],
      ["guide-rafa", "Rafa", 1.4, -0.05, true],
      ["gardener-carmen", "Carmen", 0.65, 0.12, false],
      ["headmaster-ilda", "Ilda", 0.48, -0.23, false],
      ["librarian-oscar", "Óscar", -0.62, 0.05, false],
      ["cook-marisol", "Marisol", -0.7, -0.15, false],
      ["builder-ana", "Ana", 2.5, -0.2, false],
      ["builder-leo", "Leo", 2.8, -0.2, true],
      ["engineer-noor", "Noor", 2.65, 0.02, false],
      ["dr-amaia", "Amaia", 1.1, 1.04, true],
      ["dr-bruno", "Bruno", -2.4, 1.04, false],
      ["historian-tomas", "Tomás", -2.1, 0.04, false],
      ["marine-kai", "Kai", 2.55, 0.62, false],
      ["explorer-nico", "Nico", -1.57, -0.42, true],
      ["musician-lia", "Lia", -1.1, 0.04, false],
      ["study-trio", "el grupo de estudio", 0.95, -0.15, false],
      ["visitor-orbi", "Orbi", -2.85, 0.04, true],
      ["owl-sage", "Sage", -1.2, 1.04, false],
      ["hare-pip", "Pip", -2.8, -0.25, true],
      ["lumen", "Lumen", 0, 0, false],
    ].map(([id, name, lon, lat, patrol]) => ({
      id: id as string,
      name: name as string,
      lon: lon as number,
      lat: lat as number,
      patrol: patrol as boolean,
      model: id === "lumen" ? "new:npc.cat" : `models/npcs/athena-npc-${id}.glb`,
    }));
    // Spread neighbours over the whole globe: golden-angle candidates beside the paths, at
    // least 7 m apart, clear of buildings, water and the arrival plaza.
    const spots = new Map<string, Vec>();
    const taken: Vec[] = [];
    const people = npcs.filter((npc) => npc.id !== "lumen");
    for (let n = 0, k = 0; n < 6000 && k < people.length; n++) {
      const latitude = Math.asin(1 - (2 * (n + 0.5)) / 6000);
      const candidate = direction((n * 2.399963) % TAU, latitude);
      const path = pathDistance(candidate);
      if (
        path < 1.1 ||
        path > 2.6 ||
        buildingClearance(candidate) < 1.5 ||
        waterDepth(candidate) > 0.01 ||
        inWelcomeCourtyard(candidate) ||
        !canOccupy(candidate, obstacles, 0.5) ||
        taken.some((other) => arcDistance(other, candidate) < 7)
      )
        continue;
      taken.push(candidate);
      spots.set(people[k++]!.id, candidate);
    }
    for (const npc of npcs)
      tasks.push(
        optional(
          (async () => {
            const up =
              npc.id === "lumen"
                ? direction(0.08, 0.08)
                : (spots.get(npc.id) ?? direction(npc.lon, npc.lat));
            const placed = await place(npc.model, up, [1, 0, 0], npc.id === "lumen" ? 1.1 : 1);
            if (placed) {
              if (npc.id === "lumen") lumenLight = illuminateLumen(ctx, placed.model.root);
              const player = new ClipPlayer(s, placed.model.root, placed.model.animations);
              player.play("idle");
              player.update(actors.length * 0.37);
              actors.push({
                cloth: CAPELESS.has(npc.id) ? undefined : dressWithCloth(ctx, placed.model.root),
                id: npc.id,
                name: npc.name,
                travel: 0,
                travelSign: 1,
                root: placed.group,
                player,
                up,
                home: up,
                forward: tangent([1, 0, 0], up),
                patrol: npc.patrol,
              });
            }
          })(),
        ),
      );
  }
  await Promise.all(tasks);
  const landscapeLife = createLivingLandmarks(ctx, root, obstacles, cameraObstacles);
  if (!ctx.lifecycle.disposed) createMeadows(ctx, root, obstacles, breeze, low);
  const spirit = createSpiritDressing(ctx, root, obstacles, low);
  ctx.onDispose(() => spirit.dispose());
  actors.sort((a, b) => a.id.localeCompare(b.id));
  // Keep NPCs out of solid footprints and water, including after the layout is compacted.
  for (const actor of actors) {
    if (
      !canOccupy(actor.up, obstacles, 0.4) ||
      actors.some((other) => other !== actor && arcDistance(other.up, actor.up) < 1.6)
    ) {
      // Search outward in a spiral around the intended spot, keeping the spread.
      for (let i = 1; i < 120; i++) {
        const angle = i * 2.399963;
        const heading = tangent(
          [Math.cos(angle), Math.sin(angle), Math.sin(angle * 0.7)],
          actor.home,
        );
        const candidate = advance(actor.home, heading, 0.4 * Math.sqrt(i) * 1.6).up;
        if (
          canOccupy(candidate, obstacles, 0.4) &&
          !actors.some((other) => other !== actor && arcDistance(other.up, candidate) < 1.6)
        ) {
          actor.up = candidate;
          actor.home = candidate;
          break;
        }
      }
    }
  }
  return {
    root,
    cameraObstacles,
    obstacles,
    walkingRadius(up: Vec) {
      let radius = walkingRadius(up);
      for (const terrace of terraces)
        for (const floor of terrace.floors) {
          const alignment = dot(up, floor.up);
          if (alignment < 0.85) continue;
          const planeRadius = floor.radius / alignment;
          const x = dot(up, floor.side) * planeRadius,
            z = dot(up, floor.forward) * planeRadius;
          if (x >= floor.x0 && x <= floor.x1 && z >= floor.z0 && z <= floor.z1)
            radius = Math.max(radius, planeRadius);
        }
      return radius;
    },
    actors,
    update,
    setReducedMotion(value: boolean) {
      reduced = value;
    },
    door(slot: number) {
      return surfacePoint(doorDirection(slot));
    },
    roof(slot: number) {
      return surfacePoint(plots[slot]!.up, 10.2);
    },
    tick(dt: number, time: number, onTransition?: (slot: number) => void) {
      water.tick(reduced ? 0 : time);
      ground.tick(reduced ? 0 : time);
      breeze.value = reduced ? 0 : time;
      clouds.tick(reduced ? 0 : time);
      landscapeLife.tick(reduced ? 0 : time);
      ambience?.tick(dt, time, reduced);
      lumenLight?.tick(reduced ? 0 : time);
      spirit.tick(reduced ? 0 : time);
      for (const [slot, lamp] of lamps) {
        const flame = reduced
          ? 0
          : Math.sin(time * 7.1 + slot * 1.7) * 0.5 + Math.sin(time * 12.3 + slot) * 0.3;
        for (const { material, weight } of lamp.materials)
          material.emissiveIntensity = lamp.base * weight * (1 + lamp.flicker * flame);
      }
      for (let i = fades.length - 1; i >= 0; i--) {
        const fade = fades[i]!;
        fade.elapsed += dt;
        const t = reduced ? 1 : Math.min(1, fade.elapsed / 0.9);
        ctx.toon.setOpacity(fade.old, 1 - t);
        ctx.toon.setOpacity(fade.next, t);
        if (t === 1) {
          const parent = fade.next.parent;
          fade.old.removeFromParent();
          fades.splice(i, 1);
          const slot = [...houses].find(([, h]) => h.group === parent)?.[0];
          if (slot !== undefined) onTransition?.(slot);
        }
      }
    },
    dispose() {
      for (const actor of actors) actor.player.dispose();
      ambience?.dispose();
      root.removeFromParent();
    },
  };
}
/** Own generated geometry and materials as well as those returned by merged GLBs. */
export function disposeScene(root: LegacyContext) {
  const geometries = new Set<LegacyContext>(),
    materials = new Set<LegacyContext>();
  root.traverse((object: LegacyContext) => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material)
      for (const material of Array.isArray(object.material) ? object.material : [object.material])
        materials.add(material);
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
}
