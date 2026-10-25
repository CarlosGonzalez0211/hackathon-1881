import type { AthenaInstallContext } from "../athena/install";
import type { LegacyContext } from "../runtime/legacy-context";
import { direction, mountainHeight, pathDistance, surfacePoint, TAU, waterDepth } from "./layout";

/** Grass, paths and illustrated rock are painted on ONE mesh: no overlapping road ribbons. */
export function createTerrain(ctx: AthenaInstallContext, low: boolean) {
  const s = ctx.scope,
    nx = low ? 128 : 384,
    ny = low ? 64 : 192;
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
  mesh.castShadow = true;
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
    uSnow: { value: new s.Color("#fff1d9") },
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
      varying vec3 vLand,vLandPoint;uniform float uLandTime;uniform vec3 uGrass,uGrassLight,uPath,uRock,uRockInk,uSnow;
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
      vec3 grass=mix(uGrass,uGrassLight,smoothstep(.27,.72,wash)*.65);
      grass*=.95+brush*.10;
      // Broad painted meadow islands and fine directional marks sit in one surface.
      float field=landNoise(p.yz*.28)*axis.x+landNoise(p.xz*.28)*axis.y+landNoise(p.xy*.28)*axis.z;
      grass=mix(grass,uGrassLight,smoothstep(.54,.68,field)*.32);
      float stroke=pow(max(0.0,sin(p.x*37.0+p.z*12.0+wash*8.0)*sin(p.y*41.0+p.x*17.0)),18.0);
      grass=mix(grass,uGrassLight,stroke*.22);
      float edgeNoise=(wash-.5)*.36+sin(p.x*3.0+p.z*2.0)*.025;
      float road=1.0-smoothstep(1.22+edgeNoise,1.48+edgeNoise,vLand.x);
      vec3 trail=uPath*(.96+brush*.065);
      // Sparse drawn pebbles and irregular grass shoulders, rather than a tiled stone carpet.
      float pebbles=step(.982,landNoise(p.xz*17.0))*step(.3,brush);
      trail=mix(trail,uRockInk,pebbles*.18);
      float shoulder=1.0-smoothstep(1.48,1.75,vLand.x+edgeNoise);
      vec3 ground=mix(grass,uGrass*.77,shoulder*.25);
      ground=mix(ground,trail,road);
      float pathSpeck=step(.92,landNoise(p.xy*35.0))*road;
      ground=mix(ground,uPath*1.12,pathSpeck*.14);
      float rocky=smoothstep(.65,1.65,vLand.y);
      vec3 stone=mix(uRockInk,uRock,.65+wash*.28);
      float strata=sin(vLand.y*1.7+wash*4.0);
      float ink=(1.0-smoothstep(.015,.07,abs(strata)))*smoothstep(1.3,2.5,vLand.y);
      stone=mix(stone,uRockInk,ink*.17);
      float snow=smoothstep(5.2+wash*.8,5.5+wash*.8,vLand.y);
      stone=mix(stone,uSnow,snow);
      ground=mix(ground,stone,rocky);
      float sand=smoothstep(.02,.2,vLand.z)*(1.0-smoothstep(.2,.65,vLand.z));
      ground=mix(ground,uPath*.87,sand*.8);
      diffuseColor.rgb=ground;
    `,
      );
  };
  material.customProgramCacheKey = () => "athena-single-surface-toon-v2";
  return {
    mesh,
    tick(t: number) {
      time.value = t;
    },
  };
}
