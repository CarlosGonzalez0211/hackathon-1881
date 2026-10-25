import type { AthenaInstallContext } from "./install";
import type { LegacyContext } from "../runtime/legacy-context";

/** Character-only touches over the painterly light: skin scatter, hair sheen, woven motifs. */
export function applyCharacterLook(ctx: AthenaInstallContext, root: LegacyContext) {
  if (!ctx.scope.athenaStandardPipeline) return;
  let character = false;
  root.traverse((mesh: LegacyContext) => {
    character ||= !!mesh.geometry?.attributes?._athena_style;
  });
  if (!character) return;
  const cache = new Map<LegacyContext, LegacyContext>();
  root.traverse((mesh: LegacyContext) => {
    if (!mesh.isMesh || mesh.userData.athenaCharacterLook) return;
    if (mesh.userData.athenaInk) {
      const ink = mesh.material.clone();
      ink.uniforms.thickness.value = 0.00035;
      ink.uniforms.inkColor.value.set("#48383b");
      mesh.material = ink;
      ctx.onDispose(() => ink.dispose());
      mesh.userData.athenaCharacterLook = true;
      return;
    }
    if (!mesh.geometry.attributes._athena_style) return;
    mesh.receiveShadow = false;
    const source = mesh.material;
    if (Array.isArray(source)) return;
    let material = cache.get(source);
    if (!material) {
      material = source.clone() as LegacyContext;
      material.flatShading = false;
      const previous = source.onBeforeCompile.bind(source);
      material.onBeforeCompile = (shader: LegacyContext, renderer: LegacyContext) => {
        previous(shader, renderer);
        shader.vertexShader = shader.vertexShader
          .replace(
            "#include <common>",
            "#include <common>\nattribute float _athena_style; attribute vec2 _athena_weave; varying float vCharacterStyle; varying vec2 vCharacterWeave;",
          )
          .replace(
            "#include <begin_vertex>",
            "#include <begin_vertex>\nvCharacterStyle = _athena_style; vCharacterWeave = _athena_weave;",
          );
        shader.fragmentShader = shader.fragmentShader
          .replace(
            "#include <common>",
            "#include <common>\nvarying float vCharacterStyle; varying vec2 vCharacterWeave;",
          )
          .replace(
            "#include <opaque_fragment>",
            `
            float skin = 1.0-step(.4,abs(vCharacterStyle-1.0));
            float hair = 1.0-step(.4,abs(vCharacterStyle-2.0));
            float eye = 1.0-step(.4,abs(vCharacterStyle-3.0));
            vec3 lightDir = normalize(vec3(-.4,.8,.6));
            #if NUM_DIR_LIGHTS > 0
              lightDir = directionalLights[0].direction;
            #endif
            vec3 base = diffuseColor.rgb;
            if(vCharacterStyle>6.5) {
              float u=vCharacterWeave.x,v=vCharacterWeave.y;
              float chevron=.34+.18*abs(cos(u*6.2831853));
              float motif=abs(fract(u*12.0)-.5)*2.0+abs((v-.77)/.065);
              base=vec3(.658,.323,.074);
              if(abs(v-chevron)<.023||v>.94) base=vec3(.47,.178,.056);
              if((v>.89&&v<.914)||motif<.78) base=vec3(.847,.55,.194);
            }
            // Woven motifs recolour the already lit painterly result.
            outgoingLight *= base/max(diffuseColor.rgb,vec3(.02));
            vec3 viewDir = normalize(vViewPosition);
            float facing = max(0.0,dot(normal,viewDir));
            float towardSun = dot(normal,lightDir);
            // Skin scatters the sun's warmth into its terminator (wrap lighting) and, with
            // the sun behind the head, glows warm along the silhouette like thin ears and cheeks.
            float wrap = clamp((towardSun+.35)/1.35,0.0,1.0);
            float terminator = smoothstep(.05,.45,wrap)*(1.0-smoothstep(.45,.9,wrap));
            float backlit = pow(clamp(dot(lightDir,-viewDir)*.5+.5,0.0,1.0),2.0);
            float rim = pow(1.0-facing,2.6);
            outgoingLight += base*vec3(.42,.15,.07)*skin*terminator;
            outgoingLight += base*vec3(.34,.16,.07)*(skin+hair*.6)*rim*backlit*1.4;
            outgoingLight += base*vec3(.12,.04,.02)*skin*(1.0-facing*.6);
            // Hair: a tight pale lobe plus a broad coloured lobe shifted along the strands.
            vec3 halfLight = normalize(lightDir+viewDir);
            float lobeA = pow(max(0.0,dot(normal,halfLight)),70.0);
            float lobeB = pow(max(0.0,dot(normalize(normal+vec3(0.,.3,0.)),halfLight)),12.0);
            outgoingLight += (vec3(1.,.95,.86)*lobeA*.2+base*base*lobeB*.14)*hair;
            // Eyes read their ink colour, with a bright catchlight from the sun and a faint fill.
            float catchlight = pow(max(0.0,dot(normal,halfLight)),180.0);
            float fill = pow(max(0.0,dot(normal,normalize(vec3(.5,-.3,.8)))),60.0);
            outgoingLight = mix(outgoingLight,base*1.05,eye*.9);
            outgoingLight += vec3(1.,.97,.9)*(catchlight*.9+fill*.25)*eye;
            #include <opaque_fragment>
          `,
          );
      };
      material.customProgramCacheKey = () => "athena-character-luminous-v2";
      cache.set(source, material);
      const owned = material;
      ctx.onDispose(() => owned.dispose());
    }
    mesh.material = material;
    mesh.userData.athenaCharacterLook = true;
  });
}
