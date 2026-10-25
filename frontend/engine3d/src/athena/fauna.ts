/**
 * Task 10: birds and emotes.
 *
 * Birds: the legacy GPU flocks keep their counts, curves (world paths) and procedural flap,
 * which bends any mesh along its wingspan (+Z) as it flies along +X. Only the bird mesh
 * changes: `birds/1` → athena-bird-swift, `birds/2` → athena-bird-finch, turned to that
 * convention, fitted to the legacy bird's size and coloured from the kit's vertex colours.
 *
 * Emotes (keys 1-0): the legacy emoji system keeps its rate limit, distance check and
 * sounds; its spawn shows `athena-emote-<kind>.glb` instead, at the same point above the
 * head, rising, facing the camera, playing the kit's `pop` clip for 2 s.
 */
import type { LegacyContext } from "../runtime/legacy-context";
import type { AthenaInstallContext } from "./install";
import { ClipPlayer, loadAthenaModel, localBounds, prefersReducedMotion } from "./models";

type Object3D = LegacyContext;

/** Legacy bird geometry request → manifest key (the kit's swift/finch). */
export const birdSlots: Record<string, string> = {
  "birds/1.drc": "geometries/birds/1",
  "birds/2.drc": "geometries/birds/2",
};
/** Emote geometry index (EMOJI_MAP value) → manifest key. */
export const emoteSlot = (geometryIndex: number) => `slot:emote/${geometryIndex}`;
/** Lifetime of a legacy emoji spawn (`expiration: 2`). */
export const EMOTE_SECONDS = 2;

export function installAthenaFauna(ctx: AthenaInstallContext) {
  if (!ctx.enabled) return;
  const { scope } = ctx;

  // Birds: swap the flock geometry, keep the shader (fed vertex colours, not the atlas).
  const load = scope.geometryLoader.load.bind(scope.geometryLoader);
  scope.geometryLoader.load = async (relative: string, ...args: unknown[]) => {
    const key = birdSlots[relative];
    const resolved = key ? ctx.resolve(key) : undefined;
    if (resolved?.kind !== "glb") return load(relative, ...args);
    try {
      const [legacy, athena] = await Promise.all([
        load(relative, ...args),
        ctx.gltf.loadGeometryFromGlb(resolved.url),
      ]);
      return fitBird(scope, legacy, athena);
    } catch (error) {
      console.warn(`[Athena] bird ${relative} kept legacy`, error);
      return load(relative, ...args);
    }
  };
  const birdsInit = scope.birds.prototype.init;
  scope.birds.prototype.init = async function (this: LegacyContext) {
    await birdsInit.call(this);
    const material = this.mesh?.material;
    if (!material || !this.mesh.geometry.attributes.color) return;
    material.vertexShader = material.vertexShader
      .replace(
        "attribute float surfaceId;",
        "attribute float surfaceId;\nattribute vec3 color;\nvarying vec3 vColor;",
      )
      .replace("vUv = uv;", "vUv = uv;\n                        vColor = color;");
    material.fragmentShader = material.fragmentShader
      .replace("varying vec2 vUv;", "varying vec2 vUv;\n                    varying vec3 vColor;")
      .replace("vec3 baseColor = texture(tAtlas, vUv).rgb;", "vec3 baseColor = vColor;");
    material.needsUpdate = true;
  };

  // Emotes: replace what the legacy emoji system spawns.
  const onEvent = scope.emojis$1.prototype.onCharacterNetworkEvent;
  scope.emojis$1.prototype.onCharacterNetworkEvent = function (
    this: LegacyContext,
    event: LegacyContext,
  ) {
    const spawn = this.mesh.spawn;
    let spawned: LegacyContext | undefined;
    this.mesh.spawn = (options: LegacyContext) => {
      spawned = options;
    };
    try {
      onEvent.call(this, event);
    } finally {
      this.mesh.spawn = spawn;
    }
    if (!spawned) return;
    showEmote(ctx, this.scene, spawned).catch((error) => {
      console.warn("[Athena] emote kept legacy", error);
      spawn.call(this.mesh, spawned);
    });
  };
  ctx.onDispose(() => {
    scope.geometryLoader.load = load;
    scope.birds.prototype.init = birdsInit;
    scope.emojis$1.prototype.onCharacterNetworkEvent = onEvent;
  });
}

/**
 * Kit bird (+Z forward, wings along X) → legacy convention (+X forward, wings along +Z),
 * centred and scaled to the legacy bird's length, with a `surfaceId` for the shader.
 */
function fitBird(scope: LegacyContext, legacy: Object3D, athena: Object3D) {
  if (!legacy.boundingBox) legacy.computeBoundingBox();
  athena.rotateY(Math.PI / 2);
  athena.computeBoundingBox();
  const legacySize = legacy.boundingBox.getSize(new scope.Vector3());
  const athenaSize = athena.boundingBox.getSize(new scope.Vector3());
  const scale = Math.max(legacySize.x, legacySize.z) / Math.max(athenaSize.x, athenaSize.z, 1e-6);
  const centre = athena.boundingBox.getCenter(new scope.Vector3());
  athena.translate(-centre.x, -centre.y, -centre.z);
  athena.scale(scale, scale, scale);
  const legacyCentre = legacy.boundingBox.getCenter(new scope.Vector3());
  athena.translate(legacyCentre.x, legacyCentre.y, legacyCentre.z);
  const count = athena.attributes.position.count;
  athena.setAttribute(
    "surfaceId",
    new scope.BufferAttribute(
      new Float32Array(count).fill(legacy.attributes.surfaceId?.getX(0) ?? 0.5),
      1,
    ),
  );
  athena.computeBoundingBox();
  athena.computeBoundingSphere();
  return athena;
}

const emotePool = new WeakMap<LegacyContext, Map<number, Object3D[]>>();

async function showEmote(ctx: AthenaInstallContext, scene: LegacyContext, spawned: LegacyContext) {
  const { scope } = ctx;
  const index = Number(spawned.geometryID);
  const [position, sizeJitter, , , up] = spawned.data as [
    number[],
    number,
    number[],
    number,
    number[],
  ];
  let pool = emotePool.get(scene);
  if (!pool) emotePool.set(scene, (pool = new Map()));
  let free: Object3D | undefined = pool.get(index)?.find((item) => !item.visible);
  if (!free) {
    const model = await loadAthenaModel(ctx, emoteSlot(index));
    const group: Object3D = new scope.Group();
    group.name = `athena-emote-${index}`;
    const box = localBounds(scope, model.root);
    // Bottom of the bubble sits on the spawn point (legacy: just above the head).
    model.root.position.y = -box.min.y;
    group.add(model.root);
    group.userData.player = new ClipPlayer(scope, model.root, model.animations, 0);
    scene.add(group);
    pool.set(index, [...(pool.get(index) ?? []), group]);
    free = group;
  }
  const emote: Object3D = free!;
  const player: ClipPlayer = emote.userData.player;
  const upVector = new scope.Vector3().fromArray(up).normalize();
  const start = new scope.Vector3().fromArray(position);
  const camera = scene.camera;
  const forward = new scope.Vector3();
  const side = new scope.Vector3();
  const basis = new scope.Matrix4();
  const reduced = prefersReducedMotion();
  const size = (0.9 + 0.2 * (sizeJitter ?? 1)) * 1.2;
  emote.visible = true;
  if (!reduced) player.playOnce("pop", undefined);
  const began = performance.now();
  const update = () => {
    const age = (performance.now() - began) / 1000;
    const life = Math.min(1, age / EMOTE_SECONDS);
    // Legacy envelope: grow in over the first 15 %, shrink out over the last 30 %.
    const envelope = smoothstep(0, 0.15, life) * (1 - smoothstep(0.7, 1, life));
    emote.scale.setScalar(size * (reduced ? 1 : envelope));
    emote.position.copy(start).addScaledVector(upVector, reduced ? 0 : life * 0.35);
    forward.subVectors(camera.position, emote.position);
    forward.addScaledVector(upVector, -forward.dot(upVector)).normalize();
    side.crossVectors(upVector, forward).normalize();
    emote.quaternion.setFromRotationMatrix(basis.makeBasis(side, upVector, forward));
    player.update(Math.min(scope.renderInfo.delta ?? 16, 100) / 1000);
    if (life >= 1) {
      emote.visible = false;
      const at = scene.beforeRenderCbs.indexOf(update);
      if (at >= 0) scene.beforeRenderCbs.splice(at, 1);
    }
  };
  scene.beforeRenderCbs.push(update);
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
