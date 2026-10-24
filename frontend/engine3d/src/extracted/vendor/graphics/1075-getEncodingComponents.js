/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 525891:526294.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1075(scope) {
scope.getEncodingComponents = function getEncodingComponents(r) {
  scope.ColorManagement._getMatrix(scope._m0$5, scope.ColorManagement.workingColorSpace, r);
  const e = `mat3( ${scope._m0$5.elements.map(i => i.toFixed(4))} )`;
  switch (scope.ColorManagement.getTransfer(r)) {
    case scope.LinearTransfer:
      return [e, "LinearTransferOETF"];
    case scope.SRGBTransfer:
      return [e, "sRGBTransferOETF"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported color space: ", r), [e, "LinearTransferOETF"];
  }
};
}
