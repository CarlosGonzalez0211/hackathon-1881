/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 243788:243867.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0687(scope) {
scope.removeDupEndPts = function removeDupEndPts(r) {
  const e = r.length;
  e > 2 && r[e - 1].equals(r[0]) && r.pop();
};
}
