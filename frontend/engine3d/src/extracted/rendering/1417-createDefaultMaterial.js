/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 863560:863788.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1417(scope) {
scope.createDefaultMaterial = function createDefaultMaterial(r) {
  return r.DefaultMaterial === void 0 && (r.DefaultMaterial = new scope.MeshStandardMaterial({
    color: 16777215,
    emissive: 0,
    metalness: 1,
    roughness: 1,
    transparent: !1,
    depthTest: !0,
    side: scope.FrontSide
  })), r.DefaultMaterial;
};
}
