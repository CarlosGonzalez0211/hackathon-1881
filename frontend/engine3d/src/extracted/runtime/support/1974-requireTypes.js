/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1501262:1501808.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1974(scope) {
scope.requireTypes = function requireTypes() {
  return scope.hasRequiredTypes || (scope.hasRequiredTypes = 1, function (r) {
    var e = r,
      i = scope.requireUtil(),
      s = ["double", "float", "int32", "uint32", "sint32", "fixed32", "sfixed32", "int64", "uint64", "sint64", "fixed64", "sfixed64", "bool", "string", "bytes"];
    function a(o, l) {
      var c = 0,
        h = {};
      for (l |= 0; c < o.length;) h[s[c + l]] = o[c++];
      return h;
    }
    e.basic = a([1, 5, 0, 0, 0, 5, 5, 0, 0, 0, 1, 1, 0, 2, 2]), e.defaults = a([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, !1, "", i.emptyArray, null]), e.long = a([0, 0, 0, 1, 1], 7), e.mapKey = a([0, 0, 0, 5, 5, 0, 0, 0, 1, 1, 0, 2], 2), e.packed = a([1, 5, 0, 0, 0, 5, 5, 0, 0, 0, 1, 1, 0]);
  }(scope.types)), scope.types;
};
}
