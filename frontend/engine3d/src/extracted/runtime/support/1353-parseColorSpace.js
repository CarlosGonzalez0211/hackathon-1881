/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 827871:828232.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1353(scope) {
scope.parseColorSpace = function parseColorSpace(r) {
  const e = r.dataFormatDescriptor[0];
  return e.colorPrimaries === scope.E ? e.transferFunction === scope.y ? scope.SRGBColorSpace : scope.LinearSRGBColorSpace : e.colorPrimaries === scope.X ? e.transferFunction === scope.y ? scope.DisplayP3ColorSpace : scope.LinearDisplayP3ColorSpace : (e.colorPrimaries === scope.S || console.warn(`THREE.KTX2Loader: Unsupported color primaries, "${e.colorPrimaries}"`), scope.NoColorSpace);
};
}
