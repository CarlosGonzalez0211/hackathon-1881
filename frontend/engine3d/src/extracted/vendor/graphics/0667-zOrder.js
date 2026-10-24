/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 240746:240979.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0667(scope) {
scope.zOrder = function zOrder(r, e, i, s, a) {
  return r = (r - i) * a | 0, e = (e - s) * a | 0, r = (r | r << 8) & 16711935, r = (r | r << 4) & 252645135, r = (r | r << 2) & 858993459, r = (r | r << 1) & 1431655765, e = (e | e << 8) & 16711935, e = (e | e << 4) & 252645135, e = (e | e << 2) & 858993459, e = (e | e << 1) & 1431655765, r | e << 1;
};
}
