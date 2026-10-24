/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1465566:1466492.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1957(scope) {
scope.requireFetch = function requireFetch() {
  if (scope.hasRequiredFetch) return scope.fetch_1;
  scope.hasRequiredFetch = 1, scope.fetch_1 = s;
  var r = scope.requireAspromise(),
    e = scope.requireInquire(),
    i = e("fs");
  function s(a, o, l) {
    return typeof o == "function" ? (l = o, o = {}) : o || (o = {}), l ? !o.xhr && i && i.readFile ? i.readFile(a, function (h, d) {
      return h && typeof XMLHttpRequest < "u" ? s.xhr(a, o, l) : h ? l(h) : l(null, o.binary ? d : d.toString("utf8"));
    }) : s.xhr(a, o, l) : r(s, this, a, o);
  }
  return s.xhr = function (o, l, c) {
    var h = new XMLHttpRequest();
    h.onreadystatechange = function () {
      if (h.readyState === 4) {
        if (h.status !== 0 && h.status !== 200) return c(Error("status " + h.status));
        if (l.binary) {
          var p = h.response;
          if (!p) {
            p = [];
            for (var f = 0; f < h.responseText.length; ++f) p.push(h.responseText.charCodeAt(f) & 255);
          }
          return c(null, typeof Uint8Array < "u" ? new Uint8Array(p) : p);
        }
        return c(null, h.responseText);
      }
    }, l.binary && ("overrideMimeType" in h && h.overrideMimeType("text/plain; charset=x-user-defined"), h.responseType = "arraybuffer"), h.open("GET", o), h.send();
  }, scope.fetch_1;
};
}
