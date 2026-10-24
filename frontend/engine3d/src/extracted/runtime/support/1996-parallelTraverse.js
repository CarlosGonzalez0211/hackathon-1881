/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1550114:1550238.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1996(scope) {
scope.parallelTraverse = function parallelTraverse(r, e, i) {
  i(r, e);
  for (let s = 0; s < r.children.length; s++) scope.parallelTraverse(r.children[s], e.children[s], i);
};
}
