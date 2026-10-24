/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1450441:1453691.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1944(scope) {
scope.requireMinimal = function requireMinimal() {
  return scope.hasRequiredMinimal || (scope.hasRequiredMinimal = 1, function (r) {
    var e = r;
    e.asPromise = scope.requireAspromise(), e.base64 = scope.requireBase64(), e.EventEmitter = scope.requireEventemitter(), e.float = scope.requireFloat(), e.inquire = scope.requireInquire(), e.utf8 = scope.requireUtf8(), e.pool = scope.requirePool(), e.LongBits = scope.requireLongbits(), e.isNode = !!(typeof scope.commonjsGlobal < "u" && scope.commonjsGlobal && scope.commonjsGlobal.process && scope.commonjsGlobal.process.versions && scope.commonjsGlobal.process.versions.node), e.global = e.isNode && scope.commonjsGlobal || typeof window < "u" && window || typeof self < "u" && self || scope.minimal, e.emptyArray = Object.freeze ? Object.freeze([]) : [], e.emptyObject = Object.freeze ? Object.freeze({}) : {}, e.isInteger = Number.isInteger || function (o) {
      return typeof o == "number" && isFinite(o) && Math.floor(o) === o;
    }, e.isString = function (o) {
      return typeof o == "string" || o instanceof String;
    }, e.isObject = function (o) {
      return o && typeof o == "object";
    }, e.isset = e.isSet = function (o, l) {
      var c = o[l];
      return c != null && o.hasOwnProperty(l) ? typeof c != "object" || (Array.isArray(c) ? c.length : Object.keys(c).length) > 0 : !1;
    }, e.Buffer = function () {
      try {
        var a = e.inquire("buffer").Buffer;
        return a.prototype.utf8Write ? a : null;
      } catch {
        return null;
      }
    }(), e._Buffer_from = null, e._Buffer_allocUnsafe = null, e.newBuffer = function (o) {
      return typeof o == "number" ? e.Buffer ? e._Buffer_allocUnsafe(o) : new e.Array(o) : e.Buffer ? e._Buffer_from(o) : typeof Uint8Array > "u" ? o : new Uint8Array(o);
    }, e.Array = typeof Uint8Array < "u" ? Uint8Array : Array, e.Long = e.global.dcodeIO && e.global.dcodeIO.Long || e.global.Long || e.inquire("long"), e.key2Re = /^true|false|0|1$/, e.key32Re = /^-?(?:0|[1-9][0-9]*)$/, e.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/, e.longToHash = function (o) {
      return o ? e.LongBits.from(o).toHash() : e.LongBits.zeroHash;
    }, e.longFromHash = function (o, l) {
      var c = e.LongBits.fromHash(o);
      return e.Long ? e.Long.fromBits(c.lo, c.hi, l) : c.toNumber(!!l);
    };
    function i(a, o, l) {
      for (var c = Object.keys(o), h = 0; h < c.length; ++h) (a[c[h]] === void 0 || !l) && (a[c[h]] = o[c[h]]);
      return a;
    }
    e.merge = i, e.lcFirst = function (o) {
      return o.charAt(0).toLowerCase() + o.substring(1);
    };
    function s(a) {
      function o(l, c) {
        if (!(this instanceof o)) return new o(l, c);
        Object.defineProperty(this, "message", {
          get: function () {
            return l;
          }
        }), Error.captureStackTrace ? Error.captureStackTrace(this, o) : Object.defineProperty(this, "stack", {
          value: new Error().stack || ""
        }), c && i(this, c);
      }
      return o.prototype = Object.create(Error.prototype, {
        constructor: {
          value: o,
          writable: !0,
          enumerable: !1,
          configurable: !0
        },
        name: {
          get: function () {
            return a;
          },
          set: void 0,
          enumerable: !1,
          configurable: !0
        },
        toString: {
          value: function () {
            return this.name + ": " + this.message;
          },
          writable: !0,
          enumerable: !1,
          configurable: !0
        }
      }), o;
    }
    e.newError = s, e.ProtocolError = s("ProtocolError"), e.oneOfGetter = function (o) {
      for (var l = {}, c = 0; c < o.length; ++c) l[o[c]] = 1;
      return function () {
        for (var h = Object.keys(this), d = h.length - 1; d > -1; --d) if (l[h[d]] === 1 && this[h[d]] !== void 0 && this[h[d]] !== null) return h[d];
      };
    }, e.oneOfSetter = function (o) {
      return function (l) {
        for (var c = 0; c < o.length; ++c) o[c] !== l && delete this[o[c]];
      };
    }, e.toJSONOptions = {
      longs: String,
      enums: String,
      bytes: String,
      json: !0
    }, e._configure = function () {
      var a = e.Buffer;
      if (!a) {
        e._Buffer_from = e._Buffer_allocUnsafe = null;
        return;
      }
      e._Buffer_from = a.from !== Uint8Array.from && a.from || function (l, c) {
        return new a(l, c);
      }, e._Buffer_allocUnsafe = a.allocUnsafe || function (l) {
        return new a(l);
      };
    };
  }(scope.minimal)), scope.minimal;
};
}
