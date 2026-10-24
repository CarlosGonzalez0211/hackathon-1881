/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1498978:1501241.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1973(scope) {
scope.requireUtil = function requireUtil() {
  if (scope.hasRequiredUtil) return scope.util.exports;
  scope.hasRequiredUtil = 1;
  var r = scope.util.exports = scope.requireMinimal(),
    e = scope.requireRoots(),
    i,
    s;
  r.codegen = scope.requireCodegen(), r.fetch = scope.requireFetch(), r.path = scope.requirePath(), r.fs = r.inquire("fs"), r.toArray = function (d) {
    if (d) {
      for (var p = Object.keys(d), f = new Array(p.length), _ = 0; _ < p.length;) f[_] = d[p[_++]];
      return f;
    }
    return [];
  }, r.toObject = function (d) {
    for (var p = {}, f = 0; f < d.length;) {
      var _ = d[f++],
        x = d[f++];
      x !== void 0 && (p[_] = x);
    }
    return p;
  };
  var a = /\\/g,
    o = /"/g;
  r.isReserved = function (d) {
    return /^(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$/.test(d);
  }, r.safeProp = function (d) {
    return !/^[$\w_]+$/.test(d) || r.isReserved(d) ? '["' + d.replace(a, "\\\\").replace(o, '\\"') + '"]' : "." + d;
  }, r.ucFirst = function (d) {
    return d.charAt(0).toUpperCase() + d.substring(1);
  };
  var l = /_([a-z])/g;
  r.camelCase = function (d) {
    return d.substring(0, 1) + d.substring(1).replace(l, function (p, f) {
      return f.toUpperCase();
    });
  }, r.compareFieldsById = function (d, p) {
    return d.id - p.id;
  }, r.decorateType = function (d, p) {
    if (d.$type) return p && d.$type.name !== p && (r.decorateRoot.remove(d.$type), d.$type.name = p, r.decorateRoot.add(d.$type)), d.$type;
    i || (i = scope.requireType());
    var f = new i(p || d.name);
    return r.decorateRoot.add(f), f.ctor = d, Object.defineProperty(d, "$type", {
      value: f,
      enumerable: !1
    }), Object.defineProperty(d.prototype, "$type", {
      value: f,
      enumerable: !1
    }), f;
  };
  var c = 0;
  return r.decorateEnum = function (d) {
    if (d.$type) return d.$type;
    s || (s = scope.require_enum());
    var p = new s("Enum" + c++, d);
    return r.decorateRoot.add(p), Object.defineProperty(d, "$type", {
      value: p,
      enumerable: !1
    }), p;
  }, r.setProperty = function (d, p, f, _) {
    function x(b, T, M) {
      var w = T.shift();
      if (w === "__proto__" || w === "prototype") return b;
      if (T.length > 0) b[w] = x(b[w] || {}, T, M);else {
        var D = b[w];
        if (D && _) return b;
        D && (M = [].concat(D).concat(M)), b[w] = M;
      }
      return b;
    }
    if (typeof d != "object") throw TypeError("dst must be an object");
    if (!p) throw TypeError("path must be specified");
    return p = p.split("."), x(d, p, f);
  }, Object.defineProperty(r, "decorateRoot", {
    get: function () {
      return e.decorated || (e.decorated = new (scope.requireRoot())());
    }
  }), scope.util.exports;
};
}
