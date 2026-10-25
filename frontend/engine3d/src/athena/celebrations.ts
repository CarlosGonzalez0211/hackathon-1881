/**
 * World celebrations for rewards (proposal 5.7: "optional 3D world celebration"). The
 * engine only shows what the world API already decided (an unlocked achievement or a
 * discovered Easter egg); it never computes or fetches academic data.
 *
 * A kit model rises gently above the student and fades after a few seconds:
 * `first-insight` lights the insight lantern (the badge's visual concept), every other
 * reward uses the star emote. With reduced motion it appears in place, still, then hides.
 */
import type { AchievementCode } from "@athena/shared";
import type { LegacyContext } from "../runtime/legacy-context";
import type { AthenaInstallContext } from "./install";
import { ClipPlayer, loadAthenaModel, prefersReducedMotion } from "./models";

export const CELEBRATION_SECONDS = 3.5;
const LANTERN = "models/props/athena-prop-insight-lantern.glb";
const STAR = "slot:emote/star";

/** Kit model that celebrates a reward. */
export function celebrationModel(kind: "achievement" | "easter-egg", code?: AchievementCode) {
  return kind === "achievement" && code === "first-insight" ? LANTERN : STAR;
}

export async function celebrate(
  ctx: AthenaInstallContext,
  scene: LegacyContext,
  key: string,
  scale = 1.6,
) {
  const { scope } = ctx;
  const player = scene.characters?.mesh?._localObject;
  if (!player) return;
  const model = await loadAthenaModel(ctx, key);
  const group = new scope.Group();
  group.name = "athena-celebration";
  group.add(model.root);
  const clips = new ClipPlayer(scope, model.root, model.animations, 0);
  const reduced = prefersReducedMotion();
  if (!reduced && clips.has("pop")) clips.playOnce("pop");
  scene.add(group);
  const up = new scope.Vector3();
  const forward = new scope.Vector3();
  const side = new scope.Vector3();
  const basis = new scope.Matrix4();
  const began = performance.now();
  const update = () => {
    const life = (performance.now() - began) / 1000 / CELEBRATION_SECONDS;
    up.copy(player.position).normalize();
    group.position.copy(player.position).addScaledVector(up, 1.9 + (reduced ? 0 : life * 0.6));
    forward.subVectors(scene.camera.position, group.position);
    forward.addScaledVector(up, -forward.dot(up)).normalize();
    side.crossVectors(up, forward).normalize();
    group.quaternion.setFromRotationMatrix(basis.makeBasis(side, up, forward));
    const envelope = reduced ? 1 : Math.min(1, life * 6) * Math.min(1, (1 - life) * 4);
    group.scale.setScalar(scale * Math.max(0.001, envelope));
    clips.update(Math.min(scope.renderInfo.delta ?? 16, 100) / 1000);
    if (life >= 1) {
      const index = scene.beforeRenderCbs.indexOf(update);
      if (index >= 0) scene.beforeRenderCbs.splice(index, 1);
      clips.dispose();
      group.removeFromParent();
    }
  };
  scene.beforeRenderCbs.push(update);
}
