/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1508556:1512323.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1977(scope) {
scope.requireObject = function requireObject() {
  if (scope.hasRequiredObject) return scope.object;
  scope.hasRequiredObject = 1, scope.object = l, l.className = "ReflectionObject";
  const r = scope.requireOneof();
  var e = scope.requireUtil(),
    i,
    s = {
      enum_type: "OPEN",
      field_presence: "EXPLICIT",
      json_format: "ALLOW",
      message_encoding: "LENGTH_PREFIXED",
      repeated_field_encoding: "PACKED",
      utf8_validation: "VERIFY"
    },
    a = {
      enum_type: "CLOSED",
      field_presence: "EXPLICIT",
      json_format: "LEGACY_BEST_EFFORT",
      message_encoding: "LENGTH_PREFIXED",
      repeated_field_encoding: "EXPANDED",
      utf8_validation: "NONE"
    },
    o = {
      enum_type: "OPEN",
      field_presence: "IMPLICIT",
      json_format: "ALLOW",
      message_encoding: "LENGTH_PREFIXED",
      repeated_field_encoding: "PACKED",
      utf8_validation: "VERIFY"
    };
  function l(c, h) {
    if (!e.isString(c)) throw TypeError("name must be a string");
    if (h && !e.isObject(h)) throw TypeError("options must be an object");
    this.options = h, this.parsedOptions = null, this.name = c, this._edition = null, this._defaultEdition = "proto2", this._features = {}, this._featuresResolved = !1, this.parent = null, this.resolved = !1, this.comment = null, this.filename = null;
  }
  return Object.defineProperties(l.prototype, {
    root: {
      get: function () {
        for (var c = this; c.parent !== null;) c = c.parent;
        return c;
      }
    },
    fullName: {
      get: function () {
        for (var c = [this.name], h = this.parent; h;) c.unshift(h.name), h = h.parent;
        return c.join(".");
      }
    }
  }), l.prototype.toJSON = function () {
    throw Error();
  }, l.prototype.onAdd = function (h) {
    this.parent && this.parent !== h && this.parent.remove(this), this.parent = h, this.resolved = !1;
    var d = h.root;
    d instanceof i && d._handleAdd(this);
  }, l.prototype.onRemove = function (h) {
    var d = h.root;
    d instanceof i && d._handleRemove(this), this.parent = null, this.resolved = !1;
  }, l.prototype.resolve = function () {
    return this.resolved ? this : (this.root instanceof i && (this.resolved = !0), this);
  }, l.prototype._resolveFeaturesRecursive = function (h) {
    return this._resolveFeatures(this._edition || h);
  }, l.prototype._resolveFeatures = function (h) {
    if (!this._featuresResolved) {
      var d = {};
      if (!h) throw new Error("Unknown edition for " + this.fullName);
      var p = Object.assign(this.options ? Object.assign({}, this.options.features) : {}, this._inferLegacyProtoFeatures(h));
      if (this._edition) {
        if (h === "proto2") d = Object.assign({}, a);else if (h === "proto3") d = Object.assign({}, o);else if (h === "2023") d = Object.assign({}, s);else throw new Error("Unknown edition: " + h);
        this._features = Object.assign(d, p || {}), this._featuresResolved = !0;
        return;
      }
      if (this.partOf instanceof r) {
        var f = Object.assign({}, this.partOf._features);
        this._features = Object.assign(f, p || {});
      } else if (!this.declaringField) if (this.parent) {
        var _ = Object.assign({}, this.parent._features);
        this._features = Object.assign(_, p || {});
      } else throw new Error("Unable to find a parent for " + this.fullName);
      this.extensionField && (this.extensionField._features = this._features), this._featuresResolved = !0;
    }
  }, l.prototype._inferLegacyProtoFeatures = function () {
    return {};
  }, l.prototype.getOption = function (h) {
    if (this.options) return this.options[h];
  }, l.prototype.setOption = function (h, d, p) {
    return this.options || (this.options = {}), /^features\./.test(h) ? e.setProperty(this.options, h, d, p) : (!p || this.options[h] === void 0) && (this.getOption(h) !== d && (this.resolved = !1), this.options[h] = d), this;
  }, l.prototype.setParsedOption = function (h, d, p) {
    this.parsedOptions || (this.parsedOptions = []);
    var f = this.parsedOptions;
    if (p) {
      var _ = f.find(function (T) {
        return Object.prototype.hasOwnProperty.call(T, h);
      });
      if (_) {
        var x = _[h];
        e.setProperty(x, p, d);
      } else _ = {}, _[h] = e.setProperty({}, p, d), f.push(_);
    } else {
      var b = {};
      b[h] = d, f.push(b);
    }
    return this;
  }, l.prototype.setOptions = function (h, d) {
    if (h) for (var p = Object.keys(h), f = 0; f < p.length; ++f) this.setOption(p[f], h[p[f]], d);
    return this;
  }, l.prototype.toString = function () {
    var h = this.constructor.className,
      d = this.fullName;
    return d.length ? h + " " + d : h;
  }, l.prototype._editionToJSON = function () {
    if (!(!this._edition || this._edition === "proto3")) return this._edition;
  }, l._configure = function (c) {
    i = c;
  }, scope.object;
};
}
