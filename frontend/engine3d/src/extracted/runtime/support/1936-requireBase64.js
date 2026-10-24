/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1441676:1442939.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1936(scope) {
scope.requireBase64 = function requireBase64() {
  return scope.hasRequiredBase64 || (scope.hasRequiredBase64 = 1, function (r) {
    var e = r;
    e.length = function (c) {
      var h = c.length;
      if (!h) return 0;
      for (var d = 0; --h % 4 > 1 && c.charAt(h) === "=";) ++d;
      return Math.ceil(c.length * 3) / 4 - d;
    };
    for (var i = new Array(64), s = new Array(123), a = 0; a < 64;) s[i[a] = a < 26 ? a + 65 : a < 52 ? a + 71 : a < 62 ? a - 4 : a - 59 | 43] = a++;
    e.encode = function (c, h, d) {
      for (var p = null, f = [], _ = 0, x = 0, b; h < d;) {
        var T = c[h++];
        switch (x) {
          case 0:
            f[_++] = i[T >> 2], b = (T & 3) << 4, x = 1;
            break;
          case 1:
            f[_++] = i[b | T >> 4], b = (T & 15) << 2, x = 2;
            break;
          case 2:
            f[_++] = i[b | T >> 6], f[_++] = i[T & 63], x = 0;
            break;
        }
        _ > 8191 && ((p || (p = [])).push(String.fromCharCode.apply(String, f)), _ = 0);
      }
      return x && (f[_++] = i[b], f[_++] = 61, x === 1 && (f[_++] = 61)), p ? (_ && p.push(String.fromCharCode.apply(String, f.slice(0, _))), p.join("")) : String.fromCharCode.apply(String, f.slice(0, _));
    };
    var o = "invalid encoding";
    e.decode = function (c, h, d) {
      for (var p = d, f = 0, _, x = 0; x < c.length;) {
        var b = c.charCodeAt(x++);
        if (b === 61 && f > 1) break;
        if ((b = s[b]) === void 0) throw Error(o);
        switch (f) {
          case 0:
            _ = b, f = 1;
            break;
          case 1:
            h[d++] = _ << 2 | (b & 48) >> 4, _ = b, f = 2;
            break;
          case 2:
            h[d++] = (_ & 15) << 4 | (b & 60) >> 2, _ = b, f = 3;
            break;
          case 3:
            h[d++] = (_ & 3) << 6 | b, f = 0;
            break;
        }
      }
      if (f === 1) throw Error(o);
      return d - p;
    }, e.test = function (c) {
      return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(c);
    };
  }(scope.base64)), scope.base64;
};
}
