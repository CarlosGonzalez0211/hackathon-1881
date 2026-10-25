import type { LegacyContext } from "../runtime/legacy-context";

const NOISE = `
  float athenaHash(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
  float athenaNoise(vec3 p) {
    vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(mix(athenaHash(i),athenaHash(i+vec3(1,0,0)),f.x),mix(athenaHash(i+vec3(0,1,0)),athenaHash(i+vec3(1,1,0)),f.x),f.y),
      mix(mix(athenaHash(i+vec3(0,0,1)),athenaHash(i+vec3(1,0,1)),f.x),mix(athenaHash(i+vec3(0,1,1)),athenaHash(i+vec3(1,1,1)),f.x),f.y),f.z);
  }
`;

/** Hand-painted surface variation without UV seams or additional texture fetches. */
export function paintMaterial(material: LegacyContext, kind: "ground" | "architecture") {
  if (material.userData.athenaPaint || material.isShaderMaterial) return;
  material.userData.athenaPaint = true;
  const previous = material.onBeforeCompile.bind(material);
  const cache = material.customProgramCacheKey.bind(material);
  material.onBeforeCompile = (shader: LegacyContext, renderer: LegacyContext) => {
    previous(shader, renderer);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vPaintPoint;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvPaintPoint = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vPaintPoint;\n${NOISE}`)
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        vec3 pp = vPaintPoint;
        float wash = athenaNoise(pp * ${kind === "ground" ? "1.5" : "6.0"});
        float grain = athenaHash(floor(pp * 100.0));
        diffuseColor.rgb *= ${kind === "ground" ? "0.80 + wash * 0.27 + grain * 0.045" : "0.90 + wash * 0.12 + grain * 0.025"};
        ${
          kind === "ground"
            ? `
          float grass = smoothstep(0.015,0.08,diffuseColor.g-diffuseColor.r);
          float fleck = step(0.94,athenaNoise(pp*34.0));
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb*vec3(1.22,1.14,0.92), fleck*grass*0.7);
        `
            : `
          float clay = step(diffuseColor.g*1.3,diffuseColor.r);
          float seam = 1.0-smoothstep(0.015,0.06,abs(fract(pp.y*6.5)-0.5));
          diffuseColor.rgb *= 1.0-clay*seam*0.13;
          float plaster=step(.60,diffuseColor.r)*step(abs(diffuseColor.r-diffuseColor.g),.19);
          diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.025,1.0,.93),plaster*.5);
          float grainMark=smoothstep(.78,.9,athenaNoise(pp*vec3(18.0,2.0,18.0)));
          diffuseColor.rgb*=1.0-grainMark*.035;
        `
        }
      `,
      );
  };
  material.customProgramCacheKey = () => `${cache()}-paint-${kind}-v2`;
}

/** The same local bend drives colour meshes and their ink hulls. */
export function windMaterial(material: LegacyContext, time: { value: number }) {
  const previous = material.onBeforeCompile.bind(material);
  const cache = material.customProgramCacheKey.bind(material);
  material.onBeforeCompile = (shader: LegacyContext, renderer: LegacyContext) => {
    previous(shader, renderer);
    shader.uniforms.uBreeze = time;
    const header = "uniform float uBreeze;\n";
    const bend = `
      float phase = 0.0;
      #ifdef USE_INSTANCING
        phase = instanceMatrix[3].x*0.4+instanceMatrix[3].z*0.3;
      #endif
      float amount=pow(clamp(position.y,0.0,4.0),1.4)*0.022;
      transformed.x += sin(uBreeze*1.3+phase+position.y*1.4)*amount;
      transformed.z += cos(uBreeze*0.85+phase+position.y)*amount*0.65;
    `;
    shader.vertexShader = header + shader.vertexShader;
    if (shader.vertexShader.includes("#include <begin_vertex>"))
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>\n${bend}`,
      );
    else
      shader.vertexShader = shader.vertexShader.replace(
        "vec3 transformed = position;",
        `vec3 transformed = position;\n${bend}`,
      );
  };
  material.customProgramCacheKey = () => `${cache()}-breeze-v1`;
}
