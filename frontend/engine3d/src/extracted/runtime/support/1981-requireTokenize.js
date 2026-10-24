/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1517500:1520131.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1981(scope) {
scope.requireTokenize = function requireTokenize() {
  if (scope.hasRequiredTokenize) return scope.tokenize_1;
  scope.hasRequiredTokenize = 1, scope.tokenize_1 = p;
  var r = /[\s{}=;:[\],'"()<>]/g,
    e = /(?:"([^"\\]*(?:\\.[^"\\]*)*)")/g,
    i = /(?:'([^'\\]*(?:\\.[^'\\]*)*)')/g,
    s = /^ *[*/]+ */,
    a = /^\s*\*?\/*/,
    o = /\n/g,
    l = /\s/,
    c = /\\(.?)/g,
    h = {
      0: "\0",
      r: "\r",
      n: `
`,
      t: "	"
    };
  function d(f) {
    return f.replace(c, function (_, x) {
      switch (x) {
        case "\\":
        case "":
          return x;
        default:
          return h[x] || "";
      }
    });
  }
  p.unescape = d;
  function p(f, _) {
    f = f.toString();
    var x = 0,
      b = f.length,
      T = 1,
      M = 0,
      w = {},
      D = [],
      R = null;
    function P(se) {
      return Error("illegal " + se + " (line " + T + ")");
    }
    function U() {
      var se = R === "'" ? i : e;
      se.lastIndex = x - 1;
      var re = se.exec(f);
      if (!re) throw P("string");
      return x = se.lastIndex, W(R), R = null, d(re[1]);
    }
    function O(se) {
      return f.charAt(se);
    }
    function N(se, re, he) {
      var ee = {
          type: f.charAt(se++),
          lineEmpty: !1,
          leading: he
        },
        Ie;
      _ ? Ie = 2 : Ie = 3;
      var Te = se - Ie,
        Ue;
      do if (--Te < 0 || (Ue = f.charAt(Te)) === `
`) {
        ee.lineEmpty = !0;
        break;
      } while (Ue === " " || Ue === "	");
      for (var nt = f.substring(se, re).split(o), mt = 0; mt < nt.length; ++mt) nt[mt] = nt[mt].replace(_ ? a : s, "").trim();
      ee.text = nt.join(`
`).trim(), w[T] = ee, M = T;
    }
    function H(se) {
      var re = F(se),
        he = f.substring(se, re),
        ee = /^\s*\/\//.test(he);
      return ee;
    }
    function F(se) {
      for (var re = se; re < b && O(re) !== `
`;) re++;
      return re;
    }
    function k() {
      if (D.length > 0) return D.shift();
      if (R) return U();
      var se,
        re,
        he,
        ee,
        Ie,
        Te = x === 0;
      do {
        if (x === b) return null;
        for (se = !1; l.test(he = O(x));) if (he === `
` && (Te = !0, ++T), ++x === b) return null;
        if (O(x) === "/") {
          if (++x === b) throw P("comment");
          if (O(x) === "/") {
            if (_) {
              if (ee = x, Ie = !1, H(x - 1)) {
                Ie = !0;
                do if (x = F(x), x === b || (x++, !Te)) break; while (H(x));
              } else x = Math.min(b, F(x) + 1);
              Ie && (N(ee, x, Te), Te = !0), T++, se = !0;
            } else {
              for (Ie = O(ee = x + 1) === "/"; O(++x) !== `
`;) if (x === b) return null;
              ++x, Ie && (N(ee, x - 1, Te), Te = !0), ++T, se = !0;
            }
          } else if ((he = O(x)) === "*") {
            ee = x + 1, Ie = _ || O(ee) === "*";
            do {
              if (he === `
` && ++T, ++x === b) throw P("comment");
              re = he, he = O(x);
            } while (re !== "*" || he !== "/");
            ++x, Ie && (N(ee, x - 2, Te), Te = !0), se = !0;
          } else return "/";
        }
      } while (se);
      var Ue = x;
      r.lastIndex = 0;
      var nt = r.test(O(Ue++));
      if (!nt) for (; Ue < b && !r.test(O(Ue));) ++Ue;
      var mt = f.substring(x, x = Ue);
      return (mt === '"' || mt === "'") && (R = mt), mt;
    }
    function W(se) {
      D.push(se);
    }
    function $() {
      if (!D.length) {
        var se = k();
        if (se === null) return null;
        W(se);
      }
      return D[0];
    }
    function Z(se, re) {
      var he = $(),
        ee = he === se;
      if (ee) return k(), !0;
      if (!re) throw P("token '" + he + "', '" + se + "' expected");
      return !1;
    }
    function J(se) {
      var re = null,
        he;
      return se === void 0 ? (he = w[T - 1], delete w[T - 1], he && (_ || he.type === "*" || he.lineEmpty) && (re = he.leading ? he.text : null)) : (M < se && $(), he = w[se], delete w[se], he && !he.lineEmpty && (_ || he.type === "/") && (re = he.leading ? null : he.text)), re;
    }
    return Object.defineProperty({
      next: k,
      peek: $,
      push: W,
      skip: Z,
      cmnt: J
    }, "line", {
      get: function () {
        return T;
      }
    });
  }
  return scope.tokenize_1;
};
}
