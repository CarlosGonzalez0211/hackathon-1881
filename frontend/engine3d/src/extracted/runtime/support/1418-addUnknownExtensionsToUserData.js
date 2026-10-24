/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 863788:863981.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1418(scope) {
scope.addUnknownExtensionsToUserData = function addUnknownExtensionsToUserData(r, e, i) {
  for (const s in i.extensions) r[s] === void 0 && (e.userData.gltfExtensions = e.userData.gltfExtensions || {}, e.userData.gltfExtensions[s] = i.extensions[s]);
};
}
