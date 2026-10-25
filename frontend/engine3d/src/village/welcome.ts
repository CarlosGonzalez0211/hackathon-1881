import type { AthenaInstallContext } from "../athena/install";
import type { LegacyContext } from "../runtime/legacy-context";
import { mergeStaticMeshes } from "../athena/merge";
import { taperedTube } from "./geometry";
import { paintMaterial } from "./look";
import {
  add,
  buildingObstacle,
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

/** A grand entrance with a ground-conforming courtyard and a genuinely clear archway. */
export function createWelcomeCourtyard(
  ctx: AthenaInstallContext,
  root: LegacyContext,
  obstacles: Obstacle[],
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
  ) => mesh(name, new s.BoxGeometry(w, h, d), material, x, y, z);
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
  const arch = (inner: number, outer: number, depth: number) => {
    const p: number[] = [],
      ix: number[] = [];
    const count = 64;
    for (let i = 0; i <= count; i++) {
      const a = (i / count) * Math.PI;
      for (const z of [-depth / 2, depth / 2])
        for (const r of [inner, outer]) p.push(Math.cos(a) * r, Math.sin(a) * r + 4.7, z);
      if (i < count) {
        const q = i * 4;
        ix.push(
          q,
          q + 4,
          q + 1,
          q + 1,
          q + 4,
          q + 5,
          q + 2,
          q + 3,
          q + 6,
          q + 3,
          q + 7,
          q + 6,
          q,
          q + 2,
          q + 4,
          q + 2,
          q + 6,
          q + 4,
          q + 1,
          q + 5,
          q + 3,
          q + 3,
          q + 5,
          q + 7,
        );
      }
    }
    ix.push(
      0,
      1,
      2,
      1,
      3,
      2,
      count * 4,
      count * 4 + 2,
      count * 4 + 1,
      count * 4 + 1,
      count * 4 + 2,
      count * 4 + 3,
    );
    const g = new s.BufferGeometry();
    g.setAttribute("position", new s.Float32BufferAttribute(p, 3));
    g.setIndex(ix);
    g.computeVertexNormals();
    return g;
  };
  for (const sign of [-1, 1]) {
    const x = sign * 3.45;
    tube("gate_plinth", 0.76, 0.83, 0.3, trim, x, 0.0, 0);
    tube("gate_base", 0.58, 0.72, 0.42, stone, x, 0.32, 0);
    tube("carved_pillar", 0.48, 0.57, 3.94, stone, x, 2.5, 0);
    tube("pillar_capital", 0.74, 0.55, 0.26, trim, x, 4.59, 0);
    tube("capital_crown", 0.77, 0.74, 0.16, stone, x, 4.8, 0);
    box("pillar_inlay", 0.11, 2.6, 0.025, teal, x, 2.5, 0.525);
    box("pillar_inlay_back", 0.11, 2.6, 0.025, teal, x, 2.5, -0.525);
    tube("pillar_gold_band", 0.576, 0.576, 0.065, gold, x, 1.02, 0);
    const pillar = buildingObstacle(
      { min: [x - 0.8, 0, -0.82], max: [x + 0.8, 5, 0.82] },
      up,
      forward,
      1,
    );
    obstacles.push(pillar);
  }
  mesh("carved_stone_arch", arch(2.98, 3.87, 0.85), stone);
  mesh("arch_copper_coping", arch(3.88, 4.02, 0.96), clay);
  mesh("arch_front_inlay", arch(3.2, 3.26, 0.03), gold, 0, 0, 0.449);
  mesh("arch_back_inlay", arch(3.2, 3.26, 0.03), gold, 0, 0, -0.449);
  // Radial masonry joints read as one connected arch rather than separate floating pieces.
  for (let i = 1; i < 16; i++) {
    const a = (i / 16) * Math.PI;
    const joint = box(
      "arch_masonry_joint",
      0.018,
      0.83,
      0.015,
      trim,
      Math.cos(a) * 3.45,
      4.7 + Math.sin(a) * 3.45,
      0.438,
    );
    joint.rotation.z = a - Math.PI / 2;
  }
  const disc = tube("welcome_compass_seal", 0.71, 0.71, 0.16, teal, 0, 8.35, 0.57);
  disc.rotation.x = Math.PI / 2;
  const rim = tube("seal_backing", 0.8, 0.8, 0.09, gold, 0, 8.35, 0.47);
  rim.rotation.x = Math.PI / 2;
  const p: number[] = [0, 8.35, 0.67],
    ix: number[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2,
      r = i % 2 ? 0.16 : i % 4 === 0 ? 0.58 : 0.4;
    p.push(Math.sin(a) * r, 8.35 + Math.cos(a) * r, 0.68);
    if (i) ix.push(0, i + 1, i);
  }
  ix.push(0, 1, 16);
  const star = new s.BufferGeometry();
  star.setAttribute("position", new s.Float32BufferAttribute(p, 3));
  star.setIndex(ix);
  star.computeVertexNormals();
  mesh("golden_welcome_compass", star, gold);
  for (const sign of [-1, 1]) {
    tube("banner_mast", 0.035, 0.05, 4.6, gold, sign * 4.85, 2.1, -0.15);
    box("banner_crossbar", 1.04, 0.055, 0.055, gold, sign * 4.85, 4.35, -0.15);
    mesh("banner_finial", new s.SphereGeometry(0.11, 16, 12), gold, sign * 4.85, 4.55, -0.15);
    const x = sign * 4.5,
      z = 1.65;
    const height = groundHeight(x, z);
    tube("lantern_base", 0.28, 0.38, 0.26, stone, x, height + 0.13, z);
    tube("lantern_post", 0.045, 0.065, 2.0, metal, x, height + 1.15, z);
    tube("lantern_foot", 0.2, 0.23, 0.13, metal, x, height + 2.18, z);
    const lamp = new s.MeshStandardMaterial({
      color: "#ffe5a1",
      emissive: "#e8b95d",
      emissiveIntensity: 0.35,
      roughness: 1,
    });
    mesh("warm_welcome_lantern", new s.SphereGeometry(0.17, 16, 12), lamp, x, height + 2.4, z);
    tube("lantern_roof", 0.01, 0.3, 0.25, gold, x, height + 2.63, z);
    for (const edge of [-1, 1])
      tube("lantern_guard", 0.012, 0.012, 0.37, metal, x + edge * 0.18, height + 2.4, z);
  }
  // Courtyard stones follow the very same terrain sample as the walking controller.
  function groundPoint(x: number, z: number, offset = 0.045): Vec {
    const dir = norm(add(mul(up, 22), add(mul(side, x), mul(forward, z))));
    const point = surfacePoint(dir, offset),
      relative = add(point, mul(base, -1));
    return [dot(relative, side), dot(relative, up), dot(relative, forward)];
  }
  function groundHeight(x: number, z: number) {
    return groundPoint(x, z)[1];
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
  paving("courtyard_compass_ring", 1.22, 1.29, gold, 1.3);
  const floorPos: number[] = [],
    floorIx: number[] = [];
  floorPos.push(...groundPoint(0, 1.3, 0.055));
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2,
      r = i % 2 ? 0.25 : i % 4 === 0 ? 1.11 : 0.72;
    floorPos.push(...groundPoint(Math.sin(a) * r, 1.3 + Math.cos(a) * r, 0.055));
    if (i) floorIx.push(0, i, i + 1);
  }
  floorIx.push(0, 16, 1);
  const compass = new s.BufferGeometry();
  compass.setAttribute("position", new s.Float32BufferAttribute(floorPos, 3));
  compass.setIndex(floorIx);
  compass.computeVertexNormals();
  const mosaic = mesh("courtyard_compass_mosaic", compass, teal.clone());
  mosaic.material.side = s.DoubleSide;
  mosaic.userData.athenaNoInk = true;
  mosaic.castShadow = false;
  mergeStaticMeshes(s, gate, new Set());
  ctx.toon.apply(gate);
  gate.traverse((o: LegacyContext) => {
    if (o.isMesh && !o.userData.athenaInk) paintMaterial(o.material, "architecture");
  });
  // Banners remain separate from the static batching so their free lower hems can sway.
  for (const sign of [-1, 1]) {
    const flag = new s.Mesh(
      new s.PlaneGeometry(0.88, 1.8, 8, 20),
      new s.MeshStandardMaterial({
        color: sign === 1 ? "#487e6c" : "#cda058",
        side: s.DoubleSide,
        roughness: 1,
      }),
    );
    flag.name = "welcome_wind_banner";
    flag.position.set(sign * 4.85, 3.37, -0.1);
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
