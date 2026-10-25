import type { AthenaInstallContext } from "../athena/install";
import type { LegacyContext } from "../runtime/legacy-context";
import { mergeStaticMeshes } from "../athena/merge";
import { ring, roundedBox, taperedTube } from "./geometry";
import { paintMaterial } from "./look";
import {
  add,
  cross,
  dot,
  mul,
  norm,
  surfacePoint,
  tangent,
  welcomeCenter,
  type Obstacle,
  type Vec,
} from "./layout";

/** A floating halo gate over a ground-conforming courtyard; no footprint blocks the paths. */
export function createWelcomeCourtyard(
  ctx: AthenaInstallContext,
  root: LegacyContext,
  // The halo floats: it adds no ground obstacles, but keeps the shared signature.
  _obstacles: Obstacle[],
  cameraObstacles: LegacyContext[],
  time: { value: number },
) {
  const s = ctx.scope,
    up = welcomeCenter,
    forward = tangent([1, 0, 0], up),
    side = cross(up, forward);
  const base = surfacePoint(up),
    gate = new s.Group();
  gate.name = "athena-grand-welcome-gate";
  gate.position.set(...base);
  gate.quaternion.setFromRotationMatrix(
    new s.Matrix4().makeBasis(
      new s.Vector3(...side),
      new s.Vector3(...up),
      new s.Vector3(...forward),
    ),
  );
  const mat = (color: string) => new s.MeshStandardMaterial({ color, roughness: 1 });
  const stone = mat("#e6dbb9"),
    trim = mat("#c7b98e"),
    teal = mat("#477c6d"),
    gold = mat("#caa75b"),
    clay = mat("#b97851"),
    metal = mat("#4c5c51");
  const mesh = (
    name: string,
    geometry: LegacyContext,
    material: LegacyContext,
    x = 0,
    y = 0,
    z = 0,
  ) => {
    const m = new s.Mesh(geometry, material);
    m.name = name;
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    gate.add(m);
    return m;
  };
  const box = (
    name: string,
    w: number,
    h: number,
    d: number,
    material: LegacyContext,
    x: number,
    y: number,
    z: number,
  ) => mesh(name, roundedBox(s, w, h, d), material, x, y, z);
  const tube = (
    name: string,
    top: number,
    bottom: number,
    h: number,
    material: LegacyContext,
    x: number,
    y: number,
    z: number,
  ) => mesh(name, taperedTube(s, top, bottom, h, 24, 6), material, x, y, z);
  // A floating halo gate: a circular ring hovering over the round plaza. Nothing stands on
  // the ground, so every path that meets the courtyard stays open.
  const HALO = 5.4;
  mesh("halo_gate_stone", ring(s, 3.9, 0.34, 20, 128, 1.35), stone, 0, HALO, 0);
  mesh("halo_gate_copper_crown", ring(s, 3.9, 0.12, 12, 128), clay, 0, HALO + 0.44, 0);
  mesh("halo_gate_gold_inlay_outer", ring(s, 4.25, 0.05, 10, 128), gold, 0, HALO, 0);
  mesh("halo_gate_gold_inlay_inner", ring(s, 3.55, 0.05, 10, 128), gold, 0, HALO, 0);
  // Teal keystones around the ring, like the old arch's masonry joints.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const key = box("halo_keystone", 0.34, 0.62, 0.2, i % 3 ? trim : teal, 0, HALO, 0);
    key.position.set(Math.cos(a) * 3.9, HALO, Math.sin(a) * 3.9);
    key.rotation.y = -a;
  }
  const glow = new s.MeshStandardMaterial({
    color: "#fff1c8",
    emissive: "#ffcf7a",
    emissiveIntensity: 1.6,
    roughness: 1,
  });
  const crest = new s.Group();
  crest.name = "halo_gate_crest";
  crest.position.set(0, HALO + 0.2, 0);
  gate.add(crest);
  const seal = new s.Mesh(taperedTube(s, 0.62, 0.62, 0.12, 32, 1), teal);
  const sealRim = new s.Mesh(ring(s, 0.66, 0.06, 10, 48), gold);
  const p: number[] = [0, 0.08, 0],
    ix: number[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2,
      r = i % 2 ? 0.14 : i % 4 === 0 ? 0.55 : 0.36;
    p.push(Math.sin(a) * r, 0.08, Math.cos(a) * r);
    if (i) ix.push(0, i, i + 1);
  }
  ix.push(0, 16, 1);
  const star = new s.BufferGeometry();
  star.setAttribute("position", new s.Float32BufferAttribute(p, 3));
  star.setIndex(ix);
  star.computeVertexNormals();
  const starMesh = new s.Mesh(star, glow);
  starMesh.name = "golden_welcome_compass";
  crest.add(seal, sealRim, starMesh);
  // The crest turns slowly with the shared breeze clock (frozen under reduced motion).
  starMesh.onBeforeRender = () => {
    crest.rotation.y = time.value * 0.22;
  };
  // Slender spokes tie the floating crest to the halo.
  for (let i = 0; i < 4; i++) {
    const spoke = box("halo_spoke", 3.1, 0.06, 0.06, gold, 0, 0, 0);
    gate.remove(spoke);
    spoke.position.set(Math.cos((i * Math.PI) / 2) * 2.25, 0, Math.sin((i * Math.PI) / 2) * 2.25);
    spoke.rotation.y = -(i * Math.PI) / 2;
    crest.add(spoke);
  }
  // Four floating lanterns ride the ring at its quarter points.
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const x = Math.cos(a) * 3.9,
      z = Math.sin(a) * 3.9;
    tube("lantern_hanger", 0.02, 0.02, 0.5, metal, x, HALO - 0.55, z);
    mesh("warm_welcome_lantern", new s.SphereGeometry(0.2, 20, 14), glow, x, HALO - 0.95, z);
    tube("lantern_roof", 0.01, 0.28, 0.2, gold, x, HALO - 0.7, z);
  }
  // Courtyard stones follow the very same terrain sample as the walking controller.
  function groundPoint(x: number, z: number, offset = 0.045): Vec {
    const dir = norm(add(mul(up, 22), add(mul(side, x), mul(forward, z))));
    const point = surfacePoint(dir, offset),
      relative = add(point, mul(base, -1));
    return [dot(relative, side), dot(relative, up), dot(relative, forward)];
  }
  function paving(
    name: string,
    inner: number,
    outer: number,
    material: LegacyContext,
    zOffset = 0,
  ) {
    const pos: number[] = [],
      index: number[] = [];
    for (let ring = 0; ring <= 4; ring++)
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 2,
          r = inner + ((outer - inner) * ring) / 4;
        pos.push(...groundPoint(Math.sin(a) * r, Math.cos(a) * r + zOffset));
        if (ring < 4 && i < 96) {
          const q = ring * 97 + i;
          index.push(q, q + 97, q + 1, q + 1, q + 97, q + 98);
        }
      }
    const g = new s.BufferGeometry();
    g.setAttribute("position", new s.Float32BufferAttribute(pos, 3));
    g.setIndex(index);
    g.computeVertexNormals();
    const normal = g.attributes.normal;
    for (let i = 0; i < normal.count; i++)
      if (normal.getX(i) ** 2 + normal.getY(i) ** 2 + normal.getZ(i) ** 2 < 0.1)
        normal.setXYZ(i, 0, 1, 0);
    const groundMaterial = material.clone();
    groundMaterial.side = s.DoubleSide;
    const m = mesh(name, g, groundMaterial);
    m.userData.athenaNoInk = true;
    m.castShadow = false;
  }
  paving("welcome_courtyard", 0, 5.15, mat("#d9cca7"));
  paving("courtyard_outer_binding", 5.02, 5.22, teal);
  paving("courtyard_gold_binding", 4.76, 4.84, gold);
  mergeStaticMeshes(s, gate, new Set(["halo_gate_crest"]));
  ctx.toon.apply(gate);
  gate.traverse((o: LegacyContext) => {
    if (o.isMesh && !o.userData.athenaInk) paintMaterial(o.material, "architecture");
  });
  // Banners remain separate from the static batching so their free lower hems can sway.
  for (const sign of [-1, 1]) {
    const flag = new s.Mesh(
      new s.PlaneGeometry(0.7, 1.5, 8, 20),
      new s.MeshStandardMaterial({
        color: sign === 1 ? "#487e6c" : "#cda058",
        side: s.DoubleSide,
        roughness: 1,
      }),
    );
    flag.name = "welcome_wind_banner";
    flag.position.set(sign * 3.9, HALO - 1.25, 0);
    gate.add(flag);
    ctx.toon.apply(flag);
    const previous = flag.material.onBeforeCompile.bind(flag.material);
    flag.material.onBeforeCompile = (shader: LegacyContext, renderer: LegacyContext) => {
      previous(shader, renderer);
      shader.uniforms.uWelcomeTime = time;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nuniform float uWelcomeTime;")
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nfloat flap=1.0-uv.y; transformed.z+=sin(uWelcomeTime*1.8+uv.y*5.0)*.13*flap*flap;",
        );
    };
    flag.material.customProgramCacheKey = () => "athena-welcome-banners-v1";
  }
  root.add(gate);
  cameraObstacles.push(gate);
  return gate;
}
