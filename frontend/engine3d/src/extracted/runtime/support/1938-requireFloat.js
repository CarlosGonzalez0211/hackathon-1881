/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1443670:1446739.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1938(scope) {
scope.requireFloat = function requireFloat() {
  if (scope.hasRequiredFloat) return scope.float;
  scope.hasRequiredFloat = 1, scope.float = r(r);
  function r(o) {
    return typeof Float32Array < "u" ? function () {
      var l = new Float32Array([-0]),
        c = new Uint8Array(l.buffer),
        h = c[3] === 128;
      function d(x, b, T) {
        l[0] = x, b[T] = c[0], b[T + 1] = c[1], b[T + 2] = c[2], b[T + 3] = c[3];
      }
      function p(x, b, T) {
        l[0] = x, b[T] = c[3], b[T + 1] = c[2], b[T + 2] = c[1], b[T + 3] = c[0];
      }
      o.writeFloatLE = h ? d : p, o.writeFloatBE = h ? p : d;
      function f(x, b) {
        return c[0] = x[b], c[1] = x[b + 1], c[2] = x[b + 2], c[3] = x[b + 3], l[0];
      }
      function _(x, b) {
        return c[3] = x[b], c[2] = x[b + 1], c[1] = x[b + 2], c[0] = x[b + 3], l[0];
      }
      o.readFloatLE = h ? f : _, o.readFloatBE = h ? _ : f;
    }() : function () {
      function l(h, d, p, f) {
        var _ = d < 0 ? 1 : 0;
        if (_ && (d = -d), d === 0) h(1 / d > 0 ? 0 : 2147483648, p, f);else if (isNaN(d)) h(2143289344, p, f);else if (d > 34028234663852886e22) h((_ << 31 | 2139095040) >>> 0, p, f);else if (d < 11754943508222875e-54) h((_ << 31 | Math.round(d / 1401298464324817e-60)) >>> 0, p, f);else {
          var x = Math.floor(Math.log(d) / Math.LN2),
            b = Math.round(d * Math.pow(2, -x) * 8388608) & 8388607;
          h((_ << 31 | x + 127 << 23 | b) >>> 0, p, f);
        }
      }
      o.writeFloatLE = l.bind(null, e), o.writeFloatBE = l.bind(null, i);
      function c(h, d, p) {
        var f = h(d, p),
          _ = (f >> 31) * 2 + 1,
          x = f >>> 23 & 255,
          b = f & 8388607;
        return x === 255 ? b ? NaN : _ * (1 / 0) : x === 0 ? _ * 1401298464324817e-60 * b : _ * Math.pow(2, x - 150) * (b + 8388608);
      }
      o.readFloatLE = c.bind(null, s), o.readFloatBE = c.bind(null, a);
    }(), typeof Float64Array < "u" ? function () {
      var l = new Float64Array([-0]),
        c = new Uint8Array(l.buffer),
        h = c[7] === 128;
      function d(x, b, T) {
        l[0] = x, b[T] = c[0], b[T + 1] = c[1], b[T + 2] = c[2], b[T + 3] = c[3], b[T + 4] = c[4], b[T + 5] = c[5], b[T + 6] = c[6], b[T + 7] = c[7];
      }
      function p(x, b, T) {
        l[0] = x, b[T] = c[7], b[T + 1] = c[6], b[T + 2] = c[5], b[T + 3] = c[4], b[T + 4] = c[3], b[T + 5] = c[2], b[T + 6] = c[1], b[T + 7] = c[0];
      }
      o.writeDoubleLE = h ? d : p, o.writeDoubleBE = h ? p : d;
      function f(x, b) {
        return c[0] = x[b], c[1] = x[b + 1], c[2] = x[b + 2], c[3] = x[b + 3], c[4] = x[b + 4], c[5] = x[b + 5], c[6] = x[b + 6], c[7] = x[b + 7], l[0];
      }
      function _(x, b) {
        return c[7] = x[b], c[6] = x[b + 1], c[5] = x[b + 2], c[4] = x[b + 3], c[3] = x[b + 4], c[2] = x[b + 5], c[1] = x[b + 6], c[0] = x[b + 7], l[0];
      }
      o.readDoubleLE = h ? f : _, o.readDoubleBE = h ? _ : f;
    }() : function () {
      function l(h, d, p, f, _, x) {
        var b = f < 0 ? 1 : 0;
        if (b && (f = -f), f === 0) h(0, _, x + d), h(1 / f > 0 ? 0 : 2147483648, _, x + p);else if (isNaN(f)) h(0, _, x + d), h(2146959360, _, x + p);else if (f > 17976931348623157e292) h(0, _, x + d), h((b << 31 | 2146435072) >>> 0, _, x + p);else {
          var T;
          if (f < 22250738585072014e-324) T = f / 5e-324, h(T >>> 0, _, x + d), h((b << 31 | T / 4294967296) >>> 0, _, x + p);else {
            var M = Math.floor(Math.log(f) / Math.LN2);
            M === 1024 && (M = 1023), T = f * Math.pow(2, -M), h(T * 4503599627370496 >>> 0, _, x + d), h((b << 31 | M + 1023 << 20 | T * 1048576 & 1048575) >>> 0, _, x + p);
          }
        }
      }
      o.writeDoubleLE = l.bind(null, e, 0, 4), o.writeDoubleBE = l.bind(null, i, 4, 0);
      function c(h, d, p, f, _) {
        var x = h(f, _ + d),
          b = h(f, _ + p),
          T = (b >> 31) * 2 + 1,
          M = b >>> 20 & 2047,
          w = 4294967296 * (b & 1048575) + x;
        return M === 2047 ? w ? NaN : T * (1 / 0) : M === 0 ? T * 5e-324 * w : T * Math.pow(2, M - 1075) * (w + 4503599627370496);
      }
      o.readDoubleLE = c.bind(null, s, 0, 4), o.readDoubleBE = c.bind(null, a, 4, 0);
    }(), o;
  }
  function e(o, l, c) {
    l[c] = o & 255, l[c + 1] = o >>> 8 & 255, l[c + 2] = o >>> 16 & 255, l[c + 3] = o >>> 24;
  }
  function i(o, l, c) {
    l[c] = o >>> 24, l[c + 1] = o >>> 16 & 255, l[c + 2] = o >>> 8 & 255, l[c + 3] = o & 255;
  }
  function s(o, l) {
    return (o[l] | o[l + 1] << 8 | o[l + 2] << 16 | o[l + 3] << 24) >>> 0;
  }
  function a(o, l) {
    return (o[l] << 24 | o[l + 1] << 16 | o[l + 2] << 8 | o[l + 3]) >>> 0;
  }
  return scope.float;
};
}
