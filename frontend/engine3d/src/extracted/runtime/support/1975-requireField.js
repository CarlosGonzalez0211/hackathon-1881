/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1501835:1506394.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1975(scope) {
scope.requireField = function requireField() {
  if (scope.hasRequiredField) return scope.field;
  scope.hasRequiredField = 1, scope.field = l;
  var r = scope.requireObject();
  ((l.prototype = Object.create(r.prototype)).constructor = l).className = "Field";
  var e = scope.require_enum(),
    i = scope.requireTypes(),
    s = scope.requireUtil(),
    a,
    o = /^required|optional|repeated$/;
  l.fromJSON = function (h, d) {
    var p = new l(h, d.id, d.type, d.rule, d.extend, d.options, d.comment);
    return d.edition && (p._edition = d.edition), p._defaultEdition = "proto3", p;
  };
  function l(c, h, d, p, f, _, x) {
    if (s.isObject(p) ? (x = f, _ = p, p = f = void 0) : s.isObject(f) && (x = _, _ = f, f = void 0), r.call(this, c, _), !s.isInteger(h) || h < 0) throw TypeError("id must be a non-negative integer");
    if (!s.isString(d)) throw TypeError("type must be a string");
    if (p !== void 0 && !o.test(p = p.toString().toLowerCase())) throw TypeError("rule must be a string rule");
    if (f !== void 0 && !s.isString(f)) throw TypeError("extend must be a string");
    p === "proto3_optional" && (p = "optional"), this.rule = p && p !== "optional" ? p : void 0, this.type = d, this.id = h, this.extend = f || void 0, this.repeated = p === "repeated", this.map = !1, this.message = null, this.partOf = null, this.typeDefault = null, this.defaultValue = null, this.long = s.Long ? i.long[d] !== void 0 : !1, this.bytes = d === "bytes", this.resolvedType = null, this.extensionField = null, this.declaringField = null, this.comment = x;
  }
  return Object.defineProperty(l.prototype, "required", {
    get: function () {
      return this._features.field_presence === "LEGACY_REQUIRED";
    }
  }), Object.defineProperty(l.prototype, "optional", {
    get: function () {
      return !this.required;
    }
  }), Object.defineProperty(l.prototype, "delimited", {
    get: function () {
      return this.resolvedType instanceof a && this._features.message_encoding === "DELIMITED";
    }
  }), Object.defineProperty(l.prototype, "packed", {
    get: function () {
      return this._features.repeated_field_encoding === "PACKED";
    }
  }), Object.defineProperty(l.prototype, "hasPresence", {
    get: function () {
      return this.repeated || this.map ? !1 : this.partOf || this.declaringField || this.extensionField || this._features.field_presence !== "IMPLICIT";
    }
  }), l.prototype.setOption = function (h, d, p) {
    return r.prototype.setOption.call(this, h, d, p);
  }, l.prototype.toJSON = function (h) {
    var d = h ? !!h.keepComments : !1;
    return s.toObject(["edition", this._editionToJSON(), "rule", this.rule !== "optional" && this.rule || void 0, "type", this.type, "id", this.id, "extend", this.extend, "options", this.options, "comment", d ? this.comment : void 0]);
  }, l.prototype.resolve = function () {
    if (this.resolved) return this;
    if ((this.typeDefault = i.defaults[this.type]) === void 0 ? (this.resolvedType = (this.declaringField ? this.declaringField.parent : this.parent).lookupTypeOrEnum(this.type), this.resolvedType instanceof a ? this.typeDefault = null : this.typeDefault = this.resolvedType.values[Object.keys(this.resolvedType.values)[0]]) : this.options && this.options.proto3_optional && (this.typeDefault = null), this.options && this.options.default != null && (this.typeDefault = this.options.default, this.resolvedType instanceof e && typeof this.typeDefault == "string" && (this.typeDefault = this.resolvedType.values[this.typeDefault])), this.options && (this.options.packed !== void 0 && this.resolvedType && !(this.resolvedType instanceof e) && delete this.options.packed, Object.keys(this.options).length || (this.options = void 0)), this.long) this.typeDefault = s.Long.fromNumber(this.typeDefault, this.type.charAt(0) === "u"), Object.freeze && Object.freeze(this.typeDefault);else if (this.bytes && typeof this.typeDefault == "string") {
      var h;
      s.base64.test(this.typeDefault) ? s.base64.decode(this.typeDefault, h = s.newBuffer(s.base64.length(this.typeDefault)), 0) : s.utf8.write(this.typeDefault, h = s.newBuffer(s.utf8.length(this.typeDefault)), 0), this.typeDefault = h;
    }
    return this.map ? this.defaultValue = s.emptyObject : this.repeated ? this.defaultValue = s.emptyArray : this.defaultValue = this.typeDefault, this.parent instanceof a && (this.parent.ctor.prototype[this.name] = this.defaultValue), r.prototype.resolve.call(this);
  }, l.prototype._inferLegacyProtoFeatures = function (h) {
    if (h !== "proto2" && h !== "proto3") return {};
    var d = {};
    if (this.rule === "required" && (d.field_presence = "LEGACY_REQUIRED"), this.parent && i.defaults[this.type] === void 0) {
      var p = this.parent.get(this.type.split(".").pop());
      p && p instanceof a && p.group && (d.message_encoding = "DELIMITED");
    }
    return this.getOption("packed") === !0 ? d.repeated_field_encoding = "PACKED" : this.getOption("packed") === !1 && (d.repeated_field_encoding = "EXPANDED"), d;
  }, l.prototype._resolveFeatures = function (h) {
    return r.prototype._resolveFeatures.call(this, this._edition || h);
  }, l.d = function (h, d, p, f) {
    return typeof d == "function" ? d = s.decorateType(d).name : d && typeof d == "object" && (d = s.decorateEnum(d).name), function (x, b) {
      s.decorateType(x.constructor).add(new l(b, h, d, p, {
        default: f
      }));
    };
  }, l._configure = function (h) {
    a = h;
  }, scope.field;
};
}
