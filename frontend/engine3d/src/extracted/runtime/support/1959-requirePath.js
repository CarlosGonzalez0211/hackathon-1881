/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1466520:1467064.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1959(scope) {
scope.requirePath = function requirePath() {
  return scope.hasRequiredPath || (scope.hasRequiredPath = 1, function (r) {
    var e = r,
      i = e.isAbsolute = function (o) {
        return /^(?:\/|\w+:)/.test(o);
      },
      s = e.normalize = function (o) {
        o = o.replace(/\\/g, "/").replace(/\/{2,}/g, "/");
        var l = o.split("/"),
          c = i(o),
          h = "";
        c && (h = l.shift() + "/");
        for (var d = 0; d < l.length;) l[d] === ".." ? d > 0 && l[d - 1] !== ".." ? l.splice(--d, 2) : c ? l.splice(d, 1) : ++d : l[d] === "." ? l.splice(d, 1) : ++d;
        return h + l.join("/");
      };
    e.resolve = function (o, l, c) {
      return c || (l = s(l)), i(l) ? l : (c || (o = s(o)), (o = o.replace(/(?:\/|^)[^/]+$/, "")).length ? s(o + "/" + l) : l);
    };
  }(scope.path)), scope.path;
};
}
