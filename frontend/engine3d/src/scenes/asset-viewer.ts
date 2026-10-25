/**
 * Dev-only asset turntable for the render review (docs/art/ART_DIRECTION.md section 9).
 *
 * Renders ONE manifest GLB through the same path as the live world: `createVillageContext`
 * (manifest, toon pass), `loadAthenaModel`, the same renderer settings, the same sun, fill
 * and ambient lights (`light.ts`), the sky (`atmosphere.ts`) and the HDR grade (`grade.ts`).
 *
 * The model stands at world `(0, RADIUS + 0.2, 0)` with +Y up, so the radial sky/ground fill
 * of the toon pass and the altitude haze behave as they do on the globe. The camera is fixed
 * and the model turns under it (`yaw`), so every tile of a sheet is lit the same way. The sun
 * comes from the camera side and higher than in the game, which is backlit while walking:
 * this is a studio view, use `?shot=` in the world to judge the in-game lighting.
 *
 * Mounted by `/dev/asset` (frontend/web). Query: `key` (manifest key, e.g.
 * `models/buildings/athena-house-done-v0.glb`, `slot:house/0/done`, `new:npc.cat`), `yaw`
 * (degrees), `elev` (camera elevation, degrees), `fit` (framing multiplier), `grid=1`
 * (1 m grid), `ref=1` (avatar silhouette for scale), `clip`, `t` (0..1 phase of the clip,
 * frozen), `quality=low|high`. `window.__athenaShot.go({ key, yaw, ... })` re-poses without a
 * reload and resolves after three composed frames; `dataset.athenaShot` is set on the canvas
 * once the pose has rendered, like the world's `?shot=` hook.
 */
import { ATHENA_AVATAR_OUTFIT, avatarOutfitSources } from "../assets/athena-keys.mjs";
import {
  ClipPlayer,
  finishModel,
  graftByNodeName,
  loadAthenaModel,
  localBounds,
} from "../athena/models";
import type { AthenaInstallContext } from "../athena/install";
import type { LegacyContext } from "../runtime/legacy-context";
import { createAtmosphere } from "../village/atmosphere";
import { createVillageContext } from "../village/context";
import { createLuminousGrade, type LuminousGrade } from "../village/grade";
import { HOUSE_SCALE, RADIUS, add, landmarks, mul, type Vec } from "../village/layout";
import { LUMINOUS, detectTier, sunDirection, type QualityTier } from "../village/light";
import { paintMaterial } from "../village/look";

export interface AssetViewerOptions {
  /** Manifest key: `models/…glb`, `slot:house/0/done`, `slot:avatar/base`, `new:npc.cat`. */
  key: string;
  /** Turntable angle in degrees; 0 faces the camera (models face +Z). */
  yaw?: number;
  /** Camera elevation above the horizon, degrees (default 14). */
  elev?: number;
  /** Framing multiplier on the fitted distance: above 1 leaves more air around the asset. */
  fit?: number;
  /** Draw a 1 m grid on the paper ground. */
  grid?: boolean;
  /** Stand a 1.7 m avatar silhouette beside the asset for scale. */
  ref?: boolean;
  /** Embedded animation clip to freeze (default `idle` when the model has one). */
  clip?: string;
  /** Phase of the clip, 0..1 (default 0). */
  t?: number;
  /** Quality tier; defaults to `?quality=` or the device heuristic, like the world. */
  quality?: QualityTier;
}

export interface AssetViewerStats {
  key: string;
  /** Static counts of the asset alone (ink hulls included, shadow pass and helpers excluded). */
  drawCalls: number;
  triangles: number;
  meshes: number;
  materials: number;
  /** Bounds in world metres after the in-game scale. */
  size: [number, number, number];
  scale: number;
  clips: string[];
  fps: number;
}

export interface AssetViewer {
  dispose(): void;
}

const PAPER = "#efe6d3";
const GROUND_Y = RADIUS + 0.2;
const VERTICAL_FOV = 32;

/** Scale the asset has in the village, so the tile and the avatar reference tell the truth. */
function worldScale(key: string) {
  if (/athena-house-/.test(key) || /^slot:house\//.test(key)) return HOUSE_SCALE;
  const landmark = /athena-building-([a-z-]+)\.glb$/.exec(key)?.[1];
  return landmarks.find((item) => item.id === landmark)?.scale ?? 1;
}

/** The default outfit with one slot swapped, so a single outfit part is judged on a body. */
function outfitFor(key: string) {
  const part = /athena-avatar-(hair|top|bottom|shoes|acc)-([a-z-]+)\.glb$/.exec(key);
  if (!part) return ATHENA_AVATAR_OUTFIT;
  const [, slot, name] = part as unknown as [string, string, string];
  return slot === "acc"
    ? { ...ATHENA_AVATAR_OUTFIT, accessories: [name] }
    : { ...ATHENA_AVATAR_OUTFIT, [slot]: name };
}

const isAvatarKey = (key: string) =>
  key === "slot:avatar/base" || /models\/avatar\/athena-avatar-[a-z]+(-[a-z-]+)?\.glb$/.test(key);

/** Avatar base + outfit parts, assembled exactly as surface.ts does. */
async function loadAvatar(assets: AthenaInstallContext, key: string) {
  const s = assets.scope;
  const avatar = await loadAthenaModel(assets, "slot:avatar/base", { toon: false, merge: false });
  const parts = await Promise.all(
    avatarOutfitSources(outfitFor(key)).map((source) =>
      loadAthenaModel(assets, source, { toon: false, merge: false }),
    ),
  );
  for (const part of parts) graftByNodeName(s, avatar.root, part.root);
  return finishModel(assets, avatar);
}

/** Flat disc (the recovered runtime has no CircleGeometry), facing +Y. */
function discGeometry(s: LegacyContext, radius: number, segments = 72) {
  const positions = [0, 0, 0],
    normals = [0, 1, 0],
    uvs = [0.5, 0.5],
    indices: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    positions.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    normals.push(0, 1, 0);
    uvs.push(0.5 + Math.cos(angle) * 0.5, 0.5 + Math.sin(angle) * 0.5);
    if (i) indices.push(0, i + 1, i);
  }
  const geometry = new s.BufferGeometry();
  geometry.setAttribute("position", new s.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new s.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new s.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

/** 1 m grid as thin quads (no line primitives in the recovered runtime), in the XZ plane. */
function gridGeometry(s: LegacyContext, half: number, width = 0.014) {
  const positions: number[] = [],
    indices: number[] = [];
  const quad = (x0: number, z0: number, x1: number, z1: number) => {
    const base = positions.length / 3;
    positions.push(x0, 0, z0, x1, 0, z0, x1, 0, z1, x0, 0, z1);
    indices.push(base, base + 2, base + 1, base, base + 3, base + 2);
  };
  for (let i = -half; i <= half; i++) {
    const w = i === 0 ? width * 2 : width;
    quad(i - w / 2, -half, i + w / 2, half);
    quad(-half, i - w / 2, half, i + w / 2);
  }
  const geometry = new s.BufferGeometry();
  geometry.setAttribute("position", new s.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  return geometry;
}

/** Draw calls and triangles of one object tree, counted like a render would (one per group). */
function countDraws(root: LegacyContext) {
  let drawCalls = 0,
    triangles = 0,
    meshes = 0;
  const materials = new Set<LegacyContext>();
  root.traverse((object: LegacyContext) => {
    if (!object.isMesh || object.visible === false) return;
    meshes++;
    const geometry = object.geometry;
    const total = geometry.index ? geometry.index.count : geometry.attributes.position.count;
    const instances = object.isInstancedMesh ? object.count : 1;
    const list = Array.isArray(object.material) ? object.material : [object.material];
    const groups = Array.isArray(object.material)
      ? (geometry.groups as { count: number; materialIndex: number }[])
      : [{ count: total, materialIndex: 0 }];
    for (const group of groups) {
      if (!list[group.materialIndex]) continue;
      drawCalls++;
      triangles += (Math.min(group.count, total) / 3) * instances;
    }
    for (const material of list) if (material) materials.add(material);
  });
  return { drawCalls, triangles: Math.round(triangles), meshes, materials: materials.size };
}

const clamp = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, value));

export async function createAssetViewer(
  host: HTMLElement,
  initial: AssetViewerOptions,
): Promise<AssetViewer> {
  const context = await createVillageContext();
  const { scope: s, lifecycle, assets } = context;
  const scene = new s.Scene();
  const atmosphere = createAtmosphere(assets, scene);
  scene.fog = new s.Fog(LUMINOUS.haze, 30, 105);
  const tier = initial.quality ?? detectTier();
  const camera = new s.PerspectiveCamera(VERTICAL_FOV, 1, 0.05, 260);
  let renderer: LegacyContext, grade: LuminousGrade | undefined;
  let disposed = false;
  let options: AssetViewerOptions = { ...initial };
  let framesLeft = 0,
    framesDone = 0,
    stats: AssetViewerStats | undefined,
    fps = 0,
    lastFrame = performance.now();
  const waiters: { resolve: () => void; reject: (error: Error) => void }[] = [];
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    for (const waiter of waiters.splice(0)) waiter.reject(new Error("viewer disposed"));
    delete (window as unknown as { __athenaShot?: unknown }).__athenaShot;
    delete renderer?.domElement.dataset.athenaShot;
    lifecycle.dispose();
    clearAsset();
    grade?.dispose();
    renderer?.dispose();
    renderer?.forceContextLoss();
    context.dispose();
    host.replaceChildren();
  };

  // Everything below the pivot is rebuilt per asset; the rig turns about its bounds centre.
  const pivot = new s.Group();
  pivot.position.set(0, GROUND_Y, 0);
  scene.add(pivot);
  let current:
    | { holder: LegacyContext; player?: ClipPlayer; extras: LegacyContext[]; key: string }
    | undefined;
  const disposeTree = (root: LegacyContext) => {
    root.traverse((object: LegacyContext) => {
      object.geometry?.dispose?.();
      for (const material of Array.isArray(object.material) ? object.material : [object.material])
        material?.dispose?.();
    });
  };
  function clearAsset() {
    if (!current) return;
    current.player?.dispose();
    current.holder.removeFromParent();
    disposeTree(current.holder);
    for (const extra of current.extras) {
      extra.removeFromParent();
      disposeTree(extra);
    }
    current = undefined;
  }

  try {
    renderer = new s.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, tier === "high" ? 1.25 : 1));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = s.PCFSoftShadowMap;
    renderer.outputColorSpace = s.SRGBColorSpace;
    renderer.toneMapping = s.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-label", `Asset viewer: ${initial.key}`);
    host.appendChild(renderer.domElement);
    scene.add(new s.AmbientLight(LUMINOUS.sky, 0.45));
    const sun = new s.DirectionalLight(LUMINOUS.sun, LUMINOUS.sunIntensity);
    sun.castShadow = true;
    sun.shadow.mapSize.set(tier === "high" ? 2048 : 1024, tier === "high" ? 2048 : 1024);
    sun.shadow.radius = 4;
    Object.assign(sun.shadow.camera, { near: 0.1, far: 130 });
    sun.shadow.bias = -0.001;
    sun.shadow.normalBias = 0.045;
    scene.add(sun, sun.target);
    const fill = new s.DirectionalLight("#9fc4e6", 0.5);
    scene.add(fill, fill.target);

    const resize = () => {
      const width = Math.max(1, host.clientWidth),
        height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height);
      grade?.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      frame();
      framesLeft = Math.max(framesLeft, 3);
    };
    grade = createLuminousGrade(s, renderer, scene, camera, tier);
    if (grade.composed) {
      scene.fog.near = 120;
      scene.fog.far = 260;
    }
    const worldUp: Vec = [0, 1, 0];
    // The camera looks along -Z; the sun is on the camera side (+Z), like a studio key light.
    const sunward = sunDirection(worldUp, [0, 0, 1]);
    const lightward = add(sunward, mul(worldUp, 0.5));
    assets.toon.lighting?.uAthenaSun.value.set(...sunward);

    const subject = new s.Vector3();
    let radius = 1;
    /** Camera on the +Z side of the subject, from `elev` degrees above the horizon. */
    function frame() {
      const elev = ((options.elev ?? 14) * Math.PI) / 180;
      const vfov = (VERTICAL_FOV * Math.PI) / 180;
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
      const distance = (radius / Math.sin(Math.min(vfov, hfov) / 2)) * 1.04 * (options.fit ?? 1);
      camera.position.set(
        subject.x,
        subject.y + Math.sin(elev) * distance,
        subject.z + Math.cos(elev) * distance,
      );
      camera.up.set(0, 1, 0);
      camera.lookAt(subject);
      camera.updateMatrixWorld();
      const reach = Math.max(4, radius * 1.8);
      Object.assign(sun.shadow.camera, { left: -reach, right: reach, top: reach, bottom: -reach });
      sun.shadow.camera.updateProjectionMatrix();
      sun.position.copy(subject).add(new s.Vector3(...mul(lightward, 40)));
      sun.target.position.copy(subject);
      sun.target.updateMatrixWorld();
      fill.position.copy(subject).add(new s.Vector3(0, 12, -18));
      fill.target.position.copy(subject);
      fill.target.updateMatrixWorld();
    }

    async function load(next: AssetViewerOptions) {
      const key = next.key;
      const model = isAvatarKey(key)
        ? await loadAvatar(assets, key)
        : await loadAthenaModel(assets, key);
      if (disposed) return;
      clearAsset();
      const scale = worldScale(key);
      const holder = new s.Group();
      holder.scale.setScalar(scale);
      holder.add(model.root);
      if (/\/buildings\/|\/props\//.test(key) || /^slot:house\//.test(key))
        model.root.traverse((part: LegacyContext) => {
          if (!part.isMesh || part.userData.athenaInk) return;
          for (const material of Array.isArray(part.material) ? part.material : [part.material]) {
            paintMaterial(material, "architecture");
            if (/\/props\//.test(key)) material.side = s.DoubleSide;
          }
        });
      const box = localBounds(s, model.root);
      box.min.multiplyScalar(scale);
      box.max.multiplyScalar(scale);
      let player: ClipPlayer | undefined;
      if (model.animations.length) {
        player = new ClipPlayer(s, model.root, model.animations);
        const name =
          next.clip && player.has(next.clip) ? next.clip : player.has("idle") ? "idle" : undefined;
        const chosen = name ?? model.animations[0]?.name;
        if (chosen) {
          player.play(chosen, 0);
          const duration =
            model.animations.find((c: LegacyContext) => c.name === chosen)?.duration ?? 0;
          player.mixer.setTime(clamp(next.t ?? 0, 0, 1) * duration);
        }
      }
      const extras: LegacyContext[] = [];
      const framed = box.clone();
      if (next.ref && !isAvatarKey(key)) {
        const avatar = await loadAvatar(assets, "slot:avatar/base");
        if (disposed) return;
        const silhouette = new s.MeshBasicMaterial({
          color: "#33465a",
          transparent: true,
          opacity: 0.5,
          depthWrite: false,
        });
        avatar.root.traverse((part: LegacyContext) => {
          if (!part.isMesh) return;
          if (part.userData.athenaInk) part.visible = false;
          else part.material = silhouette;
        });
        const body = new ClipPlayer(s, avatar.root, avatar.animations);
        body.play("idle", 0);
        body.mixer.setTime(0);
        const refBox = localBounds(s, avatar.root);
        const reference = new s.Group();
        reference.name = "athena-scale-reference";
        reference.add(avatar.root);
        const x = box.min.x - 0.8 - refBox.max.x;
        reference.position.set(x, 0, 0);
        framed.union(
          new s.Box3(
            refBox.min.clone().add(new s.Vector3(x, 0, 0)),
            refBox.max.clone().add(new s.Vector3(x, 0, 0)),
          ),
        );
        extras.push(reference);
        pivot.add(reference);
      }
      const centre = framed.getCenter(new s.Vector3());
      const size = framed.getSize(new s.Vector3());
      const own = box.getSize(new s.Vector3());
      holder.position.set(-centre.x, 0, -centre.z);
      for (const extra of extras) {
        extra.position.x -= centre.x;
        extra.position.z -= centre.z;
      }
      pivot.add(holder);
      radius = Math.max(0.4, size.length() / 2);
      subject.set(0, GROUND_Y + (framed.min.y + framed.max.y) / 2, 0);
      // Paper ground and optional grid, sized to the framed asset.
      const reach = Math.max(3, Math.ceil(radius * 1.5));
      const base = new s.MeshStandardMaterial({ color: PAPER, roughness: 1 });
      const floor = new s.Mesh(discGeometry(s, reach), assets.toon.toonMaterial(base));
      floor.name = "athena-paper-ground";
      floor.position.y = -0.012;
      floor.receiveShadow = true;
      extras.push(floor);
      pivot.add(floor);
      if (next.grid) {
        const lines = new s.MeshBasicMaterial({
          color: "#8c7f68",
          transparent: true,
          opacity: 0.55,
        });
        const grid = new s.Mesh(gridGeometry(s, Math.ceil(reach)), lines);
        grid.name = "athena-grid-1m";
        grid.position.y = 0.004;
        grid.renderOrder = 1;
        extras.push(grid);
        pivot.add(grid);
      }
      current = { holder, player, extras, key };
      const counts = countDraws(model.root);
      stats = {
        key,
        ...counts,
        size: [own.x, own.y, own.z].map((v) => +v.toFixed(3)) as [number, number, number],
        scale,
        clips: model.animations.map((clip: LegacyContext) => clip.name as string),
        fps,
      };
    }

    const pose = () => {
      pivot.rotation.y = (((options.yaw ?? 0) % 360) * Math.PI) / 180;
      pivot.updateMatrixWorld(true);
      frame();
    };
    const request = (frames = 3) => {
      framesLeft = frames;
      framesDone = 0;
      delete renderer.domElement.dataset.athenaShot;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    assets.onDispose(() => observer.disconnect());
    await load(options);
    if (disposed) throw new DOMException("Aborted", "AbortError");
    pose();
    request();

    // Drag to turn the model by hand (the review harness never touches the pointer).
    let drag: { x: number; y: number } | undefined;
    lifecycle.listen(renderer.domElement, "pointerdown", ((event: PointerEvent) => {
      drag = { x: event.clientX, y: event.clientY };
      renderer.domElement.setPointerCapture(event.pointerId);
    }) as EventListener);
    lifecycle.listen(renderer.domElement, "pointermove", ((event: PointerEvent) => {
      if (!drag) return;
      options = {
        ...options,
        yaw: (options.yaw ?? 0) + (event.clientX - drag.x) * 0.5,
        elev: clamp((options.elev ?? 14) + (event.clientY - drag.y) * 0.3, -10, 80),
      };
      drag = { x: event.clientX, y: event.clientY };
      pose();
      framesLeft = Math.max(framesLeft, 1);
    }) as EventListener);
    lifecycle.listen(renderer.domElement, "pointerup", (() => {
      drag = undefined;
    }) as EventListener);

    const render = (now: number) => {
      if (disposed) return;
      lifecycle.requestAnimationFrame(render);
      if (framesLeft <= 0) return;
      const dt = (now - lastFrame) / 1000;
      lastFrame = now;
      if (framesDone > 0 && dt > 0) fps = fps ? fps * 0.7 + (1 / dt) * 0.3 : 1 / dt;
      atmosphere.tick(camera, worldUp, [0, 0, 1], 0, true, false);
      grade!.tick(camera, sunward, false);
      grade!.render(0);
      framesLeft--;
      framesDone++;
      if (framesDone >= 3 && !renderer.domElement.dataset.athenaShot) {
        if (stats) stats.fps = +fps.toFixed(1);
        renderer.domElement.dataset.athenaShot = `${options.key}@${options.yaw ?? 0}`;
        for (const waiter of waiters.splice(0)) waiter.resolve();
      }
    };
    lifecycle.requestAnimationFrame(render);

    const go = async (patch: Partial<AssetViewerOptions>) => {
      const next = { ...options, ...patch };
      const reload =
        next.key !== options.key ||
        next.ref !== options.ref ||
        next.grid !== options.grid ||
        next.clip !== options.clip ||
        next.t !== options.t;
      delete renderer.domElement.dataset.athenaShot;
      framesLeft = 0;
      try {
        if (reload) await load(next);
      } catch (error) {
        request();
        throw error;
      }
      options = next;
      pose();
      request();
      return new Promise<void>((resolve, reject) => waiters.push({ resolve, reject }));
    };
    (window as unknown as { __athenaShot?: unknown }).__athenaShot = {
      list: () => (current ? [current.key] : []),
      go,
      stats: () => stats,
    };
    return { dispose: cleanup };
  } catch (error) {
    cleanup();
    throw error;
  }
}
