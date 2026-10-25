import type { AthenaInstallContext } from "../athena/install";
import type { LegacyContext } from "../runtime/legacy-context";
import { mergeStaticMeshes } from "../athena/merge";
import { roundedBox, taperedTube } from "./geometry";
import {
  advance,
  canOccupy,
  cross,
  direction,
  landmarks,
  lakes,
  mul,
  surfacePoint,
  tangent,
  waterDepth,
  pathDistance,
  WATER_LEVEL,
  type Obstacle,
  type Vec,
} from "./layout";

function orient(s: LegacyContext, object: LegacyContext, up: Vec, forward: Vec) {
  const f = tangent(forward, up);
  object.quaternion.setFromRotationMatrix(
    new s.Matrix4().makeBasis(
      new s.Vector3(...cross(up, f)),
      new s.Vector3(...up),
      new s.Vector3(...f),
    ),
  );
}

/** A working windmill and living ponds, anchored to valid ground and water. */
export function createLivingLandmarks(
  ctx: AthenaInstallContext,
  root: LegacyContext,
  obstacles: Obstacle[],
  cameraObstacles: LegacyContext[],
) {
  const s = ctx.scope,
    rotors: LegacyContext[] = [];
  const workshop = landmarks.find((p) => p.id === "school-hall")!;
  let millUp: Vec | undefined;
  for (let i = 0; i < 24; i++) {
    const candidate = advance(
      workshop.up,
      tangent(direction(i * 0.8, 0.2), workshop.up),
      7.5 + (i % 4) * 0.7,
    ).up;
    if (pathDistance(candidate) > 2.8 && canOccupy(candidate, obstacles, 1.35)) {
      millUp = candidate;
      break;
    }
  }
  if (millUp) {
    const mill = new s.Group();
    mill.name = "athena-working-windmill";
    mill.position.set(...surfacePoint(millUp));
    orient(s, mill, millUp, workshop.forward);
    const cream = new s.MeshStandardMaterial({ color: "#f4dfb2", roughness: 1 });
    const wood = new s.MeshStandardMaterial({ color: "#705044", roughness: 1 });
    const clay = new s.MeshStandardMaterial({ color: "#cc8265", roughness: 1 });
    const sail = new s.MeshStandardMaterial({ color: "#fff2ce", roughness: 1, side: s.DoubleSide });
    const base = new s.Mesh(taperedTube(s, 1.0, 1.13, 0.22, 20), wood);
    base.position.y = 0.08;
    mill.add(base);
    const tower = new s.Mesh(taperedTube(s, 0.62, 0.94, 3.1, 24), cream);
    tower.position.y = 1.65;
    mill.add(tower);
    const cap = new s.Mesh(taperedTube(s, 0.03, 0.96, 1.1, 24), clay);
    cap.position.y = 3.7;
    mill.add(cap);
    const door = new s.Mesh(roundedBox(s, 0.42, 0.85, 0.08), wood);
    door.position.set(0, 0.53, 0.92);
    mill.add(door);
    for (const sign of [-1, 1]) {
      const window = new s.Mesh(new s.SphereGeometry(0.2, 12, 8), wood);
      window.scale.set(1, 1, 0.3);
      window.position.set(sign * 0.37, 2.1, 0.57);
      mill.add(window);
    }
    const rotor = new s.Group();
    rotor.name = "athena-windmill-sails";
    rotor.position.set(0, 3.15, 0.9);
    for (let i = 0; i < 4; i++) {
      const wing = new s.Group();
      wing.rotation.z = (i * Math.PI) / 2;
      const spar = new s.Mesh(roundedBox(s, 0.075, 2.65, 0.08), wood);
      spar.position.y = 1.25;
      const cloth = new s.Mesh(new s.PlaneGeometry(0.48, 1.65, 1, 5), sail);
      cloth.position.set(0.22, 1.55, 0.06);
      cloth.rotation.y = 0.18;
      wing.add(spar, cloth);
      for (let bar = 0; bar < 5; bar++) {
        const slat = new s.Mesh(roundedBox(s, 0.52, 0.035, 0.035), wood);
        slat.position.set(0.21, 0.8 + bar * 0.34, 0.07);
        wing.add(slat);
      }
      rotor.add(wing);
    }
    const hub = new s.Mesh(new s.SphereGeometry(0.23, 12, 8), wood);
    rotor.add(hub);
    mergeStaticMeshes(s, mill, new Set());
    ctx.toon.apply(mill);
    mergeStaticMeshes(s, rotor, new Set());
    ctx.toon.apply(rotor);
    mill.add(rotor);
    rotors.push(rotor);
    mill.traverse((p: LegacyContext) => {
      if (p.isMesh && !p.userData.athenaInk) {
        p.castShadow = true;
        p.receiveShadow = true;
      }
    });
    root.add(mill);
    cameraObstacles.push(mill);
    obstacles.push({ up: millUp, radius: 1.15 });
  }
  const pads: { up: Vec; scale: number; phase: number }[] = [];
  for (const lake of lakes)
    for (let i = 0; i < 20; i++) {
      const up = advance(
        lake.up,
        tangent(direction(i * 2.4, 0.4), lake.up),
        0.8 + (i % 6) * 0.65,
      ).up;
      if (waterDepth(up) > 0.55) pads.push({ up, scale: 0.24 + (i % 4) * 0.055, phase: i * 0.7 });
    }
  const geometry = new s.BufferGeometry();
  const p = [0, 0, 0],
    uv = [0.5, 0.5],
    idx: number[] = [];
  for (let i = 0; i <= 24; i++) {
    const a = 0.22 + (i / 24) * (Math.PI * 2 - 0.44);
    p.push(Math.sin(a), 0, Math.cos(a));
    uv.push(0.5 + Math.sin(a) * 0.5, 0.5 + Math.cos(a) * 0.5);
    if (i) idx.push(0, i + 1, i);
  }
  geometry.setAttribute("position", new s.Float32BufferAttribute(p, 3));
  geometry.setAttribute("uv", new s.Float32BufferAttribute(uv, 2));
  geometry.setIndex(idx);
  geometry.computeVertexNormals();
  const padMat = new s.MeshStandardMaterial({ color: "#72aa77", roughness: 1, side: s.DoubleSide });
  const leaves = new s.InstancedMesh(geometry, ctx.toon.toonMaterial(padMat), pads.length);
  leaves.name = "athena-floating-lily-pads";
  leaves.receiveShadow = true;
  const petals = new s.InstancedMesh(
    new s.SphereGeometry(1, 16, 12),
    ctx.toon.toonMaterial(new s.MeshStandardMaterial({ color: "#f7c7bb" })),
    Math.ceil(pads.length / 3) * 5,
  );
  petals.name = "athena-lotus-flowers";
  const object = new s.Object3D(),
    matrix = new s.Matrix4(),
    local = new s.Object3D();
  function updatePonds(time: number) {
    let petal = 0;
    pads.forEach((pad, i) => {
      object.position.set(
        ...mul(pad.up, WATER_LEVEL + 0.045 + Math.sin(time * 0.9 + pad.phase) * 0.012),
      );
      orient(s, object, pad.up, direction(pad.phase, 0));
      object.scale.setScalar(pad.scale);
      object.updateMatrix();
      leaves.setMatrixAt(i, object.matrix);
      if (i % 3 === 0)
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2;
          local.position.set(Math.sin(a) * 0.22, 0.2, Math.cos(a) * 0.22);
          local.rotation.set(Math.sin(a) * 0.3, a, 0);
          local.scale.set(0.18, 0.22, 0.36);
          local.updateMatrix();
          petals.setMatrixAt(petal++, matrix.multiplyMatrices(object.matrix, local.matrix));
        }
    });
    leaves.instanceMatrix.needsUpdate = true;
    petals.instanceMatrix.needsUpdate = true;
  }
  updatePonds(0);
  leaves.computeBoundingSphere();
  petals.computeBoundingSphere();
  root.add(leaves, petals);
  return {
    tick(time: number) {
      for (const rotor of rotors) rotor.rotation.z = -time * 0.28;
      updatePonds(time);
    },
  };
}
