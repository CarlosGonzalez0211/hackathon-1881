/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 684948:709171.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1159(scope) {
scope.SVGLoader = class SVGLoader extends scope.Loader$1 {
  constructor(e) {
    super(e), this.defaultDPI = 90, this.defaultUnit = "px";
  }
  load(e, i, s, a) {
    const o = this,
      l = new scope.FileLoader(o.manager);
    l.setPath(o.path), l.setRequestHeader(o.requestHeader), l.setWithCredentials(o.withCredentials), l.load(e, function (c) {
      try {
        i(o.parse(c));
      } catch (h) {
        a ? a(h) : console.error(h), o.manager.itemError(e);
      }
    }, s, a);
  }
  parse(e) {
    const i = this;
    function s(ve, ne) {
      if (ve.nodeType !== 1) return;
      const z = P(ve);
      let V = !1,
        _e = null;
      switch (ve.nodeName) {
        case "svg":
          ne = b(ve, ne);
          break;
        case "style":
          o(ve);
          break;
        case "g":
          ne = b(ve, ne);
          break;
        case "path":
          ne = b(ve, ne), ve.hasAttribute("d") && (_e = a(ve));
          break;
        case "rect":
          ne = b(ve, ne), _e = h(ve);
          break;
        case "polygon":
          ne = b(ve, ne), _e = d(ve);
          break;
        case "polyline":
          ne = b(ve, ne), _e = p(ve);
          break;
        case "circle":
          ne = b(ve, ne), _e = f(ve);
          break;
        case "ellipse":
          ne = b(ve, ne), _e = _(ve);
          break;
        case "line":
          ne = b(ve, ne), _e = x(ve);
          break;
        case "defs":
          V = !0;
          break;
        case "use":
          ne = b(ve, ne);
          const Fe = (ve.getAttributeNS("http://www.w3.org/1999/xlink", "href") || "").substring(1),
            st = ve.viewportElement.getElementById(Fe);
          st ? s(st, ne) : console.warn("SVGLoader: 'use node' references non-existent node id: " + Fe);
          break;
      }
      _e && (ne.fill !== void 0 && ne.fill !== "none" && _e.color.setStyle(ne.fill, scope.COLOR_SPACE_SVG), O(_e, Ue), $.push(_e), _e.userData = {
        node: ve,
        style: ne
      });
      const Le = ve.childNodes;
      for (let pe = 0; pe < Le.length; pe++) {
        const Fe = Le[pe];
        V && Fe.nodeName !== "style" && Fe.nodeName !== "defs" || s(Fe, ne);
      }
      z && (J.pop(), J.length > 0 ? Ue.copy(J[J.length - 1]) : Ue.identity());
    }
    function a(ve) {
      const ne = new scope.ShapePath(),
        z = new scope.Vector2(),
        V = new scope.Vector2(),
        _e = new scope.Vector2();
      let Le = !0,
        pe = !1;
      const Fe = ve.getAttribute("d");
      if (Fe === "" || Fe === "none") return null;
      const st = Fe.match(/[a-df-z][^a-df-z]*/ig);
      for (let j = 0, De = st.length; j < De; j++) {
        const Pe = st[j],
          Oe = Pe.charAt(0),
          Be = Pe.slice(1).trim();
        Le === !0 && (pe = !0, Le = !1);
        let le;
        switch (Oe) {
          case "M":
            le = M(Be);
            for (let Y = 0, Xe = le.length; Y < Xe; Y += 2) z.x = le[Y + 0], z.y = le[Y + 1], V.x = z.x, V.y = z.y, Y === 0 ? ne.moveTo(z.x, z.y) : ne.lineTo(z.x, z.y), Y === 0 && _e.copy(z);
            break;
          case "H":
            le = M(Be);
            for (let Y = 0, Xe = le.length; Y < Xe; Y++) z.x = le[Y], V.x = z.x, V.y = z.y, ne.lineTo(z.x, z.y), Y === 0 && pe === !0 && _e.copy(z);
            break;
          case "V":
            le = M(Be);
            for (let Y = 0, Xe = le.length; Y < Xe; Y++) z.y = le[Y], V.x = z.x, V.y = z.y, ne.lineTo(z.x, z.y), Y === 0 && pe === !0 && _e.copy(z);
            break;
          case "L":
            le = M(Be);
            for (let Y = 0, Xe = le.length; Y < Xe; Y += 2) z.x = le[Y + 0], z.y = le[Y + 1], V.x = z.x, V.y = z.y, ne.lineTo(z.x, z.y), Y === 0 && pe === !0 && _e.copy(z);
            break;
          case "C":
            le = M(Be);
            for (let Y = 0, Xe = le.length; Y < Xe; Y += 6) ne.bezierCurveTo(le[Y + 0], le[Y + 1], le[Y + 2], le[Y + 3], le[Y + 4], le[Y + 5]), V.x = le[Y + 2], V.y = le[Y + 3], z.x = le[Y + 4], z.y = le[Y + 5], Y === 0 && pe === !0 && _e.copy(z);
            break;
          case "S":
            le = M(Be);
            for (let Y = 0, Xe = le.length; Y < Xe; Y += 4) ne.bezierCurveTo(T(z.x, V.x), T(z.y, V.y), le[Y + 0], le[Y + 1], le[Y + 2], le[Y + 3]), V.x = le[Y + 0], V.y = le[Y + 1], z.x = le[Y + 2], z.y = le[Y + 3], Y === 0 && pe === !0 && _e.copy(z);
            break;
          case "Q":
            le = M(Be);
            for (let Y = 0, Xe = le.length; Y < Xe; Y += 4) ne.quadraticCurveTo(le[Y + 0], le[Y + 1], le[Y + 2], le[Y + 3]), V.x = le[Y + 0], V.y = le[Y + 1], z.x = le[Y + 2], z.y = le[Y + 3], Y === 0 && pe === !0 && _e.copy(z);
            break;
          case "T":
            le = M(Be);
            for (let Y = 0, Xe = le.length; Y < Xe; Y += 2) {
              const vt = T(z.x, V.x),
                St = T(z.y, V.y);
              ne.quadraticCurveTo(vt, St, le[Y + 0], le[Y + 1]), V.x = vt, V.y = St, z.x = le[Y + 0], z.y = le[Y + 1], Y === 0 && pe === !0 && _e.copy(z);
            }
            break;
          case "A":
            le = M(Be, [3, 4], 7);
            for (let Y = 0, Xe = le.length; Y < Xe; Y += 7) {
              if (le[Y + 5] == z.x && le[Y + 6] == z.y) continue;
              const vt = z.clone();
              z.x = le[Y + 5], z.y = le[Y + 6], V.x = z.x, V.y = z.y, l(ne, le[Y], le[Y + 1], le[Y + 2], le[Y + 3], le[Y + 4], vt, z), Y === 0 && pe === !0 && _e.copy(z);
            }
            break;
          case "m":
            le = M(Be);
            for (let Y = 0, Xe = le.length; Y < Xe; Y += 2) z.x += le[Y + 0], z.y += le[Y + 1], V.x = z.x, V.y = z.y, Y === 0 ? ne.moveTo(z.x, z.y) : ne.lineTo(z.x, z.y), Y === 0 && _e.copy(z);
            break;
          case "h":
            le = M(Be);
            for (let Y = 0, Xe = le.length; Y < Xe; Y++) z.x += le[Y], V.x = z.x, V.y = z.y, ne.lineTo(z.x, z.y), Y === 0 && pe === !0 && _e.copy(z);
            break;
          case "v":
            le = M(Be);
            for (let Y = 0, Xe = le.length; Y < Xe; Y++) z.y += le[Y], V.x = z.x, V.y = z.y, ne.lineTo(z.x, z.y), Y === 0 && pe === !0 && _e.copy(z);
            break;
          case "l":
            le = M(Be);
            for (let Y = 0, Xe = le.length; Y < Xe; Y += 2) z.x += le[Y + 0], z.y += le[Y + 1], V.x = z.x, V.y = z.y, ne.lineTo(z.x, z.y), Y === 0 && pe === !0 && _e.copy(z);
            break;
          case "c":
            le = M(Be);
            for (let Y = 0, Xe = le.length; Y < Xe; Y += 6) ne.bezierCurveTo(z.x + le[Y + 0], z.y + le[Y + 1], z.x + le[Y + 2], z.y + le[Y + 3], z.x + le[Y + 4], z.y + le[Y + 5]), V.x = z.x + le[Y + 2], V.y = z.y + le[Y + 3], z.x += le[Y + 4], z.y += le[Y + 5], Y === 0 && pe === !0 && _e.copy(z);
            break;
          case "s":
            le = M(Be);
            for (let Y = 0, Xe = le.length; Y < Xe; Y += 4) ne.bezierCurveTo(T(z.x, V.x), T(z.y, V.y), z.x + le[Y + 0], z.y + le[Y + 1], z.x + le[Y + 2], z.y + le[Y + 3]), V.x = z.x + le[Y + 0], V.y = z.y + le[Y + 1], z.x += le[Y + 2], z.y += le[Y + 3], Y === 0 && pe === !0 && _e.copy(z);
            break;
          case "q":
            le = M(Be);
            for (let Y = 0, Xe = le.length; Y < Xe; Y += 4) ne.quadraticCurveTo(z.x + le[Y + 0], z.y + le[Y + 1], z.x + le[Y + 2], z.y + le[Y + 3]), V.x = z.x + le[Y + 0], V.y = z.y + le[Y + 1], z.x += le[Y + 2], z.y += le[Y + 3], Y === 0 && pe === !0 && _e.copy(z);
            break;
          case "t":
            le = M(Be);
            for (let Y = 0, Xe = le.length; Y < Xe; Y += 2) {
              const vt = T(z.x, V.x),
                St = T(z.y, V.y);
              ne.quadraticCurveTo(vt, St, z.x + le[Y + 0], z.y + le[Y + 1]), V.x = vt, V.y = St, z.x = z.x + le[Y + 0], z.y = z.y + le[Y + 1], Y === 0 && pe === !0 && _e.copy(z);
            }
            break;
          case "a":
            le = M(Be, [3, 4], 7);
            for (let Y = 0, Xe = le.length; Y < Xe; Y += 7) {
              if (le[Y + 5] == 0 && le[Y + 6] == 0) continue;
              const vt = z.clone();
              z.x += le[Y + 5], z.y += le[Y + 6], V.x = z.x, V.y = z.y, l(ne, le[Y], le[Y + 1], le[Y + 2], le[Y + 3], le[Y + 4], vt, z), Y === 0 && pe === !0 && _e.copy(z);
            }
            break;
          case "Z":
          case "z":
            ne.currentPath.autoClose = !0, ne.currentPath.curves.length > 0 && (z.copy(_e), ne.currentPath.currentPoint.copy(z), Le = !0);
            break;
          default:
            console.warn(Pe);
        }
        pe = !1;
      }
      return ne;
    }
    function o(ve) {
      if (!(!ve.sheet || !ve.sheet.cssRules || !ve.sheet.cssRules.length)) for (let ne = 0; ne < ve.sheet.cssRules.length; ne++) {
        const z = ve.sheet.cssRules[ne];
        if (z.type !== 1) continue;
        const V = z.selectorText.split(/,/gm).filter(Boolean).map(_e => _e.trim());
        for (let _e = 0; _e < V.length; _e++) {
          const Le = Object.fromEntries(Object.entries(z.style).filter(([, pe]) => pe !== ""));
          Z[V[_e]] = Object.assign(Z[V[_e]] || {}, Le);
        }
      }
    }
    function l(ve, ne, z, V, _e, Le, pe, Fe) {
      if (ne == 0 || z == 0) {
        ve.lineTo(Fe.x, Fe.y);
        return;
      }
      V = V * Math.PI / 180, ne = Math.abs(ne), z = Math.abs(z);
      const st = (pe.x - Fe.x) / 2,
        j = (pe.y - Fe.y) / 2,
        De = Math.cos(V) * st + Math.sin(V) * j,
        Pe = -Math.sin(V) * st + Math.cos(V) * j;
      let Oe = ne * ne,
        Be = z * z;
      const le = De * De,
        Y = Pe * Pe,
        Xe = le / Oe + Y / Be;
      if (Xe > 1) {
        const tt = Math.sqrt(Xe);
        ne = tt * ne, z = tt * z, Oe = ne * ne, Be = z * z;
      }
      const vt = Oe * Y + Be * le,
        St = (Oe * Be - vt) / vt;
      let K = Math.sqrt(Math.max(0, St));
      _e === Le && (K = -K);
      const G = K * ne * Pe / z,
        fe = -K * z * De / ne,
        Re = Math.cos(V) * G - Math.sin(V) * fe + (pe.x + Fe.x) / 2,
        Ve = Math.sin(V) * G + Math.cos(V) * fe + (pe.y + Fe.y) / 2,
        Me = c(1, 0, (De - G) / ne, (Pe - fe) / z),
        ot = c((De - G) / ne, (Pe - fe) / z, (-De - G) / ne, (-Pe - fe) / z) % (Math.PI * 2);
      ve.currentPath.absellipse(Re, Ve, ne, z, Me, Me + ot, Le === 0, V);
    }
    function c(ve, ne, z, V) {
      const _e = ve * z + ne * V,
        Le = Math.sqrt(ve * ve + ne * ne) * Math.sqrt(z * z + V * V);
      let pe = Math.acos(Math.max(-1, Math.min(1, _e / Le)));
      return ve * V - ne * z < 0 && (pe = -pe), pe;
    }
    function h(ve) {
      const ne = R(ve.getAttribute("x") || 0),
        z = R(ve.getAttribute("y") || 0),
        V = R(ve.getAttribute("rx") || ve.getAttribute("ry") || 0),
        _e = R(ve.getAttribute("ry") || ve.getAttribute("rx") || 0),
        Le = R(ve.getAttribute("width")),
        pe = R(ve.getAttribute("height")),
        Fe = 1 - .551915024494,
        st = new scope.ShapePath();
      return st.moveTo(ne + V, z), st.lineTo(ne + Le - V, z), (V !== 0 || _e !== 0) && st.bezierCurveTo(ne + Le - V * Fe, z, ne + Le, z + _e * Fe, ne + Le, z + _e), st.lineTo(ne + Le, z + pe - _e), (V !== 0 || _e !== 0) && st.bezierCurveTo(ne + Le, z + pe - _e * Fe, ne + Le - V * Fe, z + pe, ne + Le - V, z + pe), st.lineTo(ne + V, z + pe), (V !== 0 || _e !== 0) && st.bezierCurveTo(ne + V * Fe, z + pe, ne, z + pe - _e * Fe, ne, z + pe - _e), st.lineTo(ne, z + _e), (V !== 0 || _e !== 0) && st.bezierCurveTo(ne, z + _e * Fe, ne + V * Fe, z, ne + V, z), st;
    }
    function d(ve) {
      function ne(Le, pe, Fe) {
        const st = R(pe),
          j = R(Fe);
        _e === 0 ? V.moveTo(st, j) : V.lineTo(st, j), _e++;
      }
      const z = /([+-]?\d*\.?\d+(?:e[+-]?\d+)?)(?:,|\s)([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/g,
        V = new scope.ShapePath();
      let _e = 0;
      return ve.getAttribute("points").replace(z, ne), V.currentPath.autoClose = !0, V;
    }
    function p(ve) {
      function ne(Le, pe, Fe) {
        const st = R(pe),
          j = R(Fe);
        _e === 0 ? V.moveTo(st, j) : V.lineTo(st, j), _e++;
      }
      const z = /([+-]?\d*\.?\d+(?:e[+-]?\d+)?)(?:,|\s)([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/g,
        V = new scope.ShapePath();
      let _e = 0;
      return ve.getAttribute("points").replace(z, ne), V.currentPath.autoClose = !1, V;
    }
    function f(ve) {
      const ne = R(ve.getAttribute("cx") || 0),
        z = R(ve.getAttribute("cy") || 0),
        V = R(ve.getAttribute("r") || 0),
        _e = new scope.Path();
      _e.absarc(ne, z, V, 0, Math.PI * 2);
      const Le = new scope.ShapePath();
      return Le.subPaths.push(_e), Le;
    }
    function _(ve) {
      const ne = R(ve.getAttribute("cx") || 0),
        z = R(ve.getAttribute("cy") || 0),
        V = R(ve.getAttribute("rx") || 0),
        _e = R(ve.getAttribute("ry") || 0),
        Le = new scope.Path();
      Le.absellipse(ne, z, V, _e, 0, Math.PI * 2);
      const pe = new scope.ShapePath();
      return pe.subPaths.push(Le), pe;
    }
    function x(ve) {
      const ne = R(ve.getAttribute("x1") || 0),
        z = R(ve.getAttribute("y1") || 0),
        V = R(ve.getAttribute("x2") || 0),
        _e = R(ve.getAttribute("y2") || 0),
        Le = new scope.ShapePath();
      return Le.moveTo(ne, z), Le.lineTo(V, _e), Le.currentPath.autoClose = !1, Le;
    }
    function b(ve, ne) {
      ne = Object.assign({}, ne);
      let z = {};
      if (ve.hasAttribute("class")) {
        const pe = ve.getAttribute("class").split(/\s/).filter(Boolean).map(Fe => Fe.trim());
        for (let Fe = 0; Fe < pe.length; Fe++) z = Object.assign(z, Z["." + pe[Fe]]);
      }
      ve.hasAttribute("id") && (z = Object.assign(z, Z["#" + ve.getAttribute("id")]));
      function V(pe, Fe, st) {
        st === void 0 && (st = function (De) {
          return De.startsWith("url") && console.warn("SVGLoader: url access in attributes is not implemented."), De;
        }), ve.hasAttribute(pe) && (ne[Fe] = st(ve.getAttribute(pe))), z[pe] && (ne[Fe] = st(z[pe])), ve.style && ve.style[pe] !== "" && (ne[Fe] = st(ve.style[pe]));
      }
      function _e(pe) {
        return Math.max(0, Math.min(1, R(pe)));
      }
      function Le(pe) {
        return Math.max(0, R(pe));
      }
      return V("fill", "fill"), V("fill-opacity", "fillOpacity", _e), V("fill-rule", "fillRule"), V("opacity", "opacity", _e), V("stroke", "stroke"), V("stroke-opacity", "strokeOpacity", _e), V("stroke-width", "strokeWidth", Le), V("stroke-linejoin", "strokeLineJoin"), V("stroke-linecap", "strokeLineCap"), V("stroke-miterlimit", "strokeMiterLimit", Le), V("visibility", "visibility"), ne;
    }
    function T(ve, ne) {
      return ve - (ne - ve);
    }
    function M(ve, ne, z) {
      if (typeof ve != "string") throw new TypeError("Invalid input: " + typeof ve);
      const V = {
          WHITESPACE: /[ \t\r\n]/,
          DIGIT: /[\d]/,
          SIGN: /[-+]/,
          POINT: /\./,
          COMMA: /,/,
          EXP: /e/i,
          FLAGS: /[01]/
        },
        _e = 0,
        Le = 1,
        pe = 2,
        Fe = 3;
      let st = _e,
        j = !0,
        De = "",
        Pe = "";
      const Oe = [];
      function Be(vt, St, K) {
        const G = new SyntaxError('Unexpected character "' + vt + '" at index ' + St + ".");
        throw G.partial = K, G;
      }
      function le() {
        De !== "" && (Pe === "" ? Oe.push(Number(De)) : Oe.push(Number(De) * Math.pow(10, Number(Pe)))), De = "", Pe = "";
      }
      let Y;
      const Xe = ve.length;
      for (let vt = 0; vt < Xe; vt++) {
        if (Y = ve[vt], Array.isArray(ne) && ne.includes(Oe.length % z) && V.FLAGS.test(Y)) {
          st = Le, De = Y, le();
          continue;
        }
        if (st === _e) {
          if (V.WHITESPACE.test(Y)) continue;
          if (V.DIGIT.test(Y) || V.SIGN.test(Y)) {
            st = Le, De = Y;
            continue;
          }
          if (V.POINT.test(Y)) {
            st = pe, De = Y;
            continue;
          }
          V.COMMA.test(Y) && (j && Be(Y, vt, Oe), j = !0);
        }
        if (st === Le) {
          if (V.DIGIT.test(Y)) {
            De += Y;
            continue;
          }
          if (V.POINT.test(Y)) {
            De += Y, st = pe;
            continue;
          }
          if (V.EXP.test(Y)) {
            st = Fe;
            continue;
          }
          V.SIGN.test(Y) && De.length === 1 && V.SIGN.test(De[0]) && Be(Y, vt, Oe);
        }
        if (st === pe) {
          if (V.DIGIT.test(Y)) {
            De += Y;
            continue;
          }
          if (V.EXP.test(Y)) {
            st = Fe;
            continue;
          }
          V.POINT.test(Y) && De[De.length - 1] === "." && Be(Y, vt, Oe);
        }
        if (st === Fe) {
          if (V.DIGIT.test(Y)) {
            Pe += Y;
            continue;
          }
          if (V.SIGN.test(Y)) {
            if (Pe === "") {
              Pe += Y;
              continue;
            }
            Pe.length === 1 && V.SIGN.test(Pe) && Be(Y, vt, Oe);
          }
        }
        V.WHITESPACE.test(Y) ? (le(), st = _e, j = !1) : V.COMMA.test(Y) ? (le(), st = _e, j = !0) : V.SIGN.test(Y) ? (le(), st = Le, De = Y) : V.POINT.test(Y) ? (le(), st = pe, De = Y) : Be(Y, vt, Oe);
      }
      return le(), Oe;
    }
    const w = ["mm", "cm", "in", "pt", "pc", "px"],
      D = {
        mm: {
          mm: 1,
          cm: .1,
          in: 1 / 25.4,
          pt: 72 / 25.4,
          pc: 6 / 25.4,
          px: -1
        },
        cm: {
          mm: 10,
          cm: 1,
          in: 1 / 2.54,
          pt: 72 / 2.54,
          pc: 6 / 2.54,
          px: -1
        },
        in: {
          mm: 25.4,
          cm: 2.54,
          in: 1,
          pt: 72,
          pc: 6,
          px: -1
        },
        pt: {
          mm: 25.4 / 72,
          cm: 2.54 / 72,
          in: 1 / 72,
          pt: 1,
          pc: 6 / 72,
          px: -1
        },
        pc: {
          mm: 25.4 / 6,
          cm: 2.54 / 6,
          in: 1 / 6,
          pt: 72 / 6,
          pc: 1,
          px: -1
        },
        px: {
          px: 1
        }
      };
    function R(ve) {
      let ne = "px";
      if (typeof ve == "string" || ve instanceof String) for (let V = 0, _e = w.length; V < _e; V++) {
        const Le = w[V];
        if (ve.endsWith(Le)) {
          ne = Le, ve = ve.substring(0, ve.length - Le.length);
          break;
        }
      }
      let z;
      return ne === "px" && i.defaultUnit !== "px" ? z = D.in[i.defaultUnit] / i.defaultDPI : (z = D[ne][i.defaultUnit], z < 0 && (z = D[ne].in * i.defaultDPI)), z * parseFloat(ve);
    }
    function P(ve) {
      if (!(ve.hasAttribute("transform") || ve.nodeName === "use" && (ve.hasAttribute("x") || ve.hasAttribute("y")))) return null;
      const ne = U(ve);
      return J.length > 0 && ne.premultiply(J[J.length - 1]), Ue.copy(ne), J.push(ne), ne;
    }
    function U(ve) {
      const ne = new scope.Matrix3(),
        z = se;
      if (ve.nodeName === "use" && (ve.hasAttribute("x") || ve.hasAttribute("y"))) {
        const V = R(ve.getAttribute("x")),
          _e = R(ve.getAttribute("y"));
        ne.translate(V, _e);
      }
      if (ve.hasAttribute("transform")) {
        const V = ve.getAttribute("transform").split(")");
        for (let _e = V.length - 1; _e >= 0; _e--) {
          const Le = V[_e].trim();
          if (Le === "") continue;
          const pe = Le.indexOf("("),
            Fe = Le.length;
          if (pe > 0 && pe < Fe) {
            const st = Le.slice(0, pe),
              j = M(Le.slice(pe + 1));
            switch (z.identity(), st) {
              case "translate":
                if (j.length >= 1) {
                  const De = j[0];
                  let Pe = 0;
                  j.length >= 2 && (Pe = j[1]), z.translate(De, Pe);
                }
                break;
              case "rotate":
                if (j.length >= 1) {
                  let De = 0,
                    Pe = 0,
                    Oe = 0;
                  De = j[0] * Math.PI / 180, j.length >= 3 && (Pe = j[1], Oe = j[2]), re.makeTranslation(-Pe, -Oe), he.makeRotation(De), ee.multiplyMatrices(he, re), re.makeTranslation(Pe, Oe), z.multiplyMatrices(re, ee);
                }
                break;
              case "scale":
                if (j.length >= 1) {
                  const De = j[0];
                  let Pe = De;
                  j.length >= 2 && (Pe = j[1]), z.scale(De, Pe);
                }
                break;
              case "skewX":
                j.length === 1 && z.set(1, Math.tan(j[0] * Math.PI / 180), 0, 0, 1, 0, 0, 0, 1);
                break;
              case "skewY":
                j.length === 1 && z.set(1, 0, 0, Math.tan(j[0] * Math.PI / 180), 1, 0, 0, 0, 1);
                break;
              case "matrix":
                j.length === 6 && z.set(j[0], j[2], j[4], j[1], j[3], j[5], 0, 0, 1);
                break;
            }
          }
          ne.premultiply(z);
        }
      }
      return ne;
    }
    function O(ve, ne) {
      function z(pe) {
        Te.set(pe.x, pe.y, 1).applyMatrix3(ne), pe.set(Te.x, Te.y);
      }
      function V(pe) {
        const Fe = pe.xRadius,
          st = pe.yRadius,
          j = Math.cos(pe.aRotation),
          De = Math.sin(pe.aRotation),
          Pe = new scope.Vector3(Fe * j, Fe * De, 0),
          Oe = new scope.Vector3(-st * De, st * j, 0),
          Be = Pe.applyMatrix3(ne),
          le = Oe.applyMatrix3(ne),
          Y = se.set(Be.x, le.x, 0, Be.y, le.y, 0, 0, 0, 1),
          Xe = re.copy(Y).invert(),
          K = he.copy(Xe).transpose().multiply(Xe).elements,
          G = W(K[0], K[1], K[4]),
          fe = Math.sqrt(G.rt1),
          Re = Math.sqrt(G.rt2);
        if (pe.xRadius = 1 / fe, pe.yRadius = 1 / Re, pe.aRotation = Math.atan2(G.sn, G.cs), !((pe.aEndAngle - pe.aStartAngle) % (2 * Math.PI) < Number.EPSILON)) {
          const Me = re.set(fe, 0, 0, 0, Re, 0, 0, 0, 1),
            ot = he.set(G.cs, G.sn, 0, -G.sn, G.cs, 0, 0, 0, 1),
            tt = Me.multiply(ot).multiply(Y),
            ut = ft => {
              const {
                x: Ge,
                y: ce
              } = new scope.Vector3(Math.cos(ft), Math.sin(ft), 0).applyMatrix3(tt);
              return Math.atan2(ce, Ge);
            };
          pe.aStartAngle = ut(pe.aStartAngle), pe.aEndAngle = ut(pe.aEndAngle), N(ne) && (pe.aClockwise = !pe.aClockwise);
        }
      }
      function _e(pe) {
        const Fe = F(ne),
          st = k(ne);
        pe.xRadius *= Fe, pe.yRadius *= st;
        const j = Fe > Number.EPSILON ? Math.atan2(ne.elements[1], ne.elements[0]) : Math.atan2(-ne.elements[3], ne.elements[4]);
        pe.aRotation += j, N(ne) && (pe.aStartAngle *= -1, pe.aEndAngle *= -1, pe.aClockwise = !pe.aClockwise);
      }
      const Le = ve.subPaths;
      for (let pe = 0, Fe = Le.length; pe < Fe; pe++) {
        const j = Le[pe].curves;
        for (let De = 0; De < j.length; De++) {
          const Pe = j[De];
          Pe.isLineCurve ? (z(Pe.v1), z(Pe.v2)) : Pe.isCubicBezierCurve ? (z(Pe.v0), z(Pe.v1), z(Pe.v2), z(Pe.v3)) : Pe.isQuadraticBezierCurve ? (z(Pe.v0), z(Pe.v1), z(Pe.v2)) : Pe.isEllipseCurve && (Ie.set(Pe.aX, Pe.aY), z(Ie), Pe.aX = Ie.x, Pe.aY = Ie.y, H(ne) ? V(Pe) : _e(Pe));
        }
      }
    }
    function N(ve) {
      const ne = ve.elements;
      return ne[0] * ne[4] - ne[1] * ne[3] < 0;
    }
    function H(ve) {
      const ne = ve.elements,
        z = ne[0] * ne[3] + ne[1] * ne[4];
      if (z === 0) return !1;
      const V = F(ve),
        _e = k(ve);
      return Math.abs(z / (V * _e)) > Number.EPSILON;
    }
    function F(ve) {
      const ne = ve.elements;
      return Math.sqrt(ne[0] * ne[0] + ne[1] * ne[1]);
    }
    function k(ve) {
      const ne = ve.elements;
      return Math.sqrt(ne[3] * ne[3] + ne[4] * ne[4]);
    }
    function W(ve, ne, z) {
      let V, _e, Le, pe, Fe;
      const st = ve + z,
        j = ve - z,
        De = Math.sqrt(j * j + 4 * ne * ne);
      return st > 0 ? (V = .5 * (st + De), Fe = 1 / V, _e = ve * Fe * z - ne * Fe * ne) : st < 0 ? _e = .5 * (st - De) : (V = .5 * De, _e = -.5 * De), j > 0 ? Le = j + De : Le = j - De, Math.abs(Le) > 2 * Math.abs(ne) ? (Fe = -2 * ne / Le, pe = 1 / Math.sqrt(1 + Fe * Fe), Le = Fe * pe) : Math.abs(ne) === 0 ? (Le = 1, pe = 0) : (Fe = -.5 * Le / ne, Le = 1 / Math.sqrt(1 + Fe * Fe), pe = Fe * Le), j > 0 && (Fe = Le, Le = -pe, pe = Fe), {
        rt1: V,
        rt2: _e,
        cs: Le,
        sn: pe
      };
    }
    const $ = [],
      Z = {},
      J = [],
      se = new scope.Matrix3(),
      re = new scope.Matrix3(),
      he = new scope.Matrix3(),
      ee = new scope.Matrix3(),
      Ie = new scope.Vector2(),
      Te = new scope.Vector3(),
      Ue = new scope.Matrix3(),
      nt = new DOMParser().parseFromString(e, "image/svg+xml");
    return s(nt.documentElement, {
      fill: "#000",
      fillOpacity: 1,
      strokeOpacity: 1,
      strokeWidth: 1,
      strokeLineJoin: "miter",
      strokeLineCap: "butt",
      strokeMiterLimit: 4
    }), {
      paths: $,
      xml: nt.documentElement
    };
  }
  static createShapes(e) {
    const s = {
        ORIGIN: 0,
        DESTINATION: 1,
        BETWEEN: 2,
        LEFT: 3,
        RIGHT: 4,
        BEHIND: 5,
        BEYOND: 6
      },
      a = {
        loc: s.ORIGIN,
        t: 0
      };
    function o(T, M, w, D) {
      const R = T.x,
        P = M.x,
        U = w.x,
        O = D.x,
        N = T.y,
        H = M.y,
        F = w.y,
        k = D.y,
        W = (O - U) * (N - F) - (k - F) * (R - U),
        $ = (P - R) * (N - F) - (H - N) * (R - U),
        Z = (k - F) * (P - R) - (O - U) * (H - N),
        J = W / Z,
        se = $ / Z;
      if (Z === 0 && W !== 0 || J <= 0 || J >= 1 || se < 0 || se > 1) return null;
      if (W === 0 && Z === 0) {
        for (let re = 0; re < 2; re++) if (l(re === 0 ? w : D, T, M), a.loc == s.ORIGIN) {
          const he = re === 0 ? w : D;
          return {
            x: he.x,
            y: he.y,
            t: a.t
          };
        } else if (a.loc == s.BETWEEN) {
          const he = +(R + a.t * (P - R)).toPrecision(10),
            ee = +(N + a.t * (H - N)).toPrecision(10);
          return {
            x: he,
            y: ee,
            t: a.t
          };
        }
        return null;
      } else {
        for (let ee = 0; ee < 2; ee++) if (l(ee === 0 ? w : D, T, M), a.loc == s.ORIGIN) {
          const Ie = ee === 0 ? w : D;
          return {
            x: Ie.x,
            y: Ie.y,
            t: a.t
          };
        }
        const re = +(R + J * (P - R)).toPrecision(10),
          he = +(N + J * (H - N)).toPrecision(10);
        return {
          x: re,
          y: he,
          t: J
        };
      }
    }
    function l(T, M, w) {
      const D = w.x - M.x,
        R = w.y - M.y,
        P = T.x - M.x,
        U = T.y - M.y,
        O = D * U - P * R;
      if (T.x === M.x && T.y === M.y) {
        a.loc = s.ORIGIN, a.t = 0;
        return;
      }
      if (T.x === w.x && T.y === w.y) {
        a.loc = s.DESTINATION, a.t = 1;
        return;
      }
      if (O < -Number.EPSILON) {
        a.loc = s.LEFT;
        return;
      }
      if (O > Number.EPSILON) {
        a.loc = s.RIGHT;
        return;
      }
      if (D * P < 0 || R * U < 0) {
        a.loc = s.BEHIND;
        return;
      }
      if (Math.sqrt(D * D + R * R) < Math.sqrt(P * P + U * U)) {
        a.loc = s.BEYOND;
        return;
      }
      let N;
      D !== 0 ? N = P / D : N = U / R, a.loc = s.BETWEEN, a.t = N;
    }
    function c(T, M) {
      const w = [],
        D = [];
      for (let R = 1; R < T.length; R++) {
        const P = T[R - 1],
          U = T[R];
        for (let O = 1; O < M.length; O++) {
          const N = M[O - 1],
            H = M[O],
            F = o(P, U, N, H);
          F !== null && w.find(k => k.t <= F.t + Number.EPSILON && k.t >= F.t - Number.EPSILON) === void 0 && (w.push(F), D.push(new scope.Vector2(F.x, F.y)));
        }
      }
      return D;
    }
    function h(T, M, w) {
      const D = new scope.Vector2();
      M.getCenter(D);
      const R = [];
      return w.forEach(P => {
        P.boundingBox.containsPoint(D) && c(T, P.points).forEach(O => {
          R.push({
            identifier: P.identifier,
            isCW: P.isCW,
            point: O
          });
        });
      }), R.sort((P, U) => P.point.x - U.point.x), R;
    }
    function d(T, M, w, D, R) {
      (R == null || R === "") && (R = "nonzero");
      const P = new scope.Vector2();
      T.boundingBox.getCenter(P);
      const U = [new scope.Vector2(w, P.y), new scope.Vector2(D, P.y)],
        O = h(U, T.boundingBox, M);
      O.sort(($, Z) => $.point.x - Z.point.x);
      const N = [],
        H = [];
      O.forEach($ => {
        $.identifier === T.identifier ? N.push($) : H.push($);
      });
      const F = N[0].point.x,
        k = [];
      let W = 0;
      for (; W < H.length && H[W].point.x < F;) k.length > 0 && k[k.length - 1] === H[W].identifier ? k.pop() : k.push(H[W].identifier), W++;
      if (k.push(T.identifier), R === "evenodd") {
        const $ = k.length % 2 === 0,
          Z = k[k.length - 2];
        return {
          identifier: T.identifier,
          isHole: $,
          for: Z
        };
      } else if (R === "nonzero") {
        let $ = !0,
          Z = null,
          J = null;
        for (let se = 0; se < k.length; se++) {
          const re = k[se];
          $ ? (J = M[re].isCW, $ = !1, Z = re) : J !== M[re].isCW && (J = M[re].isCW, $ = !0);
        }
        return {
          identifier: T.identifier,
          isHole: $,
          for: Z
        };
      } else console.warn('fill-rule: "' + R + '" is currently not implemented.');
    }
    let p = 999999999,
      f = -999999999,
      _ = e.subPaths.map(T => {
        const M = T.getPoints();
        let w = -999999999,
          D = 999999999,
          R = -999999999,
          P = 999999999;
        for (let U = 0; U < M.length; U++) {
          const O = M[U];
          O.y > w && (w = O.y), O.y < D && (D = O.y), O.x > R && (R = O.x), O.x < P && (P = O.x);
        }
        return f <= R && (f = R + 1), p >= P && (p = P - 1), {
          curves: T.curves,
          points: M,
          isCW: scope.ShapeUtils.isClockWise(M),
          identifier: -1,
          boundingBox: new scope.Box2(new scope.Vector2(P, D), new scope.Vector2(R, w))
        };
      });
    _ = _.filter(T => T.points.length > 1);
    for (let T = 0; T < _.length; T++) _[T].identifier = T;
    const x = _.map(T => d(T, _, p, f, e.userData ? e.userData.style.fillRule : void 0)),
      b = [];
    return _.forEach(T => {
      if (!x[T.identifier].isHole) {
        const w = new scope.Shape();
        w.curves = T.curves, x.filter(R => R.isHole && R.for === T.identifier).forEach(R => {
          const P = _[R.identifier],
            U = new scope.Path();
          U.curves = P.curves, w.holes.push(U);
        }), b.push(w);
      }
    }), b;
  }
  static getStrokeStyle(e, i, s, a, o) {
    return e = e !== void 0 ? e : 1, i = i !== void 0 ? i : "#000", s = s !== void 0 ? s : "miter", a = a !== void 0 ? a : "butt", o = o !== void 0 ? o : 4, {
      strokeColor: i,
      strokeWidth: e,
      strokeLineJoin: s,
      strokeLineCap: a,
      strokeMiterLimit: o
    };
  }
  static pointsToStroke(e, i, s, a) {
    const o = [],
      l = [],
      c = [];
    if (scope.SVGLoader.pointsToStrokeWithBuffers(e, i, s, a, o, l, c) === 0) return null;
    const h = new scope.BufferGeometry();
    return h.setAttribute("position", new scope.Float32BufferAttribute(o, 3)), h.setAttribute("normal", new scope.Float32BufferAttribute(l, 3)), h.setAttribute("uv", new scope.Float32BufferAttribute(c, 2)), h;
  }
  static pointsToStrokeWithBuffers(e, i, s, a, o, l, c, h) {
    const d = new scope.Vector2(),
      p = new scope.Vector2(),
      f = new scope.Vector2(),
      _ = new scope.Vector2(),
      x = new scope.Vector2(),
      b = new scope.Vector2(),
      T = new scope.Vector2(),
      M = new scope.Vector2(),
      w = new scope.Vector2(),
      D = new scope.Vector2(),
      R = new scope.Vector2(),
      P = new scope.Vector2(),
      U = new scope.Vector2(),
      O = new scope.Vector2(),
      N = new scope.Vector2(),
      H = new scope.Vector2(),
      F = new scope.Vector2();
    s = s !== void 0 ? s : 12, a = a !== void 0 ? a : .001, h = h !== void 0 ? h : 0, e = j(e);
    const k = e.length;
    if (k < 2) return 0;
    const W = e[0].equals(e[k - 1]);
    let $,
      Z = e[0],
      J;
    const se = i.strokeWidth / 2,
      re = 1 / (k - 1);
    let he = 0,
      ee,
      Ie,
      Te,
      Ue,
      nt = !1,
      mt = 0,
      ve = h * 3,
      ne = h * 2;
    z(e[0], e[1], d).multiplyScalar(se), M.copy(e[0]).sub(d), w.copy(e[0]).add(d), D.copy(M), R.copy(w);
    for (let De = 1; De < k; De++) {
      $ = e[De], De === k - 1 ? W ? J = e[1] : J = void 0 : J = e[De + 1];
      const Pe = d;
      if (z(Z, $, Pe), f.copy(Pe).multiplyScalar(se), P.copy($).sub(f), U.copy($).add(f), ee = he + re, Ie = !1, J !== void 0) {
        z($, J, p), f.copy(p).multiplyScalar(se), O.copy($).sub(f), N.copy($).add(f), Te = !0, f.subVectors(J, Z), Pe.dot(f) < 0 && (Te = !1), De === 1 && (nt = Te), f.subVectors(J, $), f.normalize();
        const Oe = Math.abs(Pe.dot(f));
        if (Oe > Number.EPSILON) {
          const Be = se / Oe;
          f.multiplyScalar(-Be), _.subVectors($, Z), x.copy(_).setLength(Be).add(f), H.copy(x).negate();
          const le = x.length(),
            Y = _.length();
          _.divideScalar(Y), b.subVectors(J, $);
          const Xe = b.length();
          switch (b.divideScalar(Xe), _.dot(H) < Y && b.dot(H) < Xe && (Ie = !0), F.copy(x).add($), H.add($), Ue = !1, Ie ? Te ? (N.copy(H), U.copy(H)) : (O.copy(H), P.copy(H)) : Le(), i.strokeLineJoin) {
            case "bevel":
              pe(Te, Ie, ee);
              break;
            case "round":
              Fe(Te, Ie), Te ? _e($, P, O, ee, 0) : _e($, N, U, ee, 1);
              break;
            case "miter":
            case "miter-clip":
            default:
              const vt = se * i.strokeMiterLimit / le;
              if (vt < 1) {
                if (i.strokeLineJoin !== "miter-clip") {
                  pe(Te, Ie, ee);
                  break;
                } else Fe(Te, Ie), Te ? (b.subVectors(F, P).multiplyScalar(vt).add(P), T.subVectors(F, O).multiplyScalar(vt).add(O), V(P, ee, 0), V(b, ee, 0), V($, ee, .5), V($, ee, .5), V(b, ee, 0), V(T, ee, 0), V($, ee, .5), V(T, ee, 0), V(O, ee, 0)) : (b.subVectors(F, U).multiplyScalar(vt).add(U), T.subVectors(F, N).multiplyScalar(vt).add(N), V(U, ee, 1), V(b, ee, 1), V($, ee, .5), V($, ee, .5), V(b, ee, 1), V(T, ee, 1), V($, ee, .5), V(T, ee, 1), V(N, ee, 1));
              } else Ie ? (Te ? (V(w, he, 1), V(M, he, 0), V(F, ee, 0), V(w, he, 1), V(F, ee, 0), V(H, ee, 1)) : (V(w, he, 1), V(M, he, 0), V(F, ee, 1), V(M, he, 0), V(H, ee, 0), V(F, ee, 1)), Te ? O.copy(F) : N.copy(F)) : Te ? (V(P, ee, 0), V(F, ee, 0), V($, ee, .5), V($, ee, .5), V(F, ee, 0), V(O, ee, 0)) : (V(U, ee, 1), V(F, ee, 1), V($, ee, .5), V($, ee, .5), V(F, ee, 1), V(N, ee, 1)), Ue = !0;
              break;
          }
        } else Le();
      } else Le();
      !W && De === k - 1 && st(e[0], D, R, Te, !0, he), he = ee, Z = $, M.copy(O), w.copy(N);
    }
    if (!W) st($, P, U, Te, !1, ee);else if (Ie && o) {
      let De = F,
        Pe = H;
      nt !== Te && (De = H, Pe = F), Te ? (Ue || nt) && (Pe.toArray(o, 0 * 3), Pe.toArray(o, 3 * 3), Ue && De.toArray(o, 1 * 3)) : (Ue || !nt) && (Pe.toArray(o, 1 * 3), Pe.toArray(o, 3 * 3), Ue && De.toArray(o, 0 * 3));
    }
    return mt;
    function z(De, Pe, Oe) {
      return Oe.subVectors(Pe, De), Oe.set(-Oe.y, Oe.x).normalize();
    }
    function V(De, Pe, Oe) {
      o && (o[ve] = De.x, o[ve + 1] = De.y, o[ve + 2] = 0, l && (l[ve] = 0, l[ve + 1] = 0, l[ve + 2] = 1), ve += 3, c && (c[ne] = Pe, c[ne + 1] = Oe, ne += 2)), mt += 3;
    }
    function _e(De, Pe, Oe, Be, le) {
      d.copy(Pe).sub(De).normalize(), p.copy(Oe).sub(De).normalize();
      let Y = Math.PI;
      const Xe = d.dot(p);
      Math.abs(Xe) < 1 && (Y = Math.abs(Math.acos(Xe))), Y /= s, f.copy(Pe);
      for (let vt = 0, St = s - 1; vt < St; vt++) _.copy(f).rotateAround(De, Y), V(f, Be, le), V(_, Be, le), V(De, Be, .5), f.copy(_);
      V(_, Be, le), V(Oe, Be, le), V(De, Be, .5);
    }
    function Le() {
      V(w, he, 1), V(M, he, 0), V(P, ee, 0), V(w, he, 1), V(P, ee, 0), V(U, ee, 1);
    }
    function pe(De, Pe, Oe) {
      Pe ? De ? (V(w, he, 1), V(M, he, 0), V(P, ee, 0), V(w, he, 1), V(P, ee, 0), V(H, ee, 1), V(P, Oe, 0), V(O, Oe, 0), V(H, Oe, .5)) : (V(w, he, 1), V(M, he, 0), V(U, ee, 1), V(M, he, 0), V(H, ee, 0), V(U, ee, 1), V(U, Oe, 1), V(H, Oe, 0), V(N, Oe, 1)) : De ? (V(P, Oe, 0), V(O, Oe, 0), V($, Oe, .5)) : (V(U, Oe, 1), V(N, Oe, 0), V($, Oe, .5));
    }
    function Fe(De, Pe) {
      Pe && (De ? (V(w, he, 1), V(M, he, 0), V(P, ee, 0), V(w, he, 1), V(P, ee, 0), V(H, ee, 1), V(P, he, 0), V($, ee, .5), V(H, ee, 1), V($, ee, .5), V(O, he, 0), V(H, ee, 1)) : (V(w, he, 1), V(M, he, 0), V(U, ee, 1), V(M, he, 0), V(H, ee, 0), V(U, ee, 1), V(U, he, 1), V(H, ee, 0), V($, ee, .5), V($, ee, .5), V(H, ee, 0), V(N, he, 1)));
    }
    function st(De, Pe, Oe, Be, le, Y) {
      switch (i.strokeLineCap) {
        case "round":
          le ? _e(De, Oe, Pe, Y, .5) : _e(De, Pe, Oe, Y, .5);
          break;
        case "square":
          if (le) d.subVectors(Pe, De), p.set(d.y, -d.x), f.addVectors(d, p).add(De), _.subVectors(p, d).add(De), Be ? (f.toArray(o, 1 * 3), _.toArray(o, 0 * 3), _.toArray(o, 3 * 3)) : (f.toArray(o, 1 * 3), c[3 * 2 + 1] === 1 ? _.toArray(o, 3 * 3) : f.toArray(o, 3 * 3), _.toArray(o, 0 * 3));else {
            d.subVectors(Oe, De), p.set(d.y, -d.x), f.addVectors(d, p).add(De), _.subVectors(p, d).add(De);
            const Xe = o.length;
            Be ? (f.toArray(o, Xe - 1 * 3), _.toArray(o, Xe - 2 * 3), _.toArray(o, Xe - 4 * 3)) : (_.toArray(o, Xe - 2 * 3), f.toArray(o, Xe - 1 * 3), _.toArray(o, Xe - 4 * 3));
          }
          break;
      }
    }
    function j(De) {
      let Pe = !1;
      for (let Be = 1, le = De.length - 1; Be < le; Be++) if (De[Be].distanceTo(De[Be + 1]) < a) {
        Pe = !0;
        break;
      }
      if (!Pe) return De;
      const Oe = [];
      Oe.push(De[0]);
      for (let Be = 1, le = De.length - 1; Be < le; Be++) De[Be].distanceTo(De[Be + 1]) >= a && Oe.push(De[Be]);
      return Oe.push(De[De.length - 1]), Oe;
    }
  }
};
}
