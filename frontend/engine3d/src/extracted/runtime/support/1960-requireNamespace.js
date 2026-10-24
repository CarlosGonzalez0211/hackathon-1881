/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1467099:1472413.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1960(scope) {
scope.requireNamespace = function requireNamespace() {
  if (scope.hasRequiredNamespace) return scope.namespace;
  scope.hasRequiredNamespace = 1, scope.namespace = h;
  var r = scope.requireObject();
  ((h.prototype = Object.create(r.prototype)).constructor = h).className = "Namespace";
  var e = scope.requireField(),
    i = scope.requireUtil(),
    s = scope.requireOneof(),
    a,
    o,
    l;
  h.fromJSON = function (f, _) {
    return new h(f, _.options).addJSON(_.nested);
  };
  function c(p, f) {
    if (p && p.length) {
      for (var _ = {}, x = 0; x < p.length; ++x) _[p[x].name] = p[x].toJSON(f);
      return _;
    }
  }
  h.arrayToJSON = c, h.isReservedId = function (f, _) {
    if (f) {
      for (var x = 0; x < f.length; ++x) if (typeof f[x] != "string" && f[x][0] <= _ && f[x][1] > _) return !0;
    }
    return !1;
  }, h.isReservedName = function (f, _) {
    if (f) {
      for (var x = 0; x < f.length; ++x) if (f[x] === _) return !0;
    }
    return !1;
  };
  function h(p, f) {
    r.call(this, p, f), this.nested = void 0, this._nestedArray = null, this._lookupCache = {}, this._needsRecursiveFeatureResolution = !0, this._needsRecursiveResolve = !0;
  }
  function d(p) {
    p._nestedArray = null, p._lookupCache = {};
    for (var f = p; f = f.parent;) f._lookupCache = {};
    return p;
  }
  return Object.defineProperty(h.prototype, "nestedArray", {
    get: function () {
      return this._nestedArray || (this._nestedArray = i.toArray(this.nested));
    }
  }), h.prototype.toJSON = function (f) {
    return i.toObject(["options", this.options, "nested", c(this.nestedArray, f)]);
  }, h.prototype.addJSON = function (f) {
    var _ = this;
    if (f) for (var x = Object.keys(f), b = 0, T; b < x.length; ++b) T = f[x[b]], _.add((T.fields !== void 0 ? a.fromJSON : T.values !== void 0 ? l.fromJSON : T.methods !== void 0 ? o.fromJSON : T.id !== void 0 ? e.fromJSON : h.fromJSON)(x[b], T));
    return this;
  }, h.prototype.get = function (f) {
    return this.nested && this.nested[f] || null;
  }, h.prototype.getEnum = function (f) {
    if (this.nested && this.nested[f] instanceof l) return this.nested[f].values;
    throw Error("no such enum: " + f);
  }, h.prototype.add = function (f) {
    if (!(f instanceof e && f.extend !== void 0 || f instanceof a || f instanceof s || f instanceof l || f instanceof o || f instanceof h)) throw TypeError("object must be a valid nested object");
    if (!this.nested) this.nested = {};else {
      var _ = this.get(f.name);
      if (_) if (_ instanceof h && f instanceof h && !(_ instanceof a || _ instanceof o)) {
        for (var x = _.nestedArray, b = 0; b < x.length; ++b) f.add(x[b]);
        this.remove(_), this.nested || (this.nested = {}), f.setOptions(_.options, !0);
      } else throw Error("duplicate name '" + f.name + "' in " + this);
    }
    this.nested[f.name] = f, this instanceof a || this instanceof o || this instanceof l || this instanceof e || f._edition || (f._edition = f._defaultEdition), this._needsRecursiveFeatureResolution = !0, this._needsRecursiveResolve = !0;
    for (var T = this; T = T.parent;) T._needsRecursiveFeatureResolution = !0, T._needsRecursiveResolve = !0;
    return f.onAdd(this), d(this);
  }, h.prototype.remove = function (f) {
    if (!(f instanceof r)) throw TypeError("object must be a ReflectionObject");
    if (f.parent !== this) throw Error(f + " is not a member of " + this);
    return delete this.nested[f.name], Object.keys(this.nested).length || (this.nested = void 0), f.onRemove(this), d(this);
  }, h.prototype.define = function (f, _) {
    if (i.isString(f)) f = f.split(".");else if (!Array.isArray(f)) throw TypeError("illegal path");
    if (f && f.length && f[0] === "") throw Error("path must be relative");
    for (var x = this; f.length > 0;) {
      var b = f.shift();
      if (x.nested && x.nested[b]) {
        if (x = x.nested[b], !(x instanceof h)) throw Error("path conflicts with non-namespace objects");
      } else x.add(x = new h(b));
    }
    return _ && x.addJSON(_), x;
  }, h.prototype.resolveAll = function () {
    if (!this._needsRecursiveResolve) return this;
    this._resolveFeaturesRecursive(this._edition);
    var f = this.nestedArray,
      _ = 0;
    for (this.resolve(); _ < f.length;) f[_] instanceof h ? f[_++].resolveAll() : f[_++].resolve();
    return this._needsRecursiveResolve = !1, this;
  }, h.prototype._resolveFeaturesRecursive = function (f) {
    return this._needsRecursiveFeatureResolution ? (this._needsRecursiveFeatureResolution = !1, f = this._edition || f, r.prototype._resolveFeaturesRecursive.call(this, f), this.nestedArray.forEach(_ => {
      _._resolveFeaturesRecursive(f);
    }), this) : this;
  }, h.prototype.lookup = function (f, _, x) {
    if (typeof _ == "boolean" ? (x = _, _ = void 0) : _ && !Array.isArray(_) && (_ = [_]), i.isString(f) && f.length) {
      if (f === ".") return this.root;
      f = f.split(".");
    } else if (!f.length) return this;
    var b = f.join(".");
    if (f[0] === "") return this.root.lookup(f.slice(1), _);
    var T = this.root._fullyQualifiedObjects && this.root._fullyQualifiedObjects["." + b];
    if (T && (!_ || _.indexOf(T.constructor) > -1) || (T = this._lookupImpl(f, b), T && (!_ || _.indexOf(T.constructor) > -1))) return T;
    if (x) return null;
    for (var M = this; M.parent;) {
      if (T = M.parent._lookupImpl(f, b), T && (!_ || _.indexOf(T.constructor) > -1)) return T;
      M = M.parent;
    }
    return null;
  }, h.prototype._lookupImpl = function (f, _) {
    if (Object.prototype.hasOwnProperty.call(this._lookupCache, _)) return this._lookupCache[_];
    var x = this.get(f[0]),
      b = null;
    if (x) f.length === 1 ? b = x : x instanceof h && (f = f.slice(1), b = x._lookupImpl(f, f.join(".")));else for (var T = 0; T < this.nestedArray.length; ++T) this._nestedArray[T] instanceof h && (x = this._nestedArray[T]._lookupImpl(f, _)) && (b = x);
    return this._lookupCache[_] = b, b;
  }, h.prototype.lookupType = function (f) {
    var _ = this.lookup(f, [a]);
    if (!_) throw Error("no such type: " + f);
    return _;
  }, h.prototype.lookupEnum = function (f) {
    var _ = this.lookup(f, [l]);
    if (!_) throw Error("no such Enum '" + f + "' in " + this);
    return _;
  }, h.prototype.lookupTypeOrEnum = function (f) {
    var _ = this.lookup(f, [a, l]);
    if (!_) throw Error("no such Type or Enum '" + f + "' in " + this);
    return _;
  }, h.prototype.lookupService = function (f) {
    var _ = this.lookup(f, [o]);
    if (!_) throw Error("no such Service '" + f + "' in " + this);
    return _;
  }, h._configure = function (p, f, _) {
    a = p, o = f, l = _;
  }, scope.namespace;
};
}
