/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1495513:1498958.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1972(scope) {
scope.requireRoot = function requireRoot() {
  if (scope.hasRequiredRoot) return scope.root$2;
  scope.hasRequiredRoot = 1, scope.root$2 = h;
  var r = scope.requireNamespace();
  ((h.prototype = Object.create(r.prototype)).constructor = h).className = "Root";
  var e = scope.requireField(),
    i = scope.require_enum(),
    s = scope.requireOneof(),
    a = scope.requireUtil(),
    o,
    l,
    c;
  function h(_) {
    r.call(this, "", _), this.deferred = [], this.files = [], this._edition = "proto2", this._fullyQualifiedObjects = {};
  }
  h.fromJSON = function (x, b) {
    return b || (b = new h()), x.options && b.setOptions(x.options), b.addJSON(x.nested).resolveAll();
  }, h.prototype.resolvePath = a.path.resolve, h.prototype.fetch = a.fetch;
  function d() {}
  h.prototype.load = function _(x, b, T) {
    typeof b == "function" && (T = b, b = void 0);
    var M = this;
    if (!T) return a.asPromise(_, M, x, b);
    var w = T === d;
    function D(F, k) {
      if (T) {
        if (w) throw F;
        k && k.resolveAll();
        var W = T;
        T = null, W(F, k);
      }
    }
    function R(F) {
      var k = F.lastIndexOf("google/protobuf/");
      if (k > -1) {
        var W = F.substring(k);
        if (W in c) return W;
      }
      return null;
    }
    function P(F, k) {
      try {
        if (a.isString(k) && k.charAt(0) === "{" && (k = JSON.parse(k)), !a.isString(k)) M.setOptions(k.options).addJSON(k.nested);else {
          l.filename = F;
          var W = l(k, M, b),
            $,
            Z = 0;
          if (W.imports) for (; Z < W.imports.length; ++Z) ($ = R(W.imports[Z]) || M.resolvePath(F, W.imports[Z])) && U($);
          if (W.weakImports) for (Z = 0; Z < W.weakImports.length; ++Z) ($ = R(W.weakImports[Z]) || M.resolvePath(F, W.weakImports[Z])) && U($, !0);
        }
      } catch (J) {
        D(J);
      }
      !w && !O && D(null, M);
    }
    function U(F, k) {
      if (F = R(F) || F, !(M.files.indexOf(F) > -1)) {
        if (M.files.push(F), F in c) {
          w ? P(F, c[F]) : (++O, scope.__lifecycle.setTimeout(function () {
            --O, P(F, c[F]);
          }));
          return;
        }
        if (w) {
          var W;
          try {
            W = a.fs.readFileSync(F).toString("utf8");
          } catch ($) {
            k || D($);
            return;
          }
          P(F, W);
        } else ++O, M.fetch(F, function ($, Z) {
          if (--O, !!T) {
            if ($) {
              k ? O || D(null, M) : D($);
              return;
            }
            P(F, Z);
          }
        });
      }
    }
    var O = 0;
    a.isString(x) && (x = [x]);
    for (var N = 0, H; N < x.length; ++N) (H = M.resolvePath("", x[N])) && U(H);
    return w ? (M.resolveAll(), M) : (O || D(null, M), M);
  }, h.prototype.loadSync = function (x, b) {
    if (!a.isNode) throw Error("not supported");
    return this.load(x, b, d);
  }, h.prototype.resolveAll = function () {
    if (!this._needsRecursiveResolve) return this;
    if (this.deferred.length) throw Error("unresolvable extensions: " + this.deferred.map(function (x) {
      return "'extend " + x.extend + "' in " + x.parent.fullName;
    }).join(", "));
    return r.prototype.resolveAll.call(this);
  };
  var p = /^[A-Z]/;
  function f(_, x) {
    var b = x.parent.lookup(x.extend);
    if (b) {
      var T = new e(x.fullName, x.id, x.type, x.rule, void 0, x.options);
      return b.get(T.name) || (T.declaringField = x, x.extensionField = T, b.add(T)), !0;
    }
    return !1;
  }
  return h.prototype._handleAdd = function (x) {
    if (x instanceof e) x.extend !== void 0 && !x.extensionField && (f(this, x) || this.deferred.push(x));else if (x instanceof i) p.test(x.name) && (x.parent[x.name] = x.values);else if (!(x instanceof s)) {
      if (x instanceof o) for (var b = 0; b < this.deferred.length;) f(this, this.deferred[b]) ? this.deferred.splice(b, 1) : ++b;
      for (var T = 0; T < x.nestedArray.length; ++T) this._handleAdd(x._nestedArray[T]);
      p.test(x.name) && (x.parent[x.name] = x);
    }
    (x instanceof o || x instanceof i || x instanceof e) && (this._fullyQualifiedObjects[x.fullName] = x);
  }, h.prototype._handleRemove = function (x) {
    if (x instanceof e) {
      if (x.extend !== void 0) if (x.extensionField) x.extensionField.parent.remove(x.extensionField), x.extensionField = null;else {
        var b = this.deferred.indexOf(x);
        b > -1 && this.deferred.splice(b, 1);
      }
    } else if (x instanceof i) p.test(x.name) && delete x.parent[x.name];else if (x instanceof r) {
      for (var T = 0; T < x.nestedArray.length; ++T) this._handleRemove(x._nestedArray[T]);
      p.test(x.name) && delete x.parent[x.name];
    }
    delete this._fullyQualifiedObjects[x.fullName];
  }, h._configure = function (_, x, b) {
    o = _, l = x, c = b;
  }, scope.root$2;
};
}
