/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1635984:1638878.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2058(scope) {
scope.depthCharsMaterial = function depthCharsMaterial(r = {}) {
  const e = new scope.MeshDepthMaterial({
    depthPacking: scope.RGBADepthPacking
  });
  return e.onBeforeCompile = (i, s) => {
    e.uniforms = i.uniforms, i.uniforms.boneTexture = {
      value: null
    }, i.uniforms.batchingTexture = {
      value: null
    }, i.uniforms.batchingIdTexture = {
      value: null
    }, i.uniforms.uShowChars = {
      value: 1
    }, i.vertexShader = i.vertexShader.replace("#include <skinning_pars_vertex>", `
            varying vec3 wPos;

            #define USE_SKINNING 1

            #ifdef USE_SKINNING
                attribute vec4 skinIndex;
                attribute vec4 skinWeight;
                uniform sampler2D boneTexture;
                mat4 bindMatrix = mat4(1.0);
                mat4 bindMatrixInverse = mat4(1.0);
                mat4 getBoneMatrix(const in float i, const in float id) {
                    int x = int(i) * 4;
                    int y = int(id);
                    vec4 v1 = texelFetch(boneTexture, ivec2(x, y), 0);
                    vec4 v2 = texelFetch(boneTexture, ivec2(x + 1, y), 0);
                    vec4 v3 = texelFetch(boneTexture, ivec2(x + 2, y), 0);
                    vec4 v4 = texelFetch(boneTexture, ivec2(x + 3, y), 0);
                    return mat4(v1, v2, v3, v4);
                }
            #endif
        `), i.vertexShader = i.vertexShader.replace("#include <batching_vertex>", `
            #ifdef USE_BATCHING
                float batchID = getIndirectIndex(gl_DrawID);
                mat4 batchingMatrix = getBatchingMatrix(batchID);
            #endif
        `), i.vertexShader = i.vertexShader.replace("#include <skinbase_vertex>", `
            #ifdef USE_SKINNING
                mat4 boneMatX = getBoneMatrix(skinIndex.x, batchID);
                mat4 boneMatY = getBoneMatrix(skinIndex.y, batchID);
                mat4 boneMatZ = getBoneMatrix(skinIndex.z, batchID);
                mat4 boneMatW = getBoneMatrix(skinIndex.w, batchID);
            #endif
        `), i.vertexShader = i.vertexShader.replace("#include <project_vertex>", `
            wPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
            #include <project_vertex>
        `), i.fragmentShader = i.fragmentShader.replace("#include <clipping_planes_pars_fragment>", `
            #include <clipping_planes_pars_fragment>
            varying vec3 wPos;
            uniform float uShowChars;

            float sphereFade(vec3 p, float size, float amount) {
                float h = size * 0.5;
                return clamp(1.0 - step(amount * 1.85, length(mod(p, size) - h) / h), 0.0, 1.0);
            }
        `), i.fragmentShader = i.fragmentShader.replace("#include <clipping_planes_fragment>", `
            #include <clipping_planes_fragment>
            if (uShowChars < 1.0) {
                float showAmount = sphereFade(wPos, 0.15, uShowChars);
                if (showAmount < 0.001) discard;
            }
        `);
  }, e;
};
}
