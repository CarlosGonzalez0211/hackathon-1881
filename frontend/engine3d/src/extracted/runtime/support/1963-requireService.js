/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1475073:1477427.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1963(scope) {
scope.requireService = function requireService() {
  if (scope.hasRequiredService) return scope.service;
  scope.hasRequiredService = 1, scope.service = a;
  var r = scope.requireNamespace();
  ((a.prototype = Object.create(r.prototype)).constructor = a).className = "Service";
  var e = scope.requireMethod(),
    i = scope.requireUtil(),
    s = scope.requireRpc();
  function a(l, c) {
    r.call(this, l, c), this.methods = {}, this._methodsArray = null;
  }
  a.fromJSON = function (c, h) {
    var d = new a(c, h.options);
    if (h.methods) for (var p = Object.keys(h.methods), f = 0; f < p.length; ++f) d.add(e.fromJSON(p[f], h.methods[p[f]]));
    return h.nested && d.addJSON(h.nested), h.edition && (d._edition = h.edition), d.comment = h.comment, d._defaultEdition = "proto3", d;
  }, a.prototype.toJSON = function (c) {
    var h = r.prototype.toJSON.call(this, c),
      d = c ? !!c.keepComments : !1;
    return i.toObject(["edition", this._editionToJSON(), "options", h && h.options || void 0, "methods", r.arrayToJSON(this.methodsArray, c) || {}, "nested", h && h.nested || void 0, "comment", d ? this.comment : void 0]);
  }, Object.defineProperty(a.prototype, "methodsArray", {
    get: function () {
      return this._methodsArray || (this._methodsArray = i.toArray(this.methods));
    }
  });
  function o(l) {
    return l._methodsArray = null, l;
  }
  return a.prototype.get = function (c) {
    return this.methods[c] || r.prototype.get.call(this, c);
  }, a.prototype.resolveAll = function () {
    if (!this._needsRecursiveResolve) return this;
    r.prototype.resolve.call(this);
    for (var c = this.methodsArray, h = 0; h < c.length; ++h) c[h].resolve();
    return this;
  }, a.prototype._resolveFeaturesRecursive = function (c) {
    return this._needsRecursiveFeatureResolution ? (c = this._edition || c, r.prototype._resolveFeaturesRecursive.call(this, c), this.methodsArray.forEach(h => {
      h._resolveFeaturesRecursive(c);
    }), this) : this;
  }, a.prototype.add = function (c) {
    if (this.get(c.name)) throw Error("duplicate name '" + c.name + "' in " + this);
    return c instanceof e ? (this.methods[c.name] = c, c.parent = this, o(this)) : r.prototype.add.call(this, c);
  }, a.prototype.remove = function (c) {
    if (c instanceof e) {
      if (this.methods[c.name] !== c) throw Error(c + " is not a member of " + this);
      return delete this.methods[c.name], c.parent = null, o(this);
    }
    return r.prototype.remove.call(this, c);
  }, a.prototype.create = function (c, h, d) {
    for (var p = new s.Service(c, h, d), f = 0, _; f < this.methodsArray.length; ++f) {
      var x = i.lcFirst((_ = this._methodsArray[f]).resolve().name).replace(/[^$\w_]/g, "");
      p[x] = i.codegen(["r", "c"], i.isReserved(x) ? x + "_" : x)("return this.rpcCall(m,q,s,r,c)")({
        m: _,
        q: _.resolvedRequestType.ctor,
        s: _.resolvedResponseType.ctor
      });
    }
    return p;
  }, scope.service;
};
}
