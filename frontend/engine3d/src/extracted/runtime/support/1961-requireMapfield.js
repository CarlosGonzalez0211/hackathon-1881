/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1472446:1473537.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1961(scope) {
scope.requireMapfield = function requireMapfield() {
  if (scope.hasRequiredMapfield) return scope.mapfield;
  scope.hasRequiredMapfield = 1, scope.mapfield = s;
  var r = scope.requireField();
  ((s.prototype = Object.create(r.prototype)).constructor = s).className = "MapField";
  var e = scope.requireTypes(),
    i = scope.requireUtil();
  function s(a, o, l, c, h, d) {
    if (r.call(this, a, o, c, void 0, void 0, h, d), !i.isString(l)) throw TypeError("keyType must be a string");
    this.keyType = l, this.resolvedKeyType = null, this.map = !0;
  }
  return s.fromJSON = function (o, l) {
    return new s(o, l.id, l.keyType, l.type, l.options, l.comment);
  }, s.prototype.toJSON = function (o) {
    var l = o ? !!o.keepComments : !1;
    return i.toObject(["keyType", this.keyType, "type", this.type, "id", this.id, "extend", this.extend, "options", this.options, "comment", l ? this.comment : void 0]);
  }, s.prototype.resolve = function () {
    if (this.resolved) return this;
    if (e.mapKey[this.keyType] === void 0) throw Error("invalid key type: " + this.keyType);
    return r.prototype.resolve.call(this);
  }, s.d = function (o, l, c) {
    return typeof c == "function" ? c = i.decorateType(c).name : c && typeof c == "object" && (c = i.decorateEnum(c).name), function (d, p) {
      i.decorateType(d.constructor).add(new s(p, o, l, c));
    };
  }, scope.mapfield;
};
}
