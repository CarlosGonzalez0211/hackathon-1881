import type { AthenaInstallContext } from "../athena/install";
import { direction, mul, surfaceRadius, TAU, WATER_LEVEL } from "./layout";

/** One continuous water level over carved lake beds, with moving waves and shoreline foam. */
export function createWater(ctx: AthenaInstallContext) {
  const s = ctx.scope;
  const positions: number[] = [],
    depths: number[] = [],
    indices: number[] = [];
  const nx = 384,
    ny = 192;
  for (let y = 0; y <= ny; y++)
    for (let x = 0; x <= nx; x++) {
      const up = direction((x / nx) * TAU, (y / ny) * Math.PI - Math.PI / 2);
      positions.push(...mul(up, WATER_LEVEL));
      depths.push(WATER_LEVEL - surfaceRadius(up));
    }
  for (let y = 0; y < ny; y++)
    for (let x = 0; x < nx; x++) {
      const a = y * (nx + 1) + x,
        b = a + 1,
        c = a + nx + 1,
        d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  const geometry = new s.BufferGeometry();
  geometry.setAttribute("position", new s.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("depth", new s.Float32BufferAttribute(depths, 1));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const material = new s.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      uniform float uTime;
      attribute float depth;
      varying vec3 vPoint;
      varying vec3 vNormal;
      varying vec3 vView;
      varying float vDepth;
      void main() {
        vPoint = position;
        vDepth = depth;
        vec3 n = normalize(position);
        float wave = sin(position.x * 1.4 + position.z * 1.1 + uTime * 1.1)
          * cos(position.y * 1.5 - position.z * 0.8 + uTime * 0.65);
        vec3 displaced = position + n * wave * 0.026 * smoothstep(0.0, 0.5, depth);
        vec4 world = modelMatrix * vec4(displaced, 1.0);
        vNormal = normalize(mat3(modelMatrix) * n);
        vView = cameraPosition - world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec3 vPoint;
      varying vec3 vNormal;
      varying vec3 vView;
      varying float vDepth;
      void main() {
        if (vDepth < 0.015) discard;
        vec3 p=vPoint;
        vec3 n=normalize(vNormal), view=normalize(vView);
        float flow=uTime*.32;
        float bend=sin(p.z*.84+p.y*.62+flow*.6)*.7+sin(p.x*.5-p.y*.8-flow*.3)*.3;
        float ribbons=sin(p.x*2.2+p.z*1.6+p.y*1.2-flow+bend);
        float highlights=smoothstep(.94,.995,ribbons)*smoothstep(.05,.65,sin(p.z*.8-p.x*.55+flow*.3));
        float caustic=sin(p.x*4.1+sin(p.z*2.3+flow))*sin(p.y*3.3+p.z*2.7-flow*.6);
        vec3 shallow=vec3(.13,.57,.49),deep=vec3(.025,.23,.31);
        float basin=smoothstep(.08,1.9,vDepth);
        vec3 color=mix(shallow,deep,basin);
        color+=vec3(.06,.14,.10)*smoothstep(.65,.9,caustic)*(1.0-basin)*.6;
        color=mix(color,vec3(.70,.90,.80),highlights*.72);
        float shore=1.0-smoothstep(.025,.30,vDepth);
        float lap=sin(vDepth*27.0-flow*3.0+bend*2.0);
        float foam=smoothstep(.2,.9,lap)*shore;
        color=mix(color,vec3(.90,.96,.81),foam*.82);
        float fresnel=pow(1.0-max(0.0,dot(n,view)),3.0);
        color=mix(color,vec3(.45,.75,.76),fresnel*.35);
        float sparkle=pow(max(0.0,sin(p.x*8.0+flow*2.0)*cos(p.z*7.0-flow)*sin(p.y*9.0)),32.0);
        color+=vec3(.6,.5,.23)*sparkle*.45;
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const mesh = new s.Mesh(geometry, material);
  mesh.name = "athena-animated-deep-water";
  return {
    mesh,
    tick(time: number) {
      material.uniforms.uTime.value = time;
    },
  };
}
