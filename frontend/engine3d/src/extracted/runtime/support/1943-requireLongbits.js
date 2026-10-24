/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1448549:1450418.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1943(scope) {
scope.requireLongbits = function requireLongbits() {
  if (scope.hasRequiredLongbits) return scope.longbits;
  scope.hasRequiredLongbits = 1, scope.longbits = e;
  var r = scope.requireMinimal();
  function e(o, l) {
    this.lo = o >>> 0, this.hi = l >>> 0;
  }
  var i = e.zero = new e(0, 0);
  i.toNumber = function () {
    return 0;
  }, i.zzEncode = i.zzDecode = function () {
    return this;
  }, i.length = function () {
    return 1;
  };
  var s = e.zeroHash = "\0\0\0\0\0\0\0\0";
  e.fromNumber = function (l) {
    if (l === 0) return i;
    var c = l < 0;
    c && (l = -l);
    var h = l >>> 0,
      d = (l - h) / 4294967296 >>> 0;
    return c && (d = ~d >>> 0, h = ~h >>> 0, ++h > 4294967295 && (h = 0, ++d > 4294967295 && (d = 0))), new e(h, d);
  }, e.from = function (l) {
    if (typeof l == "number") return e.fromNumber(l);
    if (r.isString(l)) if (r.Long) l = r.Long.fromString(l);else return e.fromNumber(parseInt(l, 10));
    return l.low || l.high ? new e(l.low >>> 0, l.high >>> 0) : i;
  }, e.prototype.toNumber = function (l) {
    if (!l && this.hi >>> 31) {
      var c = ~this.lo + 1 >>> 0,
        h = ~this.hi >>> 0;
      return c || (h = h + 1 >>> 0), -(c + h * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
  }, e.prototype.toLong = function (l) {
    return r.Long ? new r.Long(this.lo | 0, this.hi | 0, !!l) : {
      low: this.lo | 0,
      high: this.hi | 0,
      unsigned: !!l
    };
  };
  var a = String.prototype.charCodeAt;
  return e.fromHash = function (l) {
    return l === s ? i : new e((a.call(l, 0) | a.call(l, 1) << 8 | a.call(l, 2) << 16 | a.call(l, 3) << 24) >>> 0, (a.call(l, 4) | a.call(l, 5) << 8 | a.call(l, 6) << 16 | a.call(l, 7) << 24) >>> 0);
  }, e.prototype.toHash = function () {
    return String.fromCharCode(this.lo & 255, this.lo >>> 8 & 255, this.lo >>> 16 & 255, this.lo >>> 24, this.hi & 255, this.hi >>> 8 & 255, this.hi >>> 16 & 255, this.hi >>> 24);
  }, e.prototype.zzEncode = function () {
    var l = this.hi >> 31;
    return this.hi = ((this.hi << 1 | this.lo >>> 31) ^ l) >>> 0, this.lo = (this.lo << 1 ^ l) >>> 0, this;
  }, e.prototype.zzDecode = function () {
    var l = -(this.lo & 1);
    return this.lo = ((this.lo >>> 1 | this.hi << 31) ^ l) >>> 0, this.hi = (this.hi >>> 1 ^ l) >>> 0, this;
  }, e.prototype.length = function () {
    var l = this.lo,
      c = (this.lo >>> 28 | this.hi << 4) >>> 0,
      h = this.hi >>> 24;
    return h === 0 ? c === 0 ? l < 16384 ? l < 128 ? 1 : 2 : l < 2097152 ? 3 : 4 : c < 16384 ? c < 128 ? 5 : 6 : c < 2097152 ? 7 : 8 : h < 128 ? 9 : 10;
  }, scope.longbits;
};
}
