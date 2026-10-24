/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 863981:864177.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1419(scope) {
scope.assignExtrasToUserData = function assignExtrasToUserData(r, e) {
  e.extras !== void 0 && (typeof e.extras == "object" ? Object.assign(r.userData, e.extras) : console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + e.extras));
};
}
