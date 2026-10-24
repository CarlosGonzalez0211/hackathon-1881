/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1029:1126.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0021(scope) {
scope.deferred = function deferred() {
  var r,
    e,
    i = new Promise((s, a) => {
      r = s, e = a;
    });
  return {
    promise: i,
    resolve: r,
    reject: e
  };
};
}
