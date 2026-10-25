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
            float facing = max(0.0,dot(normal,normalize(vViewPosition)));
            // Skin scatters warm light into its shade, like backlit cheeks and ears.
            outgoingLight += base*vec3(.24,.09,.05)*skin*(1.0-facing*.55);
            vec3 halfLight = normalize(lightDir+normalize(vViewPosition));
            float sheen = pow(max(0.0,dot(normal,halfLight)),24.0)*hair;
            outgoingLight += base*sheen*.12;
            outgoingLight = mix(outgoingLight,base*1.05,eye*.9);
            #include <opaque_fragment>
          `,
          );
      };
      material.customProgramCacheKey = () => "athena-character-luminous-v1";
      cache.set(source, material);
      const owned = material;
      ctx.onDispose(() => owned.dispose());
    }
    mesh.material = material;
    mesh.userData.athenaCharacterLook = true;
  });
}
