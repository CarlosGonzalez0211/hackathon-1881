/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 239281:239438.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0661(scope) {
scope.compareXYSlope = function compareXYSlope(r, e) {
  let i = r.x - e.x;
  if (i === 0 && (i = r.y - e.y, i === 0)) {
    const s = (r.next.y - r.y) / (r.next.x - r.x),
      a = (e.next.y - e.y) / (e.next.x - e.x);
    i = s - a;
  }
  return i;
};
}
