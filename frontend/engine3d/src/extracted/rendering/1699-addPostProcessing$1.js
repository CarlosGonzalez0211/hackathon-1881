/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1209559:1210159.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1699(scope) {
scope.addPostProcessing$1 = function addPostProcessing$1(r, e) {
  const i = new scope.MultipleRenderPass({
    scene: r,
    rtCount: 2,
    rtOptions: {
      depthBuffer: !0
    },
    clearColor: new scope.Color("#000000"),
    clearAlpha: scope.global$1.renderer.clearAlpha,
    onAfterMultiRender: () => {},
    finalMaterials: [new scope.outlines$1(r)]
  });
  e.passes.splice(0, 1), e.addPass(i), e === scope.global$1.composer && (scope.global$1.renderPass = i);
  const s = i.renderTarget.textures;
  s[0].name = "color", s[1].name = "info", i.finalPasses[0].uniforms.tInfo.value = s[1], scope.adjustOutlinesUniforms$1(r, e), e === scope.global$1.composer && (i.finalPasses[0]._fsQuad._mesh.name = "Big Triangle", scope.gui$1.add(i.finalPasses[0]._fsQuad._mesh, "post-outline"));
};
}
