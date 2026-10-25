import type { AthenaInstallContext } from "../athena/install";
import { mergeStaticMeshes } from "../athena/merge";
import type { LegacyContext } from "../runtime/legacy-context";
import { bakeVertexColor, roundedBox, sweep, taperedTube } from "./geometry";
import { advance, bridges, mul, tangent, walkingRadius, type Vec } from "./layout";

/** Planks along the 6.8 m deck; the arch itself is `walkingRadius`, the walking contract. */
const PLANKS = 28;
const HALF_SPAN = 3.4;
const RAIL = 1.1;

function basis(s: LegacyContext, object: LegacyContext, up: Vec, forward: Vec, pitch: number) {
  const y0 = new s.Vector3(...up);
  const t = new s.Vector3(...tangent(forward, up));
  // Pitch the plank to the arch: the slope of the deck over the span.
  const z = t
    .clone()
    .multiplyScalar(Math.cos(pitch))
    .addScaledVector(y0, Math.sin(pitch))
    .normalize();
  const y = y0
    .clone()
    .multiplyScalar(Math.cos(pitch))
    .addScaledVector(t, -Math.sin(pitch))
    .normalize();
  const x = new s.Vector3().crossVectors(y, z).normalize();
  object.quaternion.setFromRotationMatrix(new s.Matrix4().makeBasis(x, y, z));
}

/**
 * The four river crossings: arched timber decks following the exact curve sampled by the
 * walking controller (`walkingRadius`), planks with baked grain, two stringers, swept rope
 * rails with a post every fourth plank, and a lantern post at each end whose lamp is
 * `window_glow` (the light-as-state material, lit but not driven by learning state).
 *
 * Authored asymmetry: the two lantern posts stand on opposite sides of the deck.
 */
export function createBridges(
  ctx: AthenaInstallContext,
  root: LegacyContext,
  cameraObstacles: LegacyContext[],
) {
  const s = ctx.scope;
  const timber = new s.Color("#9c7356");
  const darkTimber = new s.Color("#6e4f3c");
  const rope = new s.Color("#c9b48a");
  const iron = new s.Color("#4a4658");
  const wood = new s.MeshStandardMaterial({ color: "#ffffff", vertexColors: true, roughness: 1 });
  const lamp = new s.MeshStandardMaterial({
    name: "window_glow",
    color: "#ffe2a6",
    emissive: "#f6c46a",
    emissiveIntensity: 1.6,
    roughness: 0.5,
  });
  const fill = (geometry: LegacyContext, color: LegacyContext, shade = 1) =>
    bakeVertexColor(s, geometry, () => [color.r * shade, color.g * shade, color.b * shade]);
  const mesh = (geometry: LegacyContext, material = wood) => new s.Mesh(geometry, material);
  const hash = (n: number) => {
    const v = Math.sin(n * 91.7) * 43758.5453;
    return v - Math.floor(v);
  };
  ctx.onDispose?.(() => {
    wood.dispose();
    lamp.dispose();
  });

  for (const [bridgeIndex, bridge] of bridges.entries()) {
    const group = new s.Group();
    group.name = "athena-wooden-bridge";
    const step = (2 * HALF_SPAN) / PLANKS;
    const upAt = (along: number) => advance(bridge.up, bridge.forward, along).up;
    const deckAt = (along: number) => walkingRadius(upAt(along));
    const slopeAt = (along: number) =>
      Math.atan2(deckAt(along + step) - deckAt(along - step), 2 * step);

    // Planks: slightly crowned across the width, with grain streaks and a darker end edge.
    const base = roundedBox(s, 2.2, 0.1, 0.22, 0.2, 5);
    for (let index = 0; index <= PLANKS; index++) {
      const along = -HALF_SPAN + index * step;
      const up = upAt(along);
      const geometry = base.clone();
      const tone = 0.86 + 0.24 * hash(index + bridgeIndex * 31);
      const seed = hash(index * 3.7 + bridgeIndex) * 6.28;
      bakeVertexColor(s, geometry, (p: LegacyContext) => {
        const streak = 0.93 + 0.07 * Math.sin(p.x * 46 + seed + Math.sin(p.x * 9) * 1.3);
        const end = 1 - 0.22 * Math.pow(Math.min(1, Math.abs(p.z) / 0.11), 3);
        const k = tone * streak * end * (0.92 + 0.08 * (p.y > 0 ? 1 : 0));
        return [timber.r * k, timber.g * k, timber.b * k];
      });
      const position = geometry.attributes.position;
      for (let v = 0; v < position.count; v++) {
        const across = position.getX(v) / 1.1;
        position.setY(v, position.getY(v) - 0.05 * across * across);
      }
      position.needsUpdate = true;
      geometry.computeVertexNormals();
      const plank = mesh(geometry);
      plank.position.set(...mul(up, deckAt(along) - 0.045));
      basis(s, plank, up, bridge.forward, slopeAt(along));
      group.add(plank);
    }

    // Two stringers under the deck, following the arch.
    for (const side of [-1, 1]) {
      const points: Vec[] = [];
      for (let index = 0; index <= PLANKS; index += 2) {
        const along = -HALF_SPAN - 0.1 + (index * (step * PLANKS + 0.2)) / PLANKS;
        const up = advance(
          upAt(Math.min(HALF_SPAN, Math.max(-HALF_SPAN, along))),
          bridge.side,
          side * 0.92,
        ).up;
        points.push(mul(up, deckAt(Math.min(HALF_SPAN, Math.max(-HALF_SPAN, along))) - 0.2));
      }
      const beam = sweep(
        s,
        points,
        (t: number) => 0.075 * (1 - 0.3 * Math.sin(t * Math.PI)),
        20,
        6,
        {
          caps: true,
          outward: true,
        },
      );
      group.add(mesh(fill(beam, darkTimber)));
    }

    // Rails: posts every fourth plank, a swept rope sagging between them, a second lower rope.
    const postShape = taperedTube(s, 0.05, 0.068, 0.78, 8, 1);
    const capShape = roundedBox(s, 0.16, 0.12, 0.16, 0.5, 4);
    for (const side of [-1, 1]) {
      const sideAt = (along: number, lift: number) => {
        const up = advance(upAt(along), bridge.side, side * RAIL).up;
        return mul(up, deckAt(along) + lift);
      };
      for (let index = 0; index <= PLANKS; index += 4) {
        const along = -HALF_SPAN + index * step;
        const up = advance(upAt(along), bridge.side, side * RAIL).up;
        const post = mesh(fill(postShape.clone(), darkTimber, 0.95 + 0.1 * hash(index + side)));
        post.position.set(...mul(up, deckAt(along) + 0.3));
        basis(s, post, up, bridge.forward, 0);
        const cap = mesh(fill(capShape.clone(), timber, 1.05));
        cap.position.set(...mul(up, deckAt(along) + 0.7));
        basis(s, cap, up, bridge.forward, 0);
        group.add(post, cap);
      }
      for (const [height, radius] of [
        [0.62, 0.03],
        [0.34, 0.024],
      ] as const) {
        const points: Vec[] = [];
        for (let index = 0; index <= PLANKS; index++) {
          const along = -HALF_SPAN + index * step;
          const local = (index % 4) / 4;
          const sag = index % 4 === 0 ? 0 : 0.085 * 4 * local * (1 - local);
          points.push(sideAt(along, height - sag));
        }
        group.add(
          mesh(
            fill(
              sweep(s, points, () => radius, PLANKS, 6, { caps: true, outward: true }),
              rope,
            ),
          ),
        );
      }
    }

    // Lantern posts: one at each end, on opposite sides of the deck, lamp lit by `window_glow`.
    for (const [end, side] of [
      [-HALF_SPAN, 1],
      [HALF_SPAN, -1],
    ] as const) {
      const up = advance(upAt(end), bridge.side, side * RAIL).up;
      const ground = deckAt(end);
      const pole = mesh(fill(taperedTube(s, 0.045, 0.07, 1.8, 8, 1), iron));
      pole.position.set(...mul(up, ground + 0.9));
      basis(s, pole, up, bridge.forward, 0);
      // A curved iron arm carries the lamp over the deck edge.
      const inward = advance(up, bridge.side, -side * 0.28).up;
      const arm = sweep(
        s,
        [
          mul(up, ground + 1.7),
          mul(advance(up, bridge.side, -side * 0.12).up, ground + 1.86),
          mul(inward, ground + 1.78),
        ],
        (t: number) => 0.028 * (1 - 0.4 * t),
        6,
        6,
        { caps: true, outward: true },
      );
      group.add(mesh(fill(arm, iron)));
      const body = mesh(roundedBox(s, 0.2, 0.3, 0.2, 0.55, 5), lamp);
      body.position.set(...mul(inward, ground + 1.55));
      basis(s, body, inward, bridge.forward, 0);
      const hood = mesh(fill(taperedTube(s, 0.015, 0.15, 0.12, 8, 1), iron));
      hood.position.set(...mul(inward, ground + 1.76));
      basis(s, hood, inward, bridge.forward, 0);
      group.add(pole, body, hood);
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
}
