/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 834692:834846.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1370(scope) {
scope.makeTextureAwaitable = function makeTextureAwaitable(r) {
  const e = scope.miscutils.deferred(),
    i = e.resolve;
  e.resolve = s => {
    delete r.then, i(s);
  }, r._loaded = e, r.then = (s, a) => r._loaded.then(s, a);
};
}
