/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1512350:1514930.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1978(scope) {
scope.require_enum = function require_enum() {
  if (scope.hasRequired_enum) return scope._enum;
  scope.hasRequired_enum = 1, scope._enum = s;
  var r = scope.requireObject();
  ((s.prototype = Object.create(r.prototype)).constructor = s).className = "Enum";
  var e = scope.requireNamespace(),
    i = scope.requireUtil();
  function s(a, o, l, c, h, d) {
    if (r.call(this, a, l), o && typeof o != "object") throw TypeError("values must be an object");
    if (this.valuesById = {}, this.values = Object.create(this.valuesById), this.comment = c, this.comments = h || {}, this.valuesOptions = d, this._valuesFeatures = {}, this.reserved = void 0, o) for (var p = Object.keys(o), f = 0; f < p.length; ++f) typeof o[p[f]] == "number" && (this.valuesById[this.values[p[f]] = o[p[f]]] = p[f]);
  }
  return s.prototype._resolveFeatures = function (o) {
    return o = this._edition || o, r.prototype._resolveFeatures.call(this, o), Object.keys(this.values).forEach(l => {
      var c = Object.assign({}, this._features);
      this._valuesFeatures[l] = Object.assign(c, this.valuesOptions && this.valuesOptions[l] && this.valuesOptions[l].features);
    }), this;
  }, s.fromJSON = function (o, l) {
    var c = new s(o, l.values, l.options, l.comment, l.comments);
    return c.reserved = l.reserved, l.edition && (c._edition = l.edition), c._defaultEdition = "proto3", c;
  }, s.prototype.toJSON = function (o) {
    var l = o ? !!o.keepComments : !1;
    return i.toObject(["edition", this._editionToJSON(), "options", this.options, "valuesOptions", this.valuesOptions, "values", this.values, "reserved", this.reserved && this.reserved.length ? this.reserved : void 0, "comment", l ? this.comment : void 0, "comments", l ? this.comments : void 0]);
  }, s.prototype.add = function (o, l, c, h) {
    if (!i.isString(o)) throw TypeError("name must be a string");
    if (!i.isInteger(l)) throw TypeError("id must be an integer");
    if (this.values[o] !== void 0) throw Error("duplicate name '" + o + "' in " + this);
    if (this.isReservedId(l)) throw Error("id " + l + " is reserved in " + this);
    if (this.isReservedName(o)) throw Error("name '" + o + "' is reserved in " + this);
    if (this.valuesById[l] !== void 0) {
      if (!(this.options && this.options.allow_alias)) throw Error("duplicate id " + l + " in " + this);
      this.values[o] = l;
    } else this.valuesById[this.values[o] = l] = o;
    return h && (this.valuesOptions === void 0 && (this.valuesOptions = {}), this.valuesOptions[o] = h || null), this.comments[o] = c || null, this;
  }, s.prototype.remove = function (o) {
    if (!i.isString(o)) throw TypeError("name must be a string");
    var l = this.values[o];
    if (l == null) throw Error("name '" + o + "' does not exist in " + this);
    return delete this.valuesById[l], delete this.values[o], delete this.comments[o], this.valuesOptions && delete this.valuesOptions[o], this;
  }, s.prototype.isReservedId = function (o) {
    return e.isReservedId(this.reserved, o);
  }, s.prototype.isReservedName = function (o) {
    return e.isReservedName(this.reserved, o);
  }, scope._enum;
};
}
