/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1473566:1475042.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1962(scope) {
scope.requireMethod = function requireMethod() {
  if (scope.hasRequiredMethod) return scope.method;
  scope.hasRequiredMethod = 1, scope.method = i;
  var r = scope.requireObject();
  ((i.prototype = Object.create(r.prototype)).constructor = i).className = "Method";
  var e = scope.requireUtil();
  function i(s, a, o, l, c, h, d, p, f) {
    if (e.isObject(c) ? (d = c, c = h = void 0) : e.isObject(h) && (d = h, h = void 0), !(a === void 0 || e.isString(a))) throw TypeError("type must be a string");
    if (!e.isString(o)) throw TypeError("requestType must be a string");
    if (!e.isString(l)) throw TypeError("responseType must be a string");
    r.call(this, s, d), this.type = a || "rpc", this.requestType = o, this.requestStream = c ? !0 : void 0, this.responseType = l, this.responseStream = h ? !0 : void 0, this.resolvedRequestType = null, this.resolvedResponseType = null, this.comment = p, this.parsedOptions = f;
  }
  return i.fromJSON = function (a, o) {
    return new i(a, o.type, o.requestType, o.responseType, o.requestStream, o.responseStream, o.options, o.comment, o.parsedOptions);
  }, i.prototype.toJSON = function (a) {
    var o = a ? !!a.keepComments : !1;
    return e.toObject(["type", this.type !== "rpc" && this.type || void 0, "requestType", this.requestType, "requestStream", this.requestStream, "responseType", this.responseType, "responseStream", this.responseStream, "options", this.options, "comment", o ? this.comment : void 0, "parsedOptions", this.parsedOptions]);
  }, i.prototype.resolve = function () {
    return this.resolved ? this : (this.resolvedRequestType = this.parent.lookupType(this.requestType), this.resolvedResponseType = this.parent.lookupType(this.responseType), r.prototype.resolve.call(this));
  }, scope.method;
};
}
