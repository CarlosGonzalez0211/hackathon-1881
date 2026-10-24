/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1506421:1508527.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1976(scope) {
scope.requireOneof = function requireOneof() {
  if (scope.hasRequiredOneof) return scope.oneof;
  scope.hasRequiredOneof = 1, scope.oneof = s;
  var r = scope.requireObject();
  ((s.prototype = Object.create(r.prototype)).constructor = s).className = "OneOf";
  var e = scope.requireField(),
    i = scope.requireUtil();
  function s(o, l, c, h) {
    if (Array.isArray(l) || (c = l, l = void 0), r.call(this, o, c), !(l === void 0 || Array.isArray(l))) throw TypeError("fieldNames must be an Array");
    this.oneof = l || [], this.fieldsArray = [], this.comment = h;
  }
  s.fromJSON = function (l, c) {
    return new s(l, c.oneof, c.options, c.comment);
  }, s.prototype.toJSON = function (l) {
    var c = l ? !!l.keepComments : !1;
    return i.toObject(["options", this.options, "oneof", this.oneof, "comment", c ? this.comment : void 0]);
  };
  function a(o) {
    if (o.parent) for (var l = 0; l < o.fieldsArray.length; ++l) o.fieldsArray[l].parent || o.parent.add(o.fieldsArray[l]);
  }
  return s.prototype.add = function (l) {
    if (!(l instanceof e)) throw TypeError("field must be a Field");
    return l.parent && l.parent !== this.parent && l.parent.remove(l), this.oneof.push(l.name), this.fieldsArray.push(l), l.partOf = this, a(this), this;
  }, s.prototype.remove = function (l) {
    if (!(l instanceof e)) throw TypeError("field must be a Field");
    var c = this.fieldsArray.indexOf(l);
    if (c < 0) throw Error(l + " is not a member of " + this);
    return this.fieldsArray.splice(c, 1), c = this.oneof.indexOf(l.name), c > -1 && this.oneof.splice(c, 1), l.partOf = null, this;
  }, s.prototype.onAdd = function (l) {
    r.prototype.onAdd.call(this, l);
    for (var c = this, h = 0; h < this.oneof.length; ++h) {
      var d = l.get(this.oneof[h]);
      d && !d.partOf && (d.partOf = c, c.fieldsArray.push(d));
    }
    a(this);
  }, s.prototype.onRemove = function (l) {
    for (var c = 0, h; c < this.fieldsArray.length; ++c) (h = this.fieldsArray[c]).parent && h.parent.remove(h);
    r.prototype.onRemove.call(this, l);
  }, Object.defineProperty(s.prototype, "isProto3Optional", {
    get: function () {
      if (this.fieldsArray == null || this.fieldsArray.length !== 1) return !1;
      var o = this.fieldsArray[0];
      return o.options != null && o.options.proto3_optional === !0;
    }
  }), s.d = function () {
    for (var l = new Array(arguments.length), c = 0; c < arguments.length;) l[c] = arguments[c++];
    return function (d, p) {
      i.decorateType(d.constructor).add(new s(p, l)), Object.defineProperty(d, p, {
        get: i.oneOfGetter(l),
        set: i.oneOfSetter(l)
      });
    };
  }, scope.oneof;
};
}
