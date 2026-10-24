/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1453720:1456941.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1945(scope) {
scope.requireWriter = function requireWriter() {
  if (scope.hasRequiredWriter) return scope.writer;
  scope.hasRequiredWriter = 1, scope.writer = h;
  var r = scope.requireMinimal(),
    e,
    i = r.LongBits,
    s = r.base64,
    a = r.utf8;
  function o(M, w, D) {
    this.fn = M, this.len = w, this.next = void 0, this.val = D;
  }
  function l() {}
  function c(M) {
    this.head = M.head, this.tail = M.tail, this.len = M.len, this.next = M.states;
  }
  function h() {
    this.len = 0, this.head = new o(l, 0, 0), this.tail = this.head, this.states = null;
  }
  var d = function () {
    return r.Buffer ? function () {
      return (h.create = function () {
        return new e();
      })();
    } : function () {
      return new h();
    };
  };
  h.create = d(), h.alloc = function (w) {
    return new r.Array(w);
  }, r.Array !== Array && (h.alloc = r.pool(h.alloc, r.Array.prototype.subarray)), h.prototype._push = function (w, D, R) {
    return this.tail = this.tail.next = new o(w, D, R), this.len += D, this;
  };
  function p(M, w, D) {
    w[D] = M & 255;
  }
  function f(M, w, D) {
    for (; M > 127;) w[D++] = M & 127 | 128, M >>>= 7;
    w[D] = M;
  }
  function _(M, w) {
    this.len = M, this.next = void 0, this.val = w;
  }
  _.prototype = Object.create(o.prototype), _.prototype.fn = f, h.prototype.uint32 = function (w) {
    return this.len += (this.tail = this.tail.next = new _((w = w >>> 0) < 128 ? 1 : w < 16384 ? 2 : w < 2097152 ? 3 : w < 268435456 ? 4 : 5, w)).len, this;
  }, h.prototype.int32 = function (w) {
    return w < 0 ? this._push(x, 10, i.fromNumber(w)) : this.uint32(w);
  }, h.prototype.sint32 = function (w) {
    return this.uint32((w << 1 ^ w >> 31) >>> 0);
  };
  function x(M, w, D) {
    for (; M.hi;) w[D++] = M.lo & 127 | 128, M.lo = (M.lo >>> 7 | M.hi << 25) >>> 0, M.hi >>>= 7;
    for (; M.lo > 127;) w[D++] = M.lo & 127 | 128, M.lo = M.lo >>> 7;
    w[D++] = M.lo;
  }
  h.prototype.uint64 = function (w) {
    var D = i.from(w);
    return this._push(x, D.length(), D);
  }, h.prototype.int64 = h.prototype.uint64, h.prototype.sint64 = function (w) {
    var D = i.from(w).zzEncode();
    return this._push(x, D.length(), D);
  }, h.prototype.bool = function (w) {
    return this._push(p, 1, w ? 1 : 0);
  };
  function b(M, w, D) {
    w[D] = M & 255, w[D + 1] = M >>> 8 & 255, w[D + 2] = M >>> 16 & 255, w[D + 3] = M >>> 24;
  }
  h.prototype.fixed32 = function (w) {
    return this._push(b, 4, w >>> 0);
  }, h.prototype.sfixed32 = h.prototype.fixed32, h.prototype.fixed64 = function (w) {
    var D = i.from(w);
    return this._push(b, 4, D.lo)._push(b, 4, D.hi);
  }, h.prototype.sfixed64 = h.prototype.fixed64, h.prototype.float = function (w) {
    return this._push(r.float.writeFloatLE, 4, w);
  }, h.prototype.double = function (w) {
    return this._push(r.float.writeDoubleLE, 8, w);
  };
  var T = r.Array.prototype.set ? function (w, D, R) {
    D.set(w, R);
  } : function (w, D, R) {
    for (var P = 0; P < w.length; ++P) D[R + P] = w[P];
  };
  return h.prototype.bytes = function (w) {
    var D = w.length >>> 0;
    if (!D) return this._push(p, 1, 0);
    if (r.isString(w)) {
      var R = h.alloc(D = s.length(w));
      s.decode(w, R, 0), w = R;
    }
    return this.uint32(D)._push(T, D, w);
  }, h.prototype.string = function (w) {
    var D = a.length(w);
    return D ? this.uint32(D)._push(a.write, D, w) : this._push(p, 1, 0);
  }, h.prototype.fork = function () {
    return this.states = new c(this), this.head = this.tail = new o(l, 0, 0), this.len = 0, this;
  }, h.prototype.reset = function () {
    return this.states ? (this.head = this.states.head, this.tail = this.states.tail, this.len = this.states.len, this.states = this.states.next) : (this.head = this.tail = new o(l, 0, 0), this.len = 0), this;
  }, h.prototype.ldelim = function () {
    var w = this.head,
      D = this.tail,
      R = this.len;
    return this.reset().uint32(R), R && (this.tail.next = w.next, this.tail = D, this.len += R), this;
  }, h.prototype.finish = function () {
    for (var w = this.head.next, D = this.constructor.alloc(this.len), R = 0; w;) w.fn(w.val, D, R), R += w.len, w = w.next;
    return D;
  }, h._configure = function (M) {
    e = M, h.create = d(), e._configure();
  }, scope.writer;
};
}
