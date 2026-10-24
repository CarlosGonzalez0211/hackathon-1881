/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1487906:1488858.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1970(scope) {
scope.requireWrappers = function requireWrappers() {
  return scope.hasRequiredWrappers || (scope.hasRequiredWrappers = 1, function (r) {
    var e = r,
      i = scope.requireMessage();
    e[".google.protobuf.Any"] = {
      fromObject: function (s) {
        if (s && s["@type"]) {
          var a = s["@type"].substring(s["@type"].lastIndexOf("/") + 1),
            o = this.lookup(a);
          if (o) {
            var l = s["@type"].charAt(0) === "." ? s["@type"].slice(1) : s["@type"];
            return l.indexOf("/") === -1 && (l = "/" + l), this.create({
              type_url: l,
              value: o.encode(o.fromObject(s)).finish()
            });
          }
        }
        return this.fromObject(s);
      },
      toObject: function (s, a) {
        var o = "type.googleapis.com/",
          l = "",
          c = "";
        if (a && a.json && s.type_url && s.value) {
          c = s.type_url.substring(s.type_url.lastIndexOf("/") + 1), l = s.type_url.substring(0, s.type_url.lastIndexOf("/") + 1);
          var h = this.lookup(c);
          h && (s = h.decode(s.value));
        }
        if (!(s instanceof this.ctor) && s instanceof i) {
          var d = s.$type.toObject(s, a),
            p = s.$type.fullName[0] === "." ? s.$type.fullName.slice(1) : s.$type.fullName;
          return l === "" && (l = o), c = l + p, d["@type"] = c, d;
        }
        return this.toObject(s, a);
      }
    };
  }(scope.wrappers)), scope.wrappers;
};
}
