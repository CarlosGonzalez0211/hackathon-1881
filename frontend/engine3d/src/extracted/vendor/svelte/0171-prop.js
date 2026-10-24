/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 25750:25916.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0171(scope) {
scope.prop = function prop(r, e, i, s) {
  var a = s,
    o = !0,
    l = () => (o && (o = !1, a = s), a),
    c;
  c = r[e], c === void 0 && s !== void 0 && (c = l());
  var h;
  return h = () => {
    var d = r[e];
    return d === void 0 ? l() : (o = !0, d);
  }, h;
};
}
