import { taperedTube } from "./geometry";
import type { AthenaInstallContext } from "../athena/install";
import type { LegacyContext } from "../runtime/legacy-context";
import {
  advance,
  canOccupy,
  cross,
  direction,
  mul,
  pathDistance,
  inWelcomeCourtyard,
  surfacePoint,
  tangent,
  waterDepth,
  mountainHeight,
  TAU,
  RADIUS,
  type Obstacle,
  type Vec,
} from "./layout";

const vertex = `
  uniform float uTime,uSway; varying vec3 vNormal,vWorld; varying vec2 vUv; varying float vHeight;
  void main(){
    vUv=uv; vHeight=position.y;
    vec3 p=position;
    float phase=instanceMatrix[3].x*.35+instanceMatrix[3].z*.51;
    p.x+=sin(uTime*1.15+phase+position.y*.6)*uSway*max(0.0,position.y);
    vec4 world=modelMatrix*instanceMatrix*vec4(p,1.0);
    vWorld=world.xyz;
    vNormal=normalize(mat3(modelMatrix)*mat3(instanceMatrix)*normal);
    gl_Position=projectionMatrix*viewMatrix*world;
    #ifdef USE_INSTANCING_COLOR
      vInstanceColor=instanceColor;
    #else
      vInstanceColor=vec3(1.0);
    #endif
  }
`;
const colorHeader = `varying vec3 vInstanceColor;`;
const fragmentHeader = `
  uniform float uTime; varying vec3 vNormal,vWorld; varying vec2 vUv; varying float vHeight;
  varying vec3 vInstanceColor;
  vec3 instanceTint(){return vInstanceColor;}
`;

function basis(s: LegacyContext, object: LegacyContext, up: Vec, forward: Vec) {
  object.quaternion.setFromRotationMatrix(
    new s.Matrix4().makeBasis(
      new s.Vector3(...cross(up, tangent(forward, up))),
      new s.Vector3(...up),
      new s.Vector3(...tangent(forward, up)),
    ),
  );
}
function shader(
  ctx: AthenaInstallContext,
  time: { value: number },
  fragment: string,
  double = false,
  sway = 0.045,
) {
  return new ctx.scope.ShaderMaterial({
    uniforms: { uTime: time, uSway: { value: sway } },
    vertexColors: true,
    side: double ? ctx.scope.DoubleSide : ctx.scope.FrontSide,
    vertexShader: colorHeader + vertex,
    fragmentShader: fragmentHeader + fragment,
  });
}

/** Sculpted foliage: rounded silhouettes, coloured shadow bands and moving crowns. */
export function createGroves(
  ctx: AthenaInstallContext,
  root: LegacyContext,
  points: Vec[],
  time: { value: number },
) {
  const s = ctx.scope;
  const leaf = shader(
    ctx,
    time,
    `
    void main(){
      vec3 up=normalize(vWorld), n=normalize(vNormal);
      float light=dot(n,normalize(up+vec3(.35,.2,.25)));
      float band=smoothstep(-.5,.1,light)*.42+smoothstep(.28,.65,light)*.58;
      vec3 tint=instanceTint();
      vec3 shade=tint*vec3(.43,.72,.78)+vec3(.012,.035,.035);
      vec3 sunny=tint*vec3(1.12,1.04,.74)+vec3(.08,.055,.015);
      vec3 color=mix(shade,sunny,band);
      float leaves=sin(vWorld.x*12.0+sin(vWorld.z*8.0))*sin(vWorld.y*10.0);
      color*=.97+smoothstep(.74,.9,leaves)*.07;
      float rim=pow(1.0-max(0.0,dot(n,normalize(cameraPosition-vWorld))),3.0);
      color+=vec3(.08,.09,.035)*rim*smoothstep(.2,.8,light);
      gl_FragColor=vec4(color,1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
  );
  const bark = shader(
    ctx,
    time,
    `
    void main(){
      float light=dot(normalize(vNormal),normalize(normalize(vWorld)+vec3(.4,.2,.3)));
      float grain=sin(vUv.x*64.0+sin(vUv.y*19.0)*.8);
      vec3 color=mix(vec3(.11,.075,.055),vec3(.34,.22,.12),smoothstep(-.5,.6,light));
      color*=.94+smoothstep(.7,.95,grain)*.13;
      gl_FragColor=vec4(color,1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
  );
  const canopy = new s.InstancedMesh(new s.SphereGeometry(1, 18, 12), leaf, points.length * 6);
  canopy.name = "athena-sculpted-crowns";
  canopy.castShadow = false;
  const shadows = new s.InstancedMesh(
    new s.SphereGeometry(1, 7, 5),
    new s.MeshBasicMaterial({ colorWrite: false, depthWrite: false }),
    points.length,
  );
  shadows.name = "athena-grove-shadow-proxy";
  shadows.castShadow = true;
  const trunkGeometry = taperedTube(s, 0.12, 0.26, 1, 8, 3);
  trunkGeometry.translate(0, 0.5, 0);
  const trunks = new s.InstancedMesh(trunkGeometry, bark, points.length * 3);
  trunks.name = "athena-curved-tree-trunks";
  trunks.castShadow = true;
  const object = new s.Object3D(),
    parent = new s.Object3D(),
    matrix = new s.Matrix4();
  const palettes = ["#4c9b76", "#6ca66e", "#87b574", "#6a9f8c", "#a4b86c", "#e9afaa", "#e9c777"];
  const tint = new s.Color();
  points.forEach((up, i) => {
    const size = 0.8 + (i % 9) * 0.05,
      h = 3.2 + ((i * 7) % 11) * 0.13;
    parent.position.set(...surfacePoint(up, -0.08));
    basis(s, parent, up, [Math.sin(i * 2.4), 0.3, Math.cos(i * 2.4)]);
    parent.scale.setScalar(size);
    parent.updateMatrix();
    for (let branch = 0; branch < 3; branch++) {
      object.position.set(
        branch === 0 ? 0 : branch === 1 ? -0.28 : 0.27,
        branch === 0 ? 0 : h * 0.42,
        0,
      );
      object.rotation.set(0, 0, branch === 0 ? 0.07 : branch === 1 ? 0.48 : -0.55);
      object.scale.set(
        branch === 0 ? 1 : 0.55,
        branch === 0 ? h * 0.83 : h * 0.5,
        branch === 0 ? 1 : 0.55,
      );
      object.updateMatrix();
      trunks.setMatrixAt(i * 3 + branch, matrix.multiplyMatrices(parent.matrix, object.matrix));
    }
    object.position.set(0, h + 0.2, 0);
    object.rotation.set(0, 0, 0);
    object.scale.set(1.9, 1.35, 1.65);
    object.updateMatrix();
    shadows.setMatrixAt(i, matrix.multiplyMatrices(parent.matrix, object.matrix));
    const color = palettes[i % 17 === 0 ? 5 : i % 23 === 0 ? 6 : i % 5]!;
    for (let lobe = 0; lobe < 6; lobe++) {
      const a = lobe * 2.399 + i * 0.3;
      object.position.set(
        Math.sin(a) * (lobe === 0 ? 0 : 0.82),
        h + (lobe === 0 ? 0.5 : Math.cos(lobe * 2.7) * 0.4),
        Math.cos(a) * (lobe === 0 ? 0 : 0.7),
      );
      object.rotation.set(0.1 * Math.sin(i), a, 0.12 * Math.cos(i));
      object.scale.set(
        lobe === 0 ? 1.45 : 1.18,
        lobe === 0 ? 1.25 : 0.97,
        lobe === 0 ? 1.25 : 1.05,
      );
      object.updateMatrix();
      canopy.setMatrixAt(i * 6 + lobe, matrix.multiplyMatrices(parent.matrix, object.matrix));
      canopy.setColorAt(i * 6 + lobe, tint.set(color).multiplyScalar(0.91 + (lobe % 3) * 0.055));
    }
  });
  for (const mesh of [trunks, canopy, shadows]) {
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    root.add(mesh);
  }
  return { trunks, canopy };
}

/** Small-scale depth: wind-swept grass ribbons and five-petalled wildflowers. */
export function createMeadows(
  ctx: AthenaInstallContext,
  root: LegacyContext,
  obstacles: readonly Obstacle[],
  time: { value: number },
  low: boolean,
) {
  const s = ctx.scope;
  const points: Vec[] = [];
  const count = low ? 1800 : 11000;
  for (let i = 0; i < count; i++) {
    const up = direction(i * 2.399963, Math.asin(1 - (2 * (i + 0.5)) / count));
    const path = pathDistance(up);
    if (
      inWelcomeCourtyard(up) ||
      path < 1.58 ||
      waterDepth(up) > 0.03 ||
      mountainHeight(up) > 0.8 ||
      !canOccupy(up, obstacles, 0.1)
    )
      continue;
    points.push(up);
  }
  const blade = new s.PlaneGeometry(0.1, 0.38, 1, 3);
  blade.translate(0.015, 0.19, 0);
  const blades = shader(
    ctx,
    time,
    `
    void main(){
      vec3 tint=instanceTint();
      vec3 color=mix(tint*.48,tint*1.22+vec3(.08,.08,.01),vUv.y);
      gl_FragColor=vec4(color,1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
    true,
    0.38,
  );
  // A tapered ribbon instead of a rectangular grass card.
  const attr = blade.attributes.position;
  for (let i = 0; i < attr.count; i++) {
    const y = attr.getY(i) / 0.38;
    attr.setX(i, attr.getX(i) * (1 - y * 0.88) + y * y * 0.08);
  }
  const grass = new s.InstancedMesh(blade, blades, points.length * 3);
  grass.name = "athena-flowing-meadow";
  const flowerMaterial = shader(
    ctx,
    time,
    `
    void main(){
      vec2 p=(vUv-vec2(.5,.72))*vec2(1.0,1.25);
      float a=atan(p.y,p.x),r=length(p);
      float petals=.19+.055*cos(a*5.0);
      float bloom=1.0-smoothstep(petals-.012,petals,r);
      float center=1.0-smoothstep(.045,.06,r);
      float stem=(1.0-smoothstep(.012,.023,abs(vUv.x-.5)))*step(vUv.y,.7);
      float leaf=1.0-smoothstep(.0,.035,abs((vUv.x-.5)*.6-(vUv.y-.3)));
      leaf*=step(.2,vUv.y)*step(vUv.y,.43)*step(.47,vUv.x);
      if(max(bloom,max(stem,leaf))<.5)discard;
      vec3 color=mix(vec3(.09,.26,.13),instanceTint(),bloom);
      color=mix(color,vec3(.94,.59,.12),center);
      gl_FragColor=vec4(color,1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
    true,
    0.16,
  );
  const flowerPoints = points.filter(
    (up, i) => i % 4 === 0 || (pathDistance(up) < 3.1 && i % 2 === 0),
  );
  const flowers = new s.InstancedMesh(
    new s.PlaneGeometry(0.45, 0.62),
    flowerMaterial,
    flowerPoints.length * 2,
  );
  flowers.geometry.translate(0, 0.31, 0);
  flowers.name = "athena-wildflower-gardens";
  const object = new s.Object3D(),
    color = new s.Color();
  points.forEach((up, i) => {
    for (let j = 0; j < 3; j++) {
      const at = advance(up, tangent([1, 0, 0], up), (j - 1) * 0.09).up;
      object.position.set(...surfacePoint(at, -0.015));
      basis(s, object, at, [Math.sin(i + j * 2.1), 0.1, Math.cos(i + j * 2.1)]);
      object.scale.setScalar(0.65 + (i % 7) * 0.09);
      object.updateMatrix();
      grass.setMatrixAt(i * 3 + j, object.matrix);
      grass.setColorAt(i * 3 + j, color.set(i % 3 === 0 ? "#92b765" : "#60986a"));
    }
  });
  const palette = ["#fff0cf", "#e3b7cb", "#e6ba66", "#a8bce3", "#f0c6ae"];
  flowerPoints.forEach((up, i) => {
    for (let j = 0; j < 2; j++) {
      object.position.set(...surfacePoint(up));
      basis(s, object, up, [Math.sin(i + j * 1.57), 0.1, Math.cos(i + j * 1.57)]);
      object.scale.setScalar(0.7 + (i % 5) * 0.12);
      object.updateMatrix();
      flowers.setMatrixAt(i * 2 + j, object.matrix);
      flowers.setColorAt(i * 2 + j, color.set(palette[i % palette.length]));
    }
  });
  for (const mesh of [grass, flowers]) {
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    root.add(mesh);
  }
}

/** Painted cloud sprites orbit in 3D and face the camera in both walking and aerial views. */
export function createCloudBelt(ctx: AthenaInstallContext, root: LegacyContext) {
  const s = ctx.scope,
    group = new s.Group();
  group.name = "athena-drifting-cloud-belt";
  const material = new s.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexShader: `
      varying vec2 vUv;
      void main(){
        vUv=uv;
        vec4 center=modelMatrix*instanceMatrix*vec4(0.0,0.0,0.0,1.0);
        vec4 view=viewMatrix*center;
        float scale=length(instanceMatrix[0].xyz);
        view.xy+=position.xy*scale;
        gl_Position=projectionMatrix*view;
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      void main(){
        vec2 p=(vUv-.5)*vec2(2.8,1.5);
        float d=length(p-vec2(-.73,-.06))-.35;
        d=min(d,length(p-vec2(-.28,.12))-.5);
        d=min(d,length(p-vec2(.25,.08))-.44);
        d=min(d,length(p-vec2(.69,-.08))-.32);
        d=max(d,-p.y-.28);
        if(d>0.0)discard;
        float light=smoothstep(-.26,.38,p.y);
        vec3 c=mix(vec3(.70,.83,.84),vec3(1.0,.97,.86),light);
        c=mix(c,vec3(1.0,.98,.89),smoothstep(-.08,-.015,d)*light*.6);
        gl_FragColor=vec4(c,1.0);
        #include <colorspace_fragment>
      }
    `,
  });
  const mesh = new s.InstancedMesh(new s.PlaneGeometry(6.0, 2.8), material, 12);
  mesh.name = "athena-painted-cloud-banks";
  const obj = new s.Object3D();
  for (let i = 0; i < 12; i++) {
    const lon = (i * TAU) / 12,
      lat = 0.25 + Math.sin(i * 2.4) * 0.8,
      up = direction(lon, lat);
    obj.position.set(...mul(up, RADIUS + 12 + (i % 3) * 1.8));
    obj.scale.setScalar(0.85 + (i % 4) * 0.12);
    obj.updateMatrix();
    mesh.setMatrixAt(i, obj.matrix);
  }
  mesh.computeBoundingSphere();
  group.add(mesh);
  root.add(group);
  return {
    tick(time: number) {
      group.rotation.y = time * 0.008;
    },
  };
}
