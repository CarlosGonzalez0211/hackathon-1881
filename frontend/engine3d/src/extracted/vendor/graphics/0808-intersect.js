/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 318890:319073.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0808(scope) {
scope.intersect = function intersect(r, e, i, s) {
  let a = !0;
  if (r.layers.test(e.layers) && r.raycast(e, i) === !1 && (a = !1), a === !0 && s === !0) {
    const o = r.children;
    for (let l = 0, c = o.length; l < c; l++) scope.intersect(o[l], e, i, !0);
  }
};
}
