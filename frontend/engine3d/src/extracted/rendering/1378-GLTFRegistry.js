/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 844510:844665.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1378(scope) {
scope.GLTFRegistry = function GLTFRegistry() {
  let r = {};
  return {
    get: function (e) {
      return r[e];
    },
    add: function (e, i) {
      r[e] = i;
    },
    remove: function (e) {
      delete r[e];
    },
    removeAll: function () {
      r = {};
    }
  };
};
}
