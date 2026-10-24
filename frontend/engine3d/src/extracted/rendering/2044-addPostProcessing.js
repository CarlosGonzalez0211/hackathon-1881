/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1615914:1616845.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2044(scope) {
scope.addPostProcessing = function addPostProcessing(r, e) {
  const i = new scope.waterPass({
    scene: r
  });
  r.waterPass = i, r.waterScene = i.scene, r._subscenes = [i.scene];
  const s = new scope.MultipleRenderPass({
    scene: r,
    rtCount: 2,
    rtOptions: {
      depthBuffer: !0
    },
    clearColor: new scope.Color("#000000"),
    clearAlpha: scope.global$1.renderer.clearAlpha,
    onAfterMultiRender: () => {
      i.render();
    },
    finalMaterials: [new scope.outlines(r)]
  });
  s.renderTarget.depthTexture = new scope.DepthTexture(), i.multiplePass = s, e.passes.splice(0, 1), e.addPass(s), e === scope.global$1.composer && (scope.global$1.renderPass = s);
  const a = s.renderTarget.textures;
  a[0].name = "color", a[1].name = "info", s.finalPasses[0].uniforms.tInfo.value = a[1], s.finalPasses[0].uniforms.tWater.value = i.rt.texture, scope.adjustOutlinesUniforms(r, e), e === scope.global$1.composer && (s.finalPasses[0]._fsQuad._mesh.name = "Big Triangle", scope.gui$1.add(s.finalPasses[0]._fsQuad._mesh, "post-outline"));
  const o = new scope.RenderPass$1(new scope.Scene(), new scope.OrthographicCamera(-1, 1, 1, -1, 0, 1));
  o.clear = !1, r.__controlsPass = o, e.insertPass(o, 1);
};
}
