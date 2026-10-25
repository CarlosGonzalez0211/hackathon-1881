import type { AthenaInstallContext } from "../athena/install";
import type { LegacyContext } from "../runtime/legacy-context";
import { ClipPlayer, loadAthenaModel } from "../athena/models";
import {
  advance,
  cross,
  direction,
  doorDirection,
  mul,
  plots,
  RADIUS,
  scatter,
  surfacePoint,
  tangent,
  type Vec,
} from "./layout";

export async function buildAmbience(ctx: AthenaInstallContext, root: LegacyContext) {
  const s = ctx.scope;
  const creatures: {
    group: LegacyContext;
    player: ClipPlayer;
    home: Vec;
    bird: boolean;
    phase: number;
  }[] = [];
  const homes = [
    advance(doorDirection(0), cross(plots[0]!.up, plots[0]!.forward), 1.7).up,
    ...scatter(17, 341),
  ];
  const loads = await Promise.allSettled(
    Array.from({ length: 24 }, async (_, i) => {
      const bird = i >= 18;
      const model = await loadAthenaModel(
        ctx,
        bird ? "models/nature/athena-bird-finch.glb" : "models/nature/athena-butterfly.glb",
      );
      if (ctx.lifecycle.disposed) return;
      const group = new s.Group();
      group.name = bird ? "athena-songbird" : "athena-butterfly";
      group.add(model.root);
      group.scale.setScalar(bird ? 1.6 : 1.8);
      root.add(group);
      const player = new ClipPlayer(s, model.root, model.animations);
      ctx.onDispose(() => player.dispose());
      player.play(bird ? "flap" : "flutter");
      creatures.push({ group, player, home: homes[i % homes.length]!, bird, phase: i * 2.399 });
    }),
  );
  for (const load of loads)
    if (load.status === "rejected")
      console.warn("[Athena] ambient creature unavailable", load.reason);
  const points = scatter(180, 701);
  const positions = points.flatMap((up, i) => [...surfacePoint(up, 0.6 + (i % 13) * 0.2)]);
  const geometry = new s.BufferGeometry();
  geometry.setAttribute("position", new s.Float32BufferAttribute(positions, 3));
  const uniforms = { uTime: { value: 0 } };
  const material = new s.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: s.AdditiveBlending,
    vertexShader: `
      uniform float uTime; varying float vGlow;
      void main(){
        float phase=dot(position,vec3(4.1,5.3,7.7));
        vec3 drift=vec3(sin(uTime*.34+phase),cos(uTime*.5+phase)*.5,sin(uTime*.4+phase))*.22;
        vec4 mv=modelViewMatrix*vec4(position+drift,1.0);
        gl_PointSize=clamp(22.0/max(1.0,-mv.z),1.0,5.0);
        vGlow=.35+.25*sin(uTime*.7+phase);
        gl_Position=projectionMatrix*mv;
      }
    `,
    fragmentShader: `varying float vGlow; void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(1.0,.85,.42,(1.0-smoothstep(.06,.5,d))*vGlow);}`,
  });
  const motes = new s.Points(geometry, material);
  motes.name = "athena-sunlit-motes";
  root.add(motes);
  const look = new s.Vector3();
  return {
    tick(dt: number, time: number, reduced: boolean) {
      const t = reduced ? 0 : time;
      uniforms.uTime.value = t;
      for (const [i, creature] of creatures.entries()) {
        let up: Vec, next: Vec;
        if (creature.bird) {
          const lon = creature.phase + t * 0.035,
            lat = 0.32 + Math.sin(t * 0.11 + creature.phase) * 0.18;
          up = direction(lon, lat);
          next = direction(lon + 0.01, lat);
          creature.group.position.set(...mul(up, RADIUS + 10 + Math.sin(t * 0.7 + i) * 0.2));
        } else {
          const a = t * 0.6 + creature.phase;
          const forward = tangent([1, 0.2, 0], creature.home);
          up = advance(creature.home, forward, Math.sin(a) * 0.65).up;
          creature.group.position.set(...surfacePoint(up, 0.8 + Math.sin(a * 1.7) * 0.18));
          next = advance(up, forward, Math.cos(a) >= 0 ? 0.1 : -0.1).up;
        }
        creature.group.up.set(...up);
        look.set(...mul(next, creature.group.position.length()));
        creature.group.lookAt(look);
        creature.player.update(reduced ? 0 : dt);
      }
    },
    dispose() {
      for (const creature of creatures) creature.player.dispose();
    },
  };
}

/** Cloth animation is anchored at the pole; every flag shares one texture and clock. */
export function createBanners(
  ctx: AthenaInstallContext,
  root: LegacyContext,
  time: { value: number },
  orient: (object: LegacyContext, up: Vec, forward: Vec) => void,
) {
  const s = ctx.scope;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const g = canvas.getContext("2d")!;
  g.fillStyle = "#e3b961";
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = "#fff0c5";
  g.lineWidth = 4;
  g.strokeRect(8, 8, 112, 112);
  g.strokeStyle = "#285b5b";
  g.lineWidth = 5;
  g.beginPath();
  g.arc(64, 64, 30, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#285b5b";
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2,
      r = i % 2 ? 10 : 23;
    const x = 64 + Math.cos(a) * r,
      y = 64 + Math.sin(a) * r;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
  g.fill();
  const texture = new s.Texture(canvas);
  texture.colorSpace = s.SRGBColorSpace;
  texture.needsUpdate = true;
  ctx.onDispose(() => texture.dispose());
  const material = new s.MeshStandardMaterial({ map: texture, side: s.DoubleSide, roughness: 1 });
  material.onBeforeCompile = (shader: LegacyContext) => {
    shader.uniforms.uClothTime = time;
    shader.vertexShader =
      "uniform float uClothTime;\n" +
      shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
      transformed.z += sin(position.x*5.0-uClothTime*2.2+position.y*2.0)*.10*clamp(position.x/1.1,0.0,1.0);
      transformed.y += sin(position.x*3.0-uClothTime*1.5)*.035*clamp(position.x/1.1,0.0,1.0);
    `,
      );
  };
  material.customProgramCacheKey = () => "athena-cloth-v1";
  const poleMaterial = new s.MeshStandardMaterial({ color: "#80644d", roughness: 1 });
  for (const plot of plots) {
    const up = advance(
      advance(doorDirection(plot.slot), plot.forward, 1).up,
      cross(plot.up, plot.forward),
      2.5,
    ).up;
    const group = new s.Group();
    group.name = "athena-topic-banner";
    group.position.set(...surfacePoint(up));
    orient(group, up, plot.forward);
    const pole = new s.Mesh(new s.BoxGeometry(0.07, 2.9, 0.07), poleMaterial);
    pole.position.y = 1.45;
    pole.castShadow = true;
    const clothGeometry = new s.PlaneGeometry(1.1, 0.7, 12, 6);
    clothGeometry.translate(0.58, 2.4, 0);
    const flag = new s.Mesh(clothGeometry, material);
    flag.castShadow = true;
    group.add(pole, flag);
    root.add(group);
  }
}
