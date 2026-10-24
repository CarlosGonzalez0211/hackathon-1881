/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 156617:156797.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0519(scope) {
scope.getUnlitUniformColorSpace = function getUnlitUniformColorSpace(r) {
  const e = r.getRenderTarget();
  return e === null ? r.outputColorSpace : e.isXRRenderTarget === !0 ? e.texture.colorSpace : scope.ColorManagement.workingColorSpace;
};
}
