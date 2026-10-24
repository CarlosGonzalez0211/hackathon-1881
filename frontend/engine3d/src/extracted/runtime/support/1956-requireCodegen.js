/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1464573:1465537.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1956(scope) {
scope.requireCodegen = function requireCodegen() {
  if (scope.hasRequiredCodegen) return scope.codegen_1;
  scope.hasRequiredCodegen = 1, scope.codegen_1 = r;
  function r(e, i) {
    typeof e == "string" && (i = e, e = void 0);
    var s = [];
    function a(l) {
      if (typeof l != "string") {
        var c = o();
        if (r.verbose && console.log("codegen: " + c), c = "return " + c, l) {
          for (var h = Object.keys(l), d = new Array(h.length + 1), p = new Array(h.length), f = 0; f < h.length;) d[f] = h[f], p[f] = l[h[f++]];
          return d[f] = c, Function.apply(null, d).apply(null, p);
        }
        return Function(c)();
      }
      for (var _ = new Array(arguments.length - 1), x = 0; x < _.length;) _[x] = arguments[++x];
      if (x = 0, l = l.replace(/%([%dfijs])/g, function (T, M) {
        var w = _[x++];
        switch (M) {
          case "d":
          case "f":
            return String(Number(w));
          case "i":
            return String(Math.floor(w));
          case "j":
            return JSON.stringify(w);
          case "s":
            return String(w);
        }
        return "%";
      }), x !== _.length) throw Error("parameter count mismatch");
      return s.push(l), a;
    }
    function o(l) {
      return "function " + (l || i || "") + "(" + (e && e.join(",") || "") + `){
  ` + s.join(`
  `) + `
}`;
    }
    return a.toString = o, a;
  }
  return r.verbose = !1, scope.codegen_1;
};
}
