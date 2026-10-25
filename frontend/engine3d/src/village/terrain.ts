import type { AthenaInstallContext } from "../athena/install";
import type { LegacyContext } from "../runtime/legacy-context";
import { softUniforms } from "./shade";
import { direction, mountainHeight, pathDistance, surfacePoint, TAU, waterDepth } from "./layout";

/** Grass, paths and illustrated rock are painted on ONE mesh: no overlapping road ribbons. */
export function createTerrain(ctx: AthenaInstallContext, low: boolean) {
  const s = ctx.scope,
    nx = low ? 128 : 336,
    ny = low ? 64 : 168;
  const positions: number[] = [],
    land: number[] = [],
    indices: number[] = [];
  for (let y = 0; y <= ny; y++)
    for (let x = 0; x <= nx; x++) {
      const up = direction((x / nx) * TAU, (y / ny) * Math.PI - Math.PI / 2);
      positions.push(...surfacePoint(up));
      land.push(pathDistance(up), mountainHeight(up), waterDepth(up));
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
  geometry.setAttribute("land", new s.Float32BufferAttribute(land, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new s.Mesh(geometry, new s.MeshStandardMaterial({ color: "#ffffff", roughness: 1 }));
  mesh.name = "athena-painted-continuous-terrain";
  mesh.receiveShadow = true;
  // The ground receives shadows but casts none: nothing sits under it, and the shadow pass
  // would redraw its 147k triangles for no visible gain.
  mesh.castShadow = false;
  mesh.userData.athenaNoInk = true;
  ctx.toon.apply(mesh);
  const time = { value: 0 };
  const uniforms = {
    uLandTime: time,
    uGrass: { value: new s.Color("#579778") },
    uGrassLight: { value: new s.Color("#a4be80") },
    uPath: { value: new s.Color("#e5caa1") },
    uRock: { value: new s.Color("#b9c8c4") },
    uRockInk: { value: new s.Color("#6b929a") },
    uLichen: { value: new s.Color("#c9d3a3") },
    uWet: { value: new s.Color("#a58b6a") },
    uTerrainSun: softUniforms(ctx).uAthenaSun,
  };
  const material = mesh.material,
    previous = material.onBeforeCompile.bind(material);
  material.onBeforeCompile = (shader: LegacyContext, renderer: LegacyContext) => {
    previous(shader, renderer);
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute vec3 land;varying vec3 vLand;varying vec3 vLandPoint;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvLand=land;vLandPoint=position;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
      varying vec3 vLand,vLandPoint;uniform float uLandTime;uniform vec3 uGrass,uGrassLight,uPath,uRock,uRockInk,uLichen,uWet,uTerrainSun;
      float pathWarm=0.0;
      float landHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float landNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(landHash(i),landHash(i+vec2(1,0)),f.x),mix(landHash(i+vec2(0,1)),landHash(i+vec2(1,1)),f.x),f.y);}
    `,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
      vec3 p=vLandPoint;vec3 axis=pow(abs(normalize(p)),vec3(8.0));axis/=axis.x+axis.y+axis.z;
      float wash=landNoise(p.yz*.8)*axis.x+landNoise(p.xz*.8)*axis.y+landNoise(p.xy*.8)*axis.z;
      float brush=landNoise(p.yz*vec2(10.0,2.5))*axis.x+landNoise(p.xz*vec2(10.0,2.5))*axis.y+landNoise(p.xy*vec2(10.0,2.5))*axis.z;
      // Meadow: two broad tonal washes (deep emerald, sunlit olive) and large pale glades.
      vec3 grass=mix(uGrass*.9,uGrassLight*1.04,smoothstep(.34,.64,wash)*.95);
      float field=landNoise(p.yz*.22)*axis.x+landNoise(p.xz*.22)*axis.y+landNoise(p.xy*.22)*axis.z;
      grass=mix(grass,uGrassLight,smoothstep(.48,.68,field)*.4);
      grass=mix(grass,uGrass*.84,(1.0-smoothstep(.3,.62,field))*(1.0-smoothstep(.2,.45,wash))*.4);
      grass*=.93+brush*.14;
      // Brush strokes lean one way, as if combed toward the sun.
      float stroke=pow(max(0.0,sin(p.x*37.0+p.z*12.0+wash*8.0)*sin(p.y*41.0+p.x*17.0)),9.0);
      grass=mix(grass,uGrassLight*1.08,stroke*.5);
      float dark=pow(max(0.0,sin(p.z*31.0-p.y*9.0+wash*6.0)*sin(p.x*29.0+p.y*21.0)),12.0);
      grass=mix(grass,uGrass*.7,dark*.34);
      // Warm highlight: ground facing the sun drifts toward a sunlit yellow-green.
      float sunFacing=smoothstep(.15,.95,dot(normalize(p),normalize(uTerrainSun)));
      grass=mix(grass,grass*vec3(1.2,1.1,.72)+vec3(.03,.02,0.),sunFacing*.6);
      float edgeNoise=(wash-.5)*.36+sin(p.x*3.0+p.z*2.0)*.025;
      // Path: worn pale centre, warmer sandstone toward the edges, drawn pebbles and a ridge of edge stones.
      float road=1.0-smoothstep(1.22+edgeNoise,1.44+edgeNoise,vLand.x);
      vec3 trail=mix(uPath*1.04,uPath*.9,smoothstep(.55,1.3,vLand.x));
      trail*=.96+brush*.065;
      float pebbles=step(.982,landNoise(p.xz*17.0))*step(.3,brush);
      trail=mix(trail,uRockInk,pebbles*.2);
      float kerb=smoothstep(1.12+edgeNoise,1.2+edgeNoise,vLand.x)*(1.0-smoothstep(1.28+edgeNoise,1.38+edgeNoise,vLand.x));
      float cobble=step(.62,landNoise(p.xz*vec2(24.0,9.0)+p.y*13.0));
      trail=mix(trail,uRock*1.02,kerb*cobble*.6);
      trail=mix(trail,uRockInk*.9,kerb*(1.0-cobble)*.16);
      // The wet shoulder: grass darkens and cools where it meets the road.
      float shoulder=1.0-smoothstep(1.4,1.95,vLand.x+edgeNoise);
      vec3 ground=mix(grass,uGrass*.66,shoulder*.42);
      ground=mix(ground,trail,road);
      float pathSpeck=step(.92,landNoise(p.xy*35.0))*road;
      ground=mix(ground,uPath*1.12,pathSpeck*.14);
      // Rock only on steep faces; grassy ledges between, strata across the face, lichen on top.
      float rocky=smoothstep(.65,1.65,vLand.y);
      vec3 stone=mix(uRockInk,uRock,.6+wash*.3);
      float strata=sin(vLand.y*2.6+wash*3.5);
      float ink=(1.0-smoothstep(.02,.1,abs(strata)))*smoothstep(1.3,2.2,vLand.y);
      stone=mix(stone,uRockInk,ink*.2);
      float ledge=smoothstep(.55,.85,landNoise(p.xz*3.2+p.y*1.6))*(1.0-smoothstep(1.7,3.3,vLand.y));
      stone=mix(stone,grass*.92,ledge*.45);
      float lichen=smoothstep(4.7+wash*.9,5.4+wash*.9,vLand.y)*(.55+.45*landNoise(p.xz*8.0+p.y*4.0));
      stone=mix(stone,uLichen,lichen);
      ground=mix(ground,stone,rocky);
      // Shore: dry sand, then a darker wet-sand ring that follows the water.
      float sand=smoothstep(.02,.2,vLand.z)*(1.0-smoothstep(.2,.65,vLand.z));
      ground=mix(ground,uPath*.9,sand*.8);
      float wet=smoothstep(.0,.04,vLand.z)*(1.0-smoothstep(.1,.3,vLand.z));
      ground=mix(ground,uWet,wet*.6);
      diffuseColor.rgb=ground;
      pathWarm=road*(1.0-rocky);
    `,
      )
      .replace(
        "#include <opaque_fragment>",
        `// The road keeps its warm sand in shade: lift the shadow band toward the path colour.
      outgoingLight=mix(outgoingLight,max(outgoingLight,uPath*.82),pathWarm*.85);
      #include <opaque_fragment>`,
      );
  };
  material.customProgramCacheKey = () => "athena-single-surface-toon-v4";
  return {
    mesh,
    tick(t: number) {
      time.value = t;
    },
  };
}
