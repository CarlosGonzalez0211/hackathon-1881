/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 240979:241085.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0668(scope) {
scope.getLeftmost = function getLeftmost(r) {
  let e = r,
    i = r;
  do (e.x < i.x || e.x === i.x && e.y < i.y) && (i = e), e = e.next; while (e !== r);
  return i;
};
}
