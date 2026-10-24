/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1630190:1631511.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2051(scope) {
scope.baseMaterial = function baseMaterial(r = {}) {
  const e = {},
    i = new scope.ShaderMaterial({
      name: "base",
      defines: e,
      uniformsGroups: [scope.global$1.UBO],
      uniforms: scope.UniformsUtils.clone(scope.uniforms),
      vertexShader: scope.vertex,
      fragmentShader: scope.fragment,
      lights: !0
    });
  return e.USE_UV = !0, i.uniforms.tColors.value = scope.textureLoader.load("atlas.png", "srgb-nearest"), i.uniforms.tNoise.value = scope.textureLoader.load("noise-simplex-layered-pixellated-highq.ktx2", "linearfilter-repeat"), i.uniforms.tNoiseTerrain.value = scope.textureLoader.load("noises-terrain.ktx2", "linearfilter-repeat"), (r.isTerrain || r.frontShadow) && (e.IS_TERRAIN = !0, i.shadowSide = scope.FrontSide), r.isCharacters && (e.IS_CHARACTER = 1, e.USE_SKINNING = 1, e.HARD_CUT_SHADOW = !0, i.shadowSide = scope.FrontSide, i.uniforms.boneTexture = {
    value: null
  }, i.uniforms.batchingTexture = {
    value: null
  }, i.uniforms.batchingIdTexture = {
    value: null
  }, i.uniforms.uWetHeight = {
    value: 0
  }, i.uniforms.tEye = {
    value: scope.textureLoader.load("mainchar-eye-highq.ktx2", "repeat")
  }), r.isNPC && (e.IS_NPC = 1, e.HARD_CUT_SHADOW = !0, i.uniforms.tEye = {
    value: scope.textureLoader.load("eye-highq.ktx2", "repeat")
  }, i.uniforms.uNPCSeed = {
    value: Math.random()
  }, i.uniforms.tMouth = {
    value: scope.textureLoader.load("mouth-highq.ktx2", "repeat")
  }, i.uniforms.uMouthColor = {
    value: new scope.Color("#2f1013")
  }, i.uniforms.uIsTalking = {
    value: 0
  }), (r.isCharacters || r.isNPC) && (i.uniforms.uSkinColor = {
    value: new scope.Color("#ebced0")
  }), r.isGive && (e.IS_GIVE = 1), i;
};
}
