/**
 * Shared helpers for Athena systems: resolve a manifest key to a toon-shaded model, graft
 * part GLBs onto a rig by node name, and play embedded clips with crossfades.
 */
import type { LegacyContext } from "../runtime/legacy-context";
import type { AthenaInstallContext } from "./install";
import { animatedNodeNames, mergeStaticMeshes } from "./merge";

type Object3D = LegacyContext;
type AnimationClip = LegacyContext;

export interface AthenaModel {
  readonly root: Object3D;
  readonly animations: readonly AnimationClip[];
  readonly url: string;
}

/** Built URL for a manifest key, or undefined when the kit file was not built. */
export function athenaUrl(ctx: AthenaInstallContext, key: string) {
  const resolved = ctx.resolve(key);
  return resolved?.kind === "glb" ? resolved.url : undefined;
}

/**
 * Load a GLB by manifest key, merge its static meshes per material (merge.ts), toon-shade
 * it and make every mesh cast/receive shadows. Pass `toon: false, merge: false` to graft
 * parts first and finish with {@link finishModel}.
 */
export async function loadAthenaModel(
  ctx: AthenaInstallContext,
  key: string,
  { toon = true, merge = true }: { toon?: boolean; merge?: boolean } = {},
): Promise<AthenaModel> {
  const url = athenaUrl(ctx, key);
  if (!url) throw new Error(`Athena model not built: ${key}`);
  const { scene, animations } = await ctx.gltf.loadSceneFromGlb(url);
  scene.traverse((object: Object3D) => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
  });
  if (merge) mergeStaticMeshes(ctx.scope, scene, animatedNodeNames(animations));
  if (toon) ctx.toon.apply(scene);
  scene.userData.athenaUrl = url;
  return { root: scene, animations, url };
}

/** Merge + toon a model assembled from parts (see {@link graftByNodeName}). */
export function finishModel(ctx: AthenaInstallContext, model: AthenaModel) {
  mergeStaticMeshes(ctx.scope, model.root, animatedNodeNames(model.animations));
  ctx.toon.apply(model.root);
  return model;
}

/**
 * Move every mesh of `part` onto the node with the same name in `base` (walking up the
 * part's ancestors until a name matches), keeping its pose relative to that node. Part
 * GLBs share the base hierarchy `body > hip > {leg_l, leg_r, torso > {arm_l > hand_l,
 * arm_r > hand_r, head > head_geo}}`, so node animations on the base drive the parts too.
 * Returns how many meshes were grafted.
 */
export function graftByNodeName(scope: LegacyContext, base: Object3D, part: Object3D) {
  base.updateMatrixWorld(true);
  part.updateMatrixWorld(true);
  const meshes: Object3D[] = [];
  part.traverse((object: Object3D) => {
    if (object.isMesh && !object.userData.athenaInk) meshes.push(object);
  });
  const inverse = new scope.Matrix4();
  let grafted = 0;
  for (const mesh of meshes) {
    let anchor = mesh.parent;
    let target: Object3D | undefined;
    while (anchor && anchor !== part) {
      target = anchor.name ? base.getObjectByName(anchor.name) : undefined;
      if (target) break;
      anchor = anchor.parent;
    }
    if (!target || !anchor) {
      anchor = part;
      target = base;
    }
    // Pose relative to the matched ancestor in the part, re-applied under the base node.
    const relative = inverse.copy(anchor.matrixWorld).invert().multiply(mesh.matrixWorld);
    relative.decompose(mesh.position, mesh.quaternion, mesh.scale);
    target.add(mesh);
    grafted++;
  }
  return grafted;
}

/** Crossfading clip player on one AnimationMixer (default fade 0.2 s). */
export class ClipPlayer {
  readonly mixer: LegacyContext;
  private readonly actions = new Map<string, LegacyContext>();
  current: string | undefined;

  constructor(
    scope: LegacyContext,
    root: Object3D,
    clips: readonly AnimationClip[],
    private readonly fade = 0.2,
  ) {
    this.mixer = new scope.AnimationMixer(root);
    for (const clip of clips) this.actions.set(clip.name, this.mixer.clipAction(clip));
  }
  has(name: string) {
    return this.actions.has(name);
  }
  /** Crossfade to a looping clip; no-op when already playing or missing. */
  play(name: string, fade = this.fade) {
    if (name === this.current) return;
    const next = this.actions.get(name);
    if (!next) return;
    const previous = this.current ? this.actions.get(this.current) : undefined;
    next.reset().setLoop(2201 /* LoopRepeat */, Infinity).setEffectiveWeight(1).play();
    if (previous && fade > 0) previous.crossFadeTo(next, fade, false);
    else previous?.stop();
    this.current = name;
  }
  /** Play `name` once, then crossfade back to `then` (or the current loop). */
  playOnce(name: string, then = this.current) {
    const action = this.actions.get(name);
    if (!action) return;
    const previous = this.current ? this.actions.get(this.current) : undefined;
    action.reset().setLoop(2200 /* LoopOnce */, 1).play();
    action.clampWhenFinished = false;
    if (previous) previous.crossFadeTo(action, this.fade, false);
    this.current = name;
    const onFinished = (event: LegacyContext) => {
      if (event.action !== action) return;
      this.mixer.removeEventListener("finished", onFinished);
      if (this.current !== name) return;
      this.current = undefined;
      if (then) {
        const back = this.actions.get(then);
        back?.reset().play();
        if (back) action.crossFadeTo(back, this.fade, false);
        this.current = then;
      }
    };
    this.mixer.addEventListener("finished", onFinished);
  }
  update(delta: number) {
    this.mixer.update(delta);
  }
  dispose() {
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.mixer.getRoot());
  }
}

/** Bounding box of `object`'s meshes in `object`'s own space (ink hulls excluded). */
export function localBounds(scope: LegacyContext, object: Object3D) {
  object.updateMatrixWorld(true);
  const toLocal = object.matrixWorld.clone().invert();
  const box = new scope.Box3();
  const matrix = new scope.Matrix4();
  object.traverse((child: Object3D) => {
    if (!child.isMesh || child.userData.athenaInk) return;
    if (!child.geometry.boundingBox) child.geometry.computeBoundingBox();
    matrix.multiplyMatrices(toLocal, child.matrixWorld);
    box.union(child.geometry.boundingBox.clone().applyMatrix4(matrix));
  });
  return box;
}

/** True when the user asked the OS for less motion (brand guide 07/08). */
export function prefersReducedMotion() {
  return !!globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}
