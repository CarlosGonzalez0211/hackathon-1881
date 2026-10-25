import type { AthenaInstallContext } from "../athena/install";
import { direction, mul, surfaceRadius, TAU, WATER_LEVEL } from "./layout";
import { softUniforms } from "./shade";

/**
 * One continuous water level over carved lake beds. Painted, not simulated: the colour runs
 * from the shallow turquoise `#21918F` to the deep teal `#06383F` with the bed depth, the sky
 * is mirrored toward the grazing angles (peach toward the sun), and two foam bands move on it:
 * a lapping band at the shoreline and a thin line that drifts across the shallows.
 *
 * The mesh only covers the quads that can show water: the fragment shader discards below a
 * depth of 0.015, so a quad whose four corners are dry can never draw a pixel. That leaves a
 * fraction of the old 147 k triangles and changes nothing on screen.
 */
export function createWater(ctx: AthenaInstallContext, low = false) {
  const s = ctx.scope;
  const nx = low ? 192 : 384,
    ny = low ? 96 : 192;
  const columns = nx + 1;
  const depthAt = new Float32Array(columns * (ny + 1));
  for (let y = 0; y <= ny; y++)
    for (let x = 0; x <= nx; x++) {
      const up = direction((x / nx) * TAU, (y / ny) * Math.PI - Math.PI / 2);
      depthAt[y * columns + x] = WATER_LEVEL - surfaceRadius(up);
    }
  // Keep a quad when any corner is wet; vertices are renumbered so only those are uploaded.
  const remap = new Int32Array(depthAt.length).fill(-1);
  const positions: number[] = [],
    depths: number[] = [],
    indices: number[] = [];
  const vertex = (x: number, y: number) => {
    const at = y * columns + x;
    if (remap[at]! >= 0) return remap[at]!;
    const up = direction((x / nx) * TAU, (y / ny) * Math.PI - Math.PI / 2);
    positions.push(...mul(up, WATER_LEVEL));
    depths.push(depthAt[at]!);
    return (remap[at] = depths.length - 1);
  };
  for (let y = 0; y < ny; y++)
    for (let x = 0; x < nx; x++) {
      const a = y * columns + x;
      if (
        depthAt[a]! <= 0.015 &&
        depthAt[a + 1]! <= 0.015 &&
        depthAt[a + columns]! <= 0.015 &&
        depthAt[a + columns + 1]! <= 0.015
      )
        continue;
      const v00 = vertex(x, y),
        v10 = vertex(x + 1, y),
        v01 = vertex(x, y + 1),
        v11 = vertex(x + 1, y + 1);
      indices.push(v00, v10, v01, v10, v11, v01);
    }
  const geometry = new s.BufferGeometry();
  geometry.setAttribute("position", new s.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("depth", new s.Float32BufferAttribute(depths, 1));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  const material = new s.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uSun: softUniforms(ctx).uAthenaSun },
    defines: { WATER_LOW: low ? 1 : 0 },
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
      uniform vec3 uSun;
      varying vec3 vPoint;
      varying vec3 vNormal;
      varying vec3 vView;
      varying float vDepth;
      vec3 lin(vec3 c){return pow(c,vec3(2.2));}
      void main() {
        if (vDepth < 0.015) discard;
        vec3 p=vPoint;
        vec3 n=normalize(vNormal), view=normalize(vView);
        float flow=uTime*.32;
        float bend=sin(p.z*.84+p.y*.62+flow*.6)*.7+sin(p.x*.5-p.y*.8-flow*.3)*.3;

        // Depth tint: shallow turquoise to deep teal, with a lighter lip over the bed.
        vec3 shallow=lin(vec3(.22,.70,.66)), deep=lin(vec3(.04,.32,.40));
        float basin=smoothstep(.06,1.7,vDepth);
        vec3 color=mix(shallow,deep,basin);
        color=mix(color,lin(vec3(.42,.84,.76)),(1.0-smoothstep(.02,.34,vDepth))*.22);

        // Sky reflection: the zenith blue overhead, the peach horizon toward the sun.
        float sunSide=clamp(dot(reflect(-view,n),uSun)*.5+.5,0.0,1.0);
        vec3 sky=mix(lin(vec3(.40,.70,.93)),lin(vec3(1.0,.80,.60)),pow(sunSide,2.2));
        float fresnel=pow(1.0-max(0.0,dot(n,view)),3.0);
        color=mix(color,sky,clamp(.04+fresnel*.4,0.0,.5));

        #if WATER_LOW == 0
        float ribbons=sin(p.x*2.2+p.z*1.6+p.y*1.2-flow+bend);
        float highlights=smoothstep(.94,.995,ribbons)*smoothstep(.05,.65,sin(p.z*.8-p.x*.55+flow*.3));
        color=mix(color,lin(vec3(.85,.97,.90)),highlights*.55);
        float sparkle=pow(max(0.0,sin(p.x*8.0+flow*2.0)*cos(p.z*7.0-flow)*sin(p.y*9.0)),32.0);
        color+=lin(vec3(.9,.78,.5))*sparkle*.4;
        #endif

        // Foam, band one: laps against the shore and breaks into soft crescents.
        float shore=1.0-smoothstep(.025,.26,vDepth);
        float lap=sin(vDepth*30.0-flow*3.2+bend*2.0);
        float crescents=.55+.45*sin(p.x*5.0+p.z*4.0+bend*3.0);
        float foam=smoothstep(.25,.9,lap)*shore*crescents;
        // Foam, band two: a thin line over the shallows that drifts out and fades.
        float drift=fract(vDepth*1.7-uTime*.045);
        float line=(1.0-smoothstep(.0,.05,abs(drift-.5)-.012))*smoothstep(.05,.3,vDepth)*(1.0-smoothstep(.6,1.3,vDepth));
        line*=.5+.5*sin(p.x*3.0-p.y*2.0+bend*4.0);
        color=mix(color,lin(vec3(.97,.99,.90)),clamp(foam*.8+line*.55,0.0,.88));
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
