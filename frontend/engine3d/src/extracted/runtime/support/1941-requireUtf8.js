/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1447085:1448228.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1941(scope) {
scope.requireUtf8 = function requireUtf8() {
  return scope.hasRequiredUtf8 || (scope.hasRequiredUtf8 = 1, function (r) {
    var e = r;
    e.length = function (s) {
      for (var a = 0, o = 0, l = 0; l < s.length; ++l) o = s.charCodeAt(l), o < 128 ? a += 1 : o < 2048 ? a += 2 : (o & 64512) === 55296 && (s.charCodeAt(l + 1) & 64512) === 56320 ? (++l, a += 4) : a += 3;
      return a;
    }, e.read = function (s, a, o) {
      var l = o - a;
      if (l < 1) return "";
      for (var c = null, h = [], d = 0, p; a < o;) p = s[a++], p < 128 ? h[d++] = p : p > 191 && p < 224 ? h[d++] = (p & 31) << 6 | s[a++] & 63 : p > 239 && p < 365 ? (p = ((p & 7) << 18 | (s[a++] & 63) << 12 | (s[a++] & 63) << 6 | s[a++] & 63) - 65536, h[d++] = 55296 + (p >> 10), h[d++] = 56320 + (p & 1023)) : h[d++] = (p & 15) << 12 | (s[a++] & 63) << 6 | s[a++] & 63, d > 8191 && ((c || (c = [])).push(String.fromCharCode.apply(String, h)), d = 0);
      return c ? (d && c.push(String.fromCharCode.apply(String, h.slice(0, d))), c.join("")) : String.fromCharCode.apply(String, h.slice(0, d));
    }, e.write = function (s, a, o) {
      for (var l = o, c, h, d = 0; d < s.length; ++d) c = s.charCodeAt(d), c < 128 ? a[o++] = c : c < 2048 ? (a[o++] = c >> 6 | 192, a[o++] = c & 63 | 128) : (c & 64512) === 55296 && ((h = s.charCodeAt(d + 1)) & 64512) === 56320 ? (c = 65536 + ((c & 1023) << 10) + (h & 1023), ++d, a[o++] = c >> 18 | 240, a[o++] = c >> 12 & 63 | 128, a[o++] = c >> 6 & 63 | 128, a[o++] = c & 63 | 128) : (a[o++] = c >> 12 | 224, a[o++] = c >> 6 & 63 | 128, a[o++] = c & 63 | 128);
      return o - l;
    };
  }(scope.utf8)), scope.utf8;
};
}
