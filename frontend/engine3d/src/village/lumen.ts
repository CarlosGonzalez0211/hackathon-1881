import type { AthenaInstallContext } from "../athena/install";
import type { LegacyContext } from "../runtime/legacy-context";
import { ring, taperedTube } from "./geometry";

/**
 * Lumen, the student's guide cat, sculpted from smooth forms: a sitting body, a round head
 * with a soft muzzle, tall ears, big gold eyes, front paws, a curling tail and a collar
 * whose charm glows. The kit GLB stays loaded for the actor contract but is hidden; this
 * figure animates itself (tail sway, ear twitches, breathing, blinks) and wears a faint
 * warm aura. Everything holds still under reduced motion.
 */
export function illuminateLumen(ctx: AthenaInstallContext, root: LegacyContext) {
  const s = ctx.scope;
  root.traverse((mesh: LegacyContext) => {
    if (mesh.isMesh) mesh.visible = false;
  });
  const material = (color: string, emissive?: string, intensity = 0) =>
    new s.MeshStandardMaterial({
      color,
      roughness: 1,
      ...(emissive ? { emissive, emissiveIntensity: intensity } : {}),
    });
  const fur = material("#f4ebdf", "#ffe2b0", 0.06),
    cream = material("#fffaf2", "#ffe9c4", 0.05),
    taupe = material("#9a8a7c"),
    pink = material("#eaa7a0"),
    iris = material("#f2bf4f", "#ffb43c", 0.55),
    pupil = material("#2a211d"),
    collar = material("#2f7d7a"),
    charm = material("#ffd27a", "#ffc25a", 1.8);
  const sphere = new s.SphereGeometry(1, 40, 28);
  const cat = new s.Group();
  cat.name = "lumen-cat";
  const blob = (
    parent: LegacyContext,
    mat: LegacyContext,
    position: [number, number, number],
    scale: [number, number, number],
  ) => {
    const mesh = new s.Mesh(sphere, mat);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  // Body: rounded haunches behind a narrower upright chest, the classic sitting loaf.
  const body = new s.Group();
  cat.add(body);
  blob(body, fur, [0, 0.12, -0.05], [0.14, 0.125, 0.15]);
  blob(body, fur, [0, 0.21, 0.04], [0.1, 0.13, 0.095]);
  blob(body, cream, [0, 0.2, 0.1], [0.07, 0.1, 0.045]);
  for (const side of [-1, 1]) {
    blob(body, fur, [side * 0.1, 0.07, -0.04], [0.06, 0.07, 0.1]);
    blob(body, cream, [side * 0.045, 0.03, 0.12], [0.035, 0.028, 0.05]);
  }
  // Collar and glowing charm.
  const band = new s.Mesh(ring(s, 0.068, 0.011, 10, 48), collar);
  band.position.set(0, 0.3, 0.05);
  band.rotation.x = 0.35;
  body.add(band);
  const bell = blob(body, charm, [0, 0.275, 0.12], [0.022, 0.022, 0.022]);
  bell.castShadow = false;
  // Head.
  const head = new s.Group();
  head.position.set(0, 0.39, 0.07);
  body.add(head);
  blob(head, fur, [0, 0, 0], [0.125, 0.11, 0.11]);
  blob(head, cream, [0, -0.035, 0.085], [0.06, 0.042, 0.04]);
  blob(head, pink, [0, -0.012, 0.118], [0.012, 0.009, 0.008]);
  const lids: LegacyContext[] = [];
  for (const side of [-1, 1]) {
    const eye = new s.Group();
    eye.position.set(side * 0.047, 0.012, 0.088);
    head.add(eye);
    blob(eye, iris, [0, 0, 0], [0.026, 0.03, 0.016]);
    blob(eye, pupil, [0, 0, 0.011], [0.008, 0.021, 0.008]);
    blob(eye, cream, [side * -0.006, 0.01, 0.016], [0.004, 0.004, 0.003]);
    const lid = blob(eye, fur, [0, 0.004, 0.004], [0.03, 0.034, 0.019]);
    lid.scale.y = 0.0001;
    lids.push(lid);
    for (const tilt of [-0.12, 0.08]) {
      const whisker = new s.Mesh(taperedTube(s, 0.0012, 0.002, 0.11, 6, 1), cream);
      whisker.position.set(side * 0.085, -0.04 + tilt * 0.1, 0.09);
      whisker.rotation.z = side * (Math.PI / 2 + tilt);
      whisker.rotation.y = side * -0.35;
      head.add(whisker);
    }
  }
  const ears: LegacyContext[] = [];
  for (const side of [-1, 1]) {
    const ear = new s.Group();
    ear.position.set(side * 0.07, 0.075, -0.005);
    ear.rotation.z = side * -0.32;
    head.add(ear);
    const outer = new s.Mesh(taperedTube(s, 0.004, 0.045, 0.09, 24, 4), taupe);
    outer.position.y = 0.045;
    outer.scale.z = 0.55;
    const inner = new s.Mesh(taperedTube(s, 0.003, 0.03, 0.065, 20, 3), pink);
    inner.position.set(0, 0.038, 0.013);
    inner.scale.z = 0.35;
    ear.add(outer, inner);
    ears.push(ear);
  }
  // Tail: a swept tube curling up around the haunch, swaying from its root.
  const tail = new s.Group();
  tail.position.set(0.06, 0.06, -0.17);
  body.add(tail);
  const path: [number, number, number][] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    path.push([0.08 * Math.sin(t * 2.2), 0.02 + 0.2 * t * t, -0.05 - 0.12 * Math.sin(t * 1.6)]);
  }
  tail.add(
    new s.Mesh(
      sweep(s, path, (t) => 0.026 * (1 - t * 0.35)),
      taupe,
    ),
  );
  blob(tail, cream, path[path.length - 1]!, [0.024, 0.024, 0.024]);
  // Faint warm aura behind the figure.
  const uniforms = { uTime: { value: 0 } };
  const aura = new s.Mesh(
    new s.PlaneGeometry(1.1, 1.1),
    new s.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: s.AdditiveBlending,
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv=uv;
          vec4 view=modelViewMatrix*vec4(0.0,0.0,0.0,1.0);
          view.xy+=position.xy*vec2(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz));
          view.z-=0.25;
          gl_Position=projectionMatrix*view;
        }`,
      fragmentShader: `
        uniform float uTime; varying vec2 vUv;
        void main(){
          float d=length(vUv-.5)*2.0;
          float a=pow(max(0.0,1.0-d),3.0)*(.16+.04*sin(uTime*2.0));
          gl_FragColor=vec4(vec3(1.4,1.05,.6)*a,a);
        }`,
    }),
  );
  aura.position.set(0, 0.25, 0);
  aura.renderOrder = 5;
  cat.add(aura);
  ctx.toon.apply(cat);
  cat.traverse((mesh: LegacyContext) => {
    if (mesh.isMesh) mesh.raycast = () => {};
  });
  root.add(cat);
  ctx.onDispose(() => {
    cat.traverse((mesh: LegacyContext) => {
      if (mesh.isMesh && mesh.geometry !== sphere) mesh.geometry.dispose();
    });
    sphere.dispose();
    aura.material.dispose();
    for (const m of [fur, cream, taupe, pink, iris, pupil, collar, charm]) m.dispose();
  });
  let nextBlink = 2;
  return {
    tick(time: number) {
      tail.rotation.y = Math.sin(time * 1.6) * 0.35;
      tail.rotation.x = Math.sin(time * 0.9) * 0.08;
      head.rotation.z = Math.sin(time * 0.55) * 0.07;
      head.rotation.x = Math.sin(time * 0.4) * 0.04;
      body.scale.set(1, 1 + Math.sin(time * 2.1) * 0.012, 1);
      ears.forEach((ear, i) => {
        const twitch = Math.max(0, Math.sin(time * 0.8 + i * 2.7) - 0.93) * 6;
        ear.rotation.x = -twitch * 0.25;
      });
      uniforms.uTime.value = time;
      // A quick blink every few seconds; reduced motion (time 0) keeps the eyes open.
      if (time > nextBlink) nextBlink = time + 2.5 + ((time * 7.3) % 2.5);
      const closed = time > 0 && nextBlink - time > 2.35;
      for (const lid of lids) lid.scale.y = closed ? 0.034 : 0.0001;
    },
  };
}

/** Tube swept along a polyline with a radius profile (no TubeGeometry in the bundle). */
function sweep(
  s: LegacyContext,
  points: [number, number, number][],
  radius: (t: number) => number,
  radial = 18,
) {
  const positions: number[] = [],
    indices: number[] = [];
  const P = points.map((p) => new s.Vector3(...p));
  let normal = new s.Vector3(1, 0, 0);
  for (let i = 0; i < P.length; i++) {
    const tangent = new s.Vector3()
      .subVectors(P[Math.min(i + 1, P.length - 1)], P[Math.max(i - 1, 0)])
      .normalize();
    // Parallel transport keeps the ring frame from twisting along the curl.
    normal = new s.Vector3()
      .crossVectors(tangent, new s.Vector3().crossVectors(normal, tangent))
      .normalize();
    const binormal = new s.Vector3().crossVectors(tangent, normal);
    const r = radius(i / (P.length - 1));
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const offset = normal
        .clone()
        .multiplyScalar(Math.cos(a) * r)
        .addScaledVector(binormal, Math.sin(a) * r);
      positions.push(P[i].x + offset.x, P[i].y + offset.y, P[i].z + offset.z);
      if (i < P.length - 1 && j < radial) {
        const q = i * (radial + 1) + j;
        indices.push(q, q + radial + 1, q + 1, q + 1, q + radial + 1, q + radial + 2);
      }
    }
  }
  const geometry = new s.BufferGeometry();
  geometry.setAttribute("position", new s.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
