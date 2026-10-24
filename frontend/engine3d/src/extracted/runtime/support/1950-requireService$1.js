/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1462626:1463759.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1950(scope) {
scope.requireService$1 = function requireService$1() {
  if (scope.hasRequiredService$1) return scope.service$1;
  scope.hasRequiredService$1 = 1, scope.service$1 = e;
  var r = scope.requireMinimal();
  (e.prototype = Object.create(r.EventEmitter.prototype)).constructor = e;
  function e(i, s, a) {
    if (typeof i != "function") throw TypeError("rpcImpl must be a function");
    r.EventEmitter.call(this), this.rpcImpl = i, this.requestDelimited = !!s, this.responseDelimited = !!a;
  }
  return e.prototype.rpcCall = function i(s, a, o, l, c) {
    if (!l) throw TypeError("request must be specified");
    var h = this;
    if (!c) return r.asPromise(i, h, s, a, o, l);
    if (!h.rpcImpl) {
      scope.__lifecycle.setTimeout(function () {
        c(Error("already ended"));
      }, 0);
      return;
    }
    try {
      return h.rpcImpl(s, a[h.requestDelimited ? "encodeDelimited" : "encode"](l).finish(), function (p, f) {
        if (p) return h.emit("error", p, s), c(p);
        if (f === null) {
          h.end(!0);
          return;
        }
        if (!(f instanceof o)) try {
          f = o[h.responseDelimited ? "decodeDelimited" : "decode"](f);
        } catch (_) {
          return h.emit("error", _, s), c(_);
        }
        return h.emit("data", f, s), c(null, f);
      });
    } catch (d) {
      h.emit("error", d, s), scope.__lifecycle.setTimeout(function () {
        c(d);
      }, 0);
      return;
    }
  }, e.prototype.end = function (s) {
    return this.rpcImpl && (s || this.rpcImpl(null, null, null), this.rpcImpl = null, this.emit("end").off()), this;
  }, scope.service$1;
};
}
