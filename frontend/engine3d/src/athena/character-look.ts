import type { AthenaInstallContext } from "./install";
import type { LegacyContext } from "../runtime/legacy-context";

/** Character-only painted light, finer ink and broad hair highlights. */
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
            float ndl = dot(normal,lightDir);
            float band = smoothstep(-.55,.8,ndl);
            vec3 shade = mix(vec3(.73,.70,.65),vec3(1.10,1.06,.98),band);
            shade = mix(shade,mix(vec3(.86,.72,.61),vec3(1.10,1.04,.96),band),skin);
            float luminance = dot(base,vec3(.2126,.7152,.0722));
            float shadow = clamp(dot(outgoingLight,vec3(.2126,.7152,.0722))/max(.025,luminance)*.65,.72,1.0);
            outgoingLight = base*shade*shadow + totalEmissiveRadiance;
            float facing = max(0.0,dot(normal,normalize(vViewPosition)));
            vec3 halfLight = normalize(lightDir+normalize(vViewPosition));
            float sheen = pow(max(0.0,dot(normal,halfLight)),24.0)*hair;
            outgoingLight += base*sheen*.08;
            outgoingLight += vec3(.16,.25,.23)*pow(1.0-facing,3.0)*(.10+hair*.06);
            outgoingLight = mix(outgoingLight,base,eye*.94);
            #include <opaque_fragment>
          `,
          );
      };
      material.customProgramCacheKey = () => "athena-character-storybook-v3";
      cache.set(source, material);
      const owned = material;
      ctx.onDispose(() => owned.dispose());
    }
    mesh.material = material;
    mesh.userData.athenaCharacterLook = true;
  });
}
