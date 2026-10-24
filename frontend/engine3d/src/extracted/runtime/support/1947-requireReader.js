/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1457944:1461951.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1947(scope) {
scope.requireReader = function requireReader() {
  if (scope.hasRequiredReader) return scope.reader;
  scope.hasRequiredReader = 1, scope.reader = o;
  var r = scope.requireMinimal(),
    e,
    i = r.LongBits,
    s = r.utf8;
  function a(f, _) {
    return RangeError("index out of range: " + f.pos + " + " + (_ || 1) + " > " + f.len);
  }
  function o(f) {
    this.buf = f, this.pos = 0, this.len = f.length;
  }
  var l = typeof Uint8Array < "u" ? function (_) {
      if (_ instanceof Uint8Array || Array.isArray(_)) return new o(_);
      throw Error("illegal buffer");
    } : function (_) {
      if (Array.isArray(_)) return new o(_);
      throw Error("illegal buffer");
    },
    c = function () {
      return r.Buffer ? function (x) {
        return (o.create = function (T) {
          return r.Buffer.isBuffer(T) ? new e(T) : l(T);
        })(x);
      } : l;
    };
  o.create = c(), o.prototype._slice = r.Array.prototype.subarray || r.Array.prototype.slice, o.prototype.uint32 = function () {
    var _ = 4294967295;
    return function () {
      if (_ = (this.buf[this.pos] & 127) >>> 0, this.buf[this.pos++] < 128 || (_ = (_ | (this.buf[this.pos] & 127) << 7) >>> 0, this.buf[this.pos++] < 128) || (_ = (_ | (this.buf[this.pos] & 127) << 14) >>> 0, this.buf[this.pos++] < 128) || (_ = (_ | (this.buf[this.pos] & 127) << 21) >>> 0, this.buf[this.pos++] < 128) || (_ = (_ | (this.buf[this.pos] & 15) << 28) >>> 0, this.buf[this.pos++] < 128)) return _;
      if ((this.pos += 5) > this.len) throw this.pos = this.len, a(this, 10);
      return _;
    };
  }(), o.prototype.int32 = function () {
    return this.uint32() | 0;
  }, o.prototype.sint32 = function () {
    var _ = this.uint32();
    return _ >>> 1 ^ -(_ & 1) | 0;
  };
  function h() {
    var f = new i(0, 0),
      _ = 0;
    if (this.len - this.pos > 4) {
      for (; _ < 4; ++_) if (f.lo = (f.lo | (this.buf[this.pos] & 127) << _ * 7) >>> 0, this.buf[this.pos++] < 128) return f;
      if (f.lo = (f.lo | (this.buf[this.pos] & 127) << 28) >>> 0, f.hi = (f.hi | (this.buf[this.pos] & 127) >> 4) >>> 0, this.buf[this.pos++] < 128) return f;
      _ = 0;
    } else {
      for (; _ < 3; ++_) {
        if (this.pos >= this.len) throw a(this);
        if (f.lo = (f.lo | (this.buf[this.pos] & 127) << _ * 7) >>> 0, this.buf[this.pos++] < 128) return f;
      }
      return f.lo = (f.lo | (this.buf[this.pos++] & 127) << _ * 7) >>> 0, f;
    }
    if (this.len - this.pos > 4) {
      for (; _ < 5; ++_) if (f.hi = (f.hi | (this.buf[this.pos] & 127) << _ * 7 + 3) >>> 0, this.buf[this.pos++] < 128) return f;
    } else for (; _ < 5; ++_) {
      if (this.pos >= this.len) throw a(this);
      if (f.hi = (f.hi | (this.buf[this.pos] & 127) << _ * 7 + 3) >>> 0, this.buf[this.pos++] < 128) return f;
    }
    throw Error("invalid varint encoding");
  }
  o.prototype.bool = function () {
    return this.uint32() !== 0;
  };
  function d(f, _) {
    return (f[_ - 4] | f[_ - 3] << 8 | f[_ - 2] << 16 | f[_ - 1] << 24) >>> 0;
  }
  o.prototype.fixed32 = function () {
    if (this.pos + 4 > this.len) throw a(this, 4);
    return d(this.buf, this.pos += 4);
  }, o.prototype.sfixed32 = function () {
    if (this.pos + 4 > this.len) throw a(this, 4);
    return d(this.buf, this.pos += 4) | 0;
  };
  function p() {
    if (this.pos + 8 > this.len) throw a(this, 8);
    return new i(d(this.buf, this.pos += 4), d(this.buf, this.pos += 4));
  }
  return o.prototype.float = function () {
    if (this.pos + 4 > this.len) throw a(this, 4);
    var _ = r.float.readFloatLE(this.buf, this.pos);
    return this.pos += 4, _;
  }, o.prototype.double = function () {
    if (this.pos + 8 > this.len) throw a(this, 4);
    var _ = r.float.readDoubleLE(this.buf, this.pos);
    return this.pos += 8, _;
  }, o.prototype.bytes = function () {
    var _ = this.uint32(),
      x = this.pos,
      b = this.pos + _;
    if (b > this.len) throw a(this, _);
    if (this.pos += _, Array.isArray(this.buf)) return this.buf.slice(x, b);
    if (x === b) {
      var T = r.Buffer;
      return T ? T.alloc(0) : new this.buf.constructor(0);
    }
    return this._slice.call(this.buf, x, b);
  }, o.prototype.string = function () {
    var _ = this.bytes();
    return s.read(_, 0, _.length);
  }, o.prototype.skip = function (_) {
    if (typeof _ == "number") {
      if (this.pos + _ > this.len) throw a(this, _);
      this.pos += _;
    } else do if (this.pos >= this.len) throw a(this); while (this.buf[this.pos++] & 128);
    return this;
  }, o.prototype.skipType = function (f) {
    switch (f) {
      case 0:
        this.skip();
        break;
      case 1:
        this.skip(8);
        break;
      case 2:
        this.skip(this.uint32());
        break;
      case 3:
        for (; (f = this.uint32() & 7) !== 4;) this.skipType(f);
        break;
      case 5:
        this.skip(4);
        break;
      default:
        throw Error("invalid wire type " + f + " at offset " + this.pos);
    }
    return this;
  }, o._configure = function (f) {
    e = f, o.create = c(), e._configure();
    var _ = r.Long ? "toLong" : "toNumber";
    r.merge(o.prototype, {
      int64: function () {
        return h.call(this)[_](!1);
      },
      uint64: function () {
        return h.call(this)[_](!0);
      },
      sint64: function () {
        return h.call(this).zzDecode()[_](!1);
      },
      fixed64: function () {
        return p.call(this)[_](!0);
      },
      sfixed64: function () {
        return p.call(this)[_](!1);
      }
    });
  }, scope.reader;
};
}
