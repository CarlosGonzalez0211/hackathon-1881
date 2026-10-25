import type { AthenaInstallContext } from "../athena/install";
import type { LegacyContext } from "../runtime/legacy-context";
import { ring, roundedBox, taperedTube } from "./geometry";
import {
  advance,
  buildingClearance,
  canOccupy,
  cross,
  direction,
  pathDistance,
  RADIUS,
  surfacePoint,
  tangent,
  TAU,
  WATER_LEVEL,
  waterDepth,
  welcomeCenter,
  type Obstacle,
  type Vec,
} from "./layout";

/**
 * Spirit set dressing, all generated and free of ground footprints on the paths:
 * - floating monoliths with glowing rune bands hover above head height around the plaza;
 * - small candle shrines sit off the paths with flickering flames;
 * - glowing crystal clusters rise from the lakes with a halo on the water;
 * - light mantas glide around the globe, overhead while walking and in the aerial view.
 * Everything freezes under reduced motion and belongs to the scene disposal lifecycle.
 */
export function createSpiritDressing(
  ctx: AthenaInstallContext,
  root: LegacyContext,
  obstacles: Obstacle[],
  low: boolean,
) {
  const s = ctx.scope;
  const group = new s.Group();
  group.name = "athena-spirit-dressing";
  root.add(group);
  const orient = (object: LegacyContext, up: Vec, forward: Vec) => {
    const y = new s.Vector3(...up);
    const z = new s.Vector3(...tangent(forward, up));
    const x = new s.Vector3().crossVectors(y, z).normalize();
    object.quaternion.setFromRotationMatrix(new s.Matrix4().makeBasis(x, y, z));
  };
  const standard = (color: string, emissive?: string, intensity = 0) =>
    new s.MeshStandardMaterial({
      color,
      roughness: 1,
      ...(emissive ? { emissive, emissiveIntensity: intensity } : {}),
    });
  const stone = standard("#d9d2c2"),
    runes = standard("#ffe6a8", "#ffc66b", 2.2),
    wax = standard("#fff3dc"),
    flame = standard("#fff1c0", "#ffb84a", 3.2),
    crystal = standard("#bff3ef", "#5fe0d8", 1.6),
    disc = standard("#cfc6b2");
  const owned: LegacyContext[] = [stone, runes, wax, flame, crystal, disc];

  // Floating monoliths ring the plaza; they hover, so they never block a path.
  const monoliths: { object: LegacyContext; base: number; phase: number }[] = [];
  const monolithShape = roundedBox(s, 0.7, 2.6, 0.5, 0.35, 12);
  const bandShape = ring(s, 0.47, 0.035, 8, 48);
  owned.push(monolithShape, bandShape);
  const plazaForward = tangent([1, 0, 0], welcomeCenter);
  const plazaSide = cross(plazaForward, welcomeCenter);
  // Twelve candidate bearings around the plaza; keep the first four with open sky (well
  // away from buildings), so no stone ever hangs over a roof.
  const bearings: number[] = [];
  for (let c = 0; c < 12 && bearings.length < 4; c++) {
    const angle = (c / 12) * TAU + TAU / 24;
    const heading: Vec = [
      plazaForward[0] * Math.cos(angle) + plazaSide[0] * Math.sin(angle),
      plazaForward[1] * Math.cos(angle) + plazaSide[1] * Math.sin(angle),
      plazaForward[2] * Math.cos(angle) + plazaSide[2] * Math.sin(angle),
    ];
    const spot = advance(welcomeCenter, heading, 7.2).up;
    if (buildingClearance(spot) < 2.5) continue;
    if (bearings.some((b) => Math.abs(Math.atan2(Math.sin(b - angle), Math.cos(b - angle))) < 1))
      continue;
    bearings.push(angle);
  }
  for (const [i, angle] of bearings.entries()) {
    const heading: Vec = [
      plazaForward[0] * Math.cos(angle) + plazaSide[0] * Math.sin(angle),
      plazaForward[1] * Math.cos(angle) + plazaSide[1] * Math.sin(angle),
      plazaForward[2] * Math.cos(angle) + plazaSide[2] * Math.sin(angle),
    ];
    const up = advance(welcomeCenter, heading, 7.2).up;
    const anchor = new s.Group();
    anchor.position.set(...surfacePoint(up));
    orient(anchor, up, heading);
    const object = new s.Group();
    const slab = new s.Mesh(monolithShape, stone);
    const band = new s.Mesh(bandShape, runes);
    band.scale.set(1, 1, 0.75);
    band.position.y = 0.45;
    const band2 = new s.Mesh(bandShape, runes);
    band2.scale.set(0.95, 1, 0.7);
    band2.position.y = -0.55;
    object.add(slab, band, band2);
    object.rotation.z = 0.06 * (i % 2 ? 1 : -1);
    anchor.add(object);
    group.add(anchor);
    monoliths.push({ object, base: 3.6 + (i % 2) * 0.5, phase: i * 1.7 });
  }

  // Candle shrines on quiet grass beside the paths.
  const flames: { mesh: LegacyContext; phase: number }[] = [];
  const discShape = taperedTube(s, 0.42, 0.48, 0.12, 32, 1);
  const candleShape = taperedTube(s, 0.045, 0.05, 1, 16, 1);
  const flameShape = new s.SphereGeometry(1, 16, 12);
  owned.push(discShape, candleShape, flameShape);
  const shrineSpots: Vec[] = [];
  for (let n = 0; n < 400 && shrineSpots.length < (low ? 3 : 6); n++) {
    const up = direction((n * 2.39996) % TAU, Math.asin(((n * 0.61803) % 1) * 1.6 - 0.8));
    if (
      pathDistance(up) < 2.4 ||
      pathDistance(up) > 4.5 ||
      buildingClearance(up) < 2 ||
      waterDepth(up) > 0.01 ||
      !canOccupy(up, obstacles, 0.6) ||
      shrineSpots.some(
        (other) =>
          Math.acos(Math.min(1, other[0] * up[0] + other[1] * up[1] + other[2] * up[2])) * RADIUS <
          9,
      )
    )
      continue;
    shrineSpots.push(up);
  }
  for (const [k, up] of shrineSpots.entries()) {
    const shrine = new s.Group();
    shrine.position.set(...surfacePoint(up, -0.02));
    orient(shrine, up, [1, 0, 0]);
    const base = new s.Mesh(discShape, disc);
    base.position.y = 0.06;
    shrine.add(base);
    for (let c = 0; c < 5; c++) {
      const a = (c / 5) * TAU + k;
      const height = 0.16 + ((c * 37 + k * 11) % 5) * 0.05;
      const candle = new s.Mesh(candleShape, wax);
      candle.scale.y = height;
      candle.position.set(Math.cos(a) * 0.24, 0.12 + height / 2, Math.sin(a) * 0.24);
      const tip = new s.Mesh(flameShape, flame);
      tip.scale.set(0.022, 0.045, 0.022);
      tip.position.set(candle.position.x, 0.12 + height + 0.04, candle.position.z);
      shrine.add(candle, tip);
      flames.push({ mesh: tip, phase: k * 3.1 + c * 1.3 });
    }
    group.add(shrine);
    obstacles.push({ up, radius: 0.5 });
  }

  // Crystal clusters in the deep lake basins, with a halo on the water.
  const crystals: { mesh: LegacyContext; phase: number }[] = [];
  const shardShape = taperedTube(s, 0.0, 0.09, 0.8, 8, 1);
  const haloShape = new s.PlaneGeometry(2.4, 2.4);
  owned.push(shardShape, haloShape);
  const haloMaterial = new s.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: s.AdditiveBlending,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform float uTime; varying vec2 vUv;
      void main(){ float d=length(vUv-.5)*2.0; float a=pow(max(0.0,1.0-d),2.0)*(.32+.08*sin(uTime*1.5));
        gl_FragColor=vec4(vec3(.5,1.4,1.3)*a,a); }`,
  });
  owned.push(haloMaterial);
  const poolSpots: Vec[] = [];
  for (let n = 0; n < 2000 && poolSpots.length < 3; n++) {
    const up = direction((n * 2.39996) % TAU, Math.asin(((n * 0.7548) % 1) * 1.8 - 0.9));
    if (waterDepth(up) < 0.55) continue;
    if (
      poolSpots.some(
        (o) => Math.acos(Math.min(1, o[0] * up[0] + o[1] * up[1] + o[2] * up[2])) * RADIUS < 6,
      )
    )
      continue;
    poolSpots.push(up);
  }
  for (const [k, up] of poolSpots.entries()) {
    const cluster = new s.Group();
    cluster.position.set(...mulVec(up, WATER_LEVEL - 0.25));
    orient(cluster, up, [0, 0, 1]);
    for (let c = 0; c < 6; c++) {
      const shard = new s.Mesh(shardShape, crystal);
      const height = 0.6 + ((c * 13 + k * 7) % 5) * 0.18;
      shard.scale.set(1 + (c % 2) * 0.4, height, 1 + (c % 2) * 0.4);
      shard.position.set(
        Math.cos(c * 1.1) * 0.18 * (c % 3),
        (0.8 * height) / 2,
        Math.sin(c * 1.1) * 0.18 * (c % 3),
      );
      shard.rotation.set(Math.sin(c * 2.1) * 0.35, c, Math.cos(c * 1.7) * 0.35);
      cluster.add(shard);
      crystals.push({ mesh: shard, phase: c + k });
    }
    const halo = new s.Mesh(haloShape, haloMaterial);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.27;
    cluster.add(halo);
    group.add(cluster);
  }

  // Light mantas glide on tilted orbits around the globe.
  const mantas: {
    object: LegacyContext;
    tilt: number;
    phase: number;
    radius: number;
    speed: number;
  }[] = [];
  const mantaUniforms = { uTime: { value: 0 } };
  const mantaMaterial = new s.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: s.DoubleSide,
    blending: s.AdditiveBlending,
    uniforms: mantaUniforms,
    vertexShader: `uniform float uTime; varying vec2 vUv;
      void main(){ vUv=uv; vec3 p=position; float wing=abs(p.x);
        p.y+=sin(uTime*2.2+p.z*1.5)*wing*wing*0.55;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); }`,
    fragmentShader: `varying vec2 vUv;
      void main(){ vec2 q=(vUv-.5)*2.0; float body=1.0-smoothstep(.0,1.0,length(q*vec2(1.0,1.6)));
        float edge=smoothstep(.55,.95,length(q))*(1.0-smoothstep(.95,1.0,length(q)));
        float a=body*.45+edge*.8; if(a<.02) discard;
        gl_FragColor=vec4(mix(vec3(.9,1.2,1.6),vec3(1.6,1.25,.7),edge)*a,a); }`,
  });
  owned.push(mantaMaterial);
  const mantaShape = mantaGeometry(s);
  owned.push(mantaShape);
  for (let i = 0; i < (low ? 3 : 5); i++) {
    const object = new s.Mesh(mantaShape, mantaMaterial);
    object.frustumCulled = false;
    object.renderOrder = 4;
    group.add(object);
    mantas.push({
      object,
      tilt: 0.3 + i * 0.37,
      phase: i * 1.9,
      radius: RADIUS + 7 + (i % 3) * 1.4,
      speed: 0.05 + (i % 2) * 0.015,
    });
  }

  ctx.toon.apply(group);
  group.traverse((mesh: LegacyContext) => {
    if (!mesh.isMesh) return;
    mesh.raycast = () => {};
    if (mesh.material?.isShaderMaterial) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });
  const shards = crystals[0]?.mesh.material;
  const look = new s.Vector3();
  return {
    tick(time: number) {
      for (const m of monoliths) {
        m.object.position.y = m.base + Math.sin(time * 0.6 + m.phase) * 0.18;
        m.object.rotation.y = time * 0.08 + m.phase;
      }
      for (const f of flames) {
        const flick =
          1 + Math.sin(time * 11 + f.phase) * 0.12 + Math.sin(time * 17.3 + f.phase) * 0.08;
        f.mesh.scale.set(0.022 * flick, 0.045 * (2 - flick), 0.022 * flick);
      }
      if (shards) shards.emissiveIntensity = 1.6 + Math.sin(time * 1.3) * 0.35;
      haloMaterial.uniforms.uTime.value = time;
      mantaUniforms.uTime.value = time;
      for (const m of mantas) {
        const a = time * m.speed + m.phase;
        const p = (t: number): [number, number, number] => [
          Math.cos(t) * m.radius,
          Math.sin(t) * Math.sin(m.tilt) * m.radius,
          Math.sin(t) * Math.cos(m.tilt) * m.radius,
        ];
        m.object.position.set(...p(a));
        look.set(...p(a + 0.02));
        m.object.up.copy(m.object.position).normalize();
        m.object.lookAt(look);
      }
    },
    dispose() {
      for (const item of owned) item.dispose();
      group.removeFromParent();
    },
  };
}

const mulVec = (v: Vec, k: number): Vec => [v[0] * k, v[1] * k, v[2] * k];

/** A soft diamond wing plane (span along X, length along Z) for the gliding mantas. */
function mantaGeometry(s: LegacyContext) {
  const columns = 16,
    rows = 8,
    span = 2.6,
    length = 1.6;
  const positions: number[] = [],
    uvs: number[] = [],
    indices: number[] = [];
  for (let y = 0; y <= rows; y++)
    for (let x = 0; x <= columns; x++) {
      const u = x / columns,
        v = y / rows;
      positions.push((u - 0.5) * span, 0, (0.5 - v) * length);
      uvs.push(u, v);
    }
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < columns; x++) {
      const a = y * (columns + 1) + x,
        b = a + columns + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  const geometry = new s.BufferGeometry();
  geometry.setAttribute("position", new s.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new s.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}
