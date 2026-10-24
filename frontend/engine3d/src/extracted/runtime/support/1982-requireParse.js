/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1520160:1528901.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1982(scope) {
scope.requireParse = function requireParse() {
  if (scope.hasRequiredParse) return scope.parse_1;
  scope.hasRequiredParse = 1, scope.parse_1 = U, U.filename = null, U.defaults = {
    keepCase: !1
  };
  var r = scope.requireTokenize(),
    e = scope.requireRoot(),
    i = scope.requireType(),
    s = scope.requireField(),
    a = scope.requireMapfield(),
    o = scope.requireOneof(),
    l = scope.require_enum(),
    c = scope.requireService(),
    h = scope.requireMethod(),
    d = scope.requireObject(),
    p = scope.requireTypes(),
    f = scope.requireUtil(),
    _ = /^[1-9][0-9]*$/,
    x = /^-?[1-9][0-9]*$/,
    b = /^0[x][0-9a-fA-F]+$/,
    T = /^-?0[x][0-9a-fA-F]+$/,
    M = /^0[0-7]+$/,
    w = /^-?0[0-7]+$/,
    D = /^(?![eE])[0-9]*(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?$/,
    R = /^[a-zA-Z_][a-zA-Z_0-9]*$/,
    P = /^(?:\.?[a-zA-Z_][a-zA-Z_0-9]*)(?:\.[a-zA-Z_][a-zA-Z_0-9]*)*$/;
  function U(O, N, H) {
    N instanceof e || (H = N, N = new e()), H || (H = U.defaults);
    var F = H.preferTrailingComment || !1,
      k = r(O, H.alternateCommentMode || !1),
      W = k.next,
      $ = k.push,
      Z = k.peek,
      J = k.skip,
      se = k.cmnt,
      re = !0,
      he,
      ee,
      Ie,
      Te = "proto2",
      Ue = N,
      nt = [],
      mt = {},
      ve = H.keepCase ? function (ce) {
        return ce;
      } : f.camelCase;
    function ne() {
      nt.forEach(ce => {
        ce._edition = Te, Object.keys(mt).forEach(xe => {
          ce.getOption(xe) === void 0 && ce.setOption(xe, mt[xe], !0);
        });
      });
    }
    function z(ce, xe, be) {
      var Ce = U.filename;
      return be || (U.filename = null), Error("illegal " + (xe || "token") + " '" + ce + "' (" + (Ce ? Ce + ", " : "") + "line " + k.line + ")");
    }
    function V() {
      var ce = [],
        xe;
      do {
        if ((xe = W()) !== '"' && xe !== "'") throw z(xe);
        ce.push(W()), J(xe), xe = Z();
      } while (xe === '"' || xe === "'");
      return ce.join("");
    }
    function _e(ce) {
      var xe = W();
      switch (xe) {
        case "'":
        case '"':
          return $(xe), V();
        case "true":
        case "TRUE":
          return !0;
        case "false":
        case "FALSE":
          return !1;
      }
      try {
        return pe(xe, !0);
      } catch {
        if (P.test(xe)) return xe;
        throw z(xe, "value");
      }
    }
    function Le(ce, xe) {
      var be, Ce;
      do if (xe && ((be = Z()) === '"' || be === "'")) {
        var $e = V();
        if (ce.push($e), Te >= 2023) throw z($e, "id");
      } else try {
        ce.push([Ce = Fe(W()), J("to", !0) ? Fe(W()) : Ce]);
      } catch (Ne) {
        if (xe && P.test(be) && Te >= 2023) ce.push(be);else throw Ne;
      } while (J(",", !0));
      var ie = {
        options: void 0
      };
      ie.setOption = function (Ne, je) {
        this.options === void 0 && (this.options = {}), this.options[Ne] = je;
      }, Be(ie, function (je) {
        if (je === "option") fe(ie, je), J(";");else throw z(je);
      }, function () {
        ot(ie);
      });
    }
    function pe(ce, xe) {
      var be = 1;
      switch (ce.charAt(0) === "-" && (be = -1, ce = ce.substring(1)), ce) {
        case "inf":
        case "INF":
        case "Inf":
          return be * (1 / 0);
        case "nan":
        case "NAN":
        case "Nan":
        case "NaN":
          return NaN;
        case "0":
          return 0;
      }
      if (_.test(ce)) return be * parseInt(ce, 10);
      if (b.test(ce)) return be * parseInt(ce, 16);
      if (M.test(ce)) return be * parseInt(ce, 8);
      if (D.test(ce)) return be * parseFloat(ce);
      throw z(ce, "number", xe);
    }
    function Fe(ce, xe) {
      switch (ce) {
        case "max":
        case "MAX":
        case "Max":
          return 536870911;
        case "0":
          return 0;
      }
      if (!xe && ce.charAt(0) === "-") throw z(ce, "id");
      if (x.test(ce)) return parseInt(ce, 10);
      if (T.test(ce)) return parseInt(ce, 16);
      if (w.test(ce)) return parseInt(ce, 8);
      throw z(ce, "id");
    }
    function st() {
      if (he !== void 0) throw z("package");
      if (he = W(), !P.test(he)) throw z(he, "name");
      Ue = Ue.define(he), J(";");
    }
    function j() {
      var ce = Z(),
        xe;
      switch (ce) {
        case "weak":
          xe = Ie || (Ie = []), W();
          break;
        case "public":
          W();
        default:
          xe = ee || (ee = []);
          break;
      }
      ce = V(), J(";"), xe.push(ce);
    }
    function De() {
      if (J("="), Te = V(), Te < 2023) throw z(Te, "syntax");
      J(";");
    }
    function Pe() {
      if (J("="), Te = V(), !["2023"].includes(Te)) throw z(Te, "edition");
      J(";");
    }
    function Oe(ce, xe) {
      switch (xe) {
        case "option":
          return fe(ce, xe), J(";"), !0;
        case "message":
          return le(ce, xe), !0;
        case "enum":
          return K(ce, xe), !0;
        case "service":
          return tt(ce, xe), !0;
        case "extend":
          return ft(ce, xe), !0;
      }
      return !1;
    }
    function Be(ce, xe, be) {
      var Ce = k.line;
      if (ce && (typeof ce.comment != "string" && (ce.comment = se()), ce.filename = U.filename), J("{", !0)) {
        for (var $e; ($e = W()) !== "}";) xe($e);
        J(";", !0);
      } else be && be(), J(";"), ce && (typeof ce.comment != "string" || F) && (ce.comment = se(Ce) || ce.comment);
    }
    function le(ce, xe) {
      if (!R.test(xe = W())) throw z(xe, "type name");
      var be = new i(xe);
      Be(be, function ($e) {
        if (!Oe(be, $e)) switch ($e) {
          case "map":
            vt(be);
            break;
          case "required":
            if (Te !== "proto2") throw z($e);
          case "repeated":
            Y(be, $e);
            break;
          case "optional":
            if (Te === "proto3") Y(be, "proto3_optional");else {
              if (Te !== "proto2") throw z($e);
              Y(be, "optional");
            }
            break;
          case "oneof":
            St(be, $e);
            break;
          case "extensions":
            Le(be.extensions || (be.extensions = []));
            break;
          case "reserved":
            Le(be.reserved || (be.reserved = []), !0);
            break;
          default:
            if (Te === "proto2" || !P.test($e)) throw z($e);
            $($e), Y(be, "optional");
            break;
        }
      }), ce.add(be), ce === Ue && nt.push(be);
    }
    function Y(ce, xe, be) {
      var Ce = W();
      if (Ce === "group") {
        Xe(ce, xe);
        return;
      }
      for (; Ce.endsWith(".") || Z().startsWith(".");) Ce += W();
      if (!P.test(Ce)) throw z(Ce, "type");
      var $e = W();
      if (!R.test($e)) throw z($e, "name");
      $e = ve($e), J("=");
      var ie = new s($e, Fe(W()), Ce, xe, be);
      if (Be(ie, function (rt) {
        if (rt === "option") fe(ie, rt), J(";");else throw z(rt);
      }, function () {
        ot(ie);
      }), xe === "proto3_optional") {
        var Ne = new o("_" + $e);
        ie.setOption("proto3_optional", !0), Ne.add(ie), ce.add(Ne);
      } else ce.add(ie);
      ce === Ue && nt.push(ie);
    }
    function Xe(ce, xe) {
      if (Te >= 2023) throw z("group");
      var be = W();
      if (!R.test(be)) throw z(be, "name");
      var Ce = f.lcFirst(be);
      be === Ce && (be = f.ucFirst(be)), J("=");
      var $e = Fe(W()),
        ie = new i(be);
      ie.group = !0;
      var Ne = new s(Ce, $e, be, xe);
      Ne.filename = U.filename, Be(ie, function (rt) {
        switch (rt) {
          case "option":
            fe(ie, rt), J(";");
            break;
          case "required":
          case "repeated":
            Y(ie, rt);
            break;
          case "optional":
            Te === "proto3" ? Y(ie, "proto3_optional") : Y(ie, "optional");
            break;
          case "message":
            le(ie, rt);
            break;
          case "enum":
            K(ie, rt);
            break;
          case "reserved":
            Le(ie.reserved || (ie.reserved = []), !0);
            break;
          default:
            throw z(rt);
        }
      }), ce.add(ie).add(Ne);
    }
    function vt(ce) {
      J("<");
      var xe = W();
      if (p.mapKey[xe] === void 0) throw z(xe, "type");
      J(",");
      var be = W();
      if (!P.test(be)) throw z(be, "type");
      J(">");
      var Ce = W();
      if (!R.test(Ce)) throw z(Ce, "name");
      J("=");
      var $e = new a(ve(Ce), Fe(W()), xe, be);
      Be($e, function (Ne) {
        if (Ne === "option") fe($e, Ne), J(";");else throw z(Ne);
      }, function () {
        ot($e);
      }), ce.add($e);
    }
    function St(ce, xe) {
      if (!R.test(xe = W())) throw z(xe, "name");
      var be = new o(ve(xe));
      Be(be, function ($e) {
        $e === "option" ? (fe(be, $e), J(";")) : ($($e), Y(be, "optional"));
      }), ce.add(be);
    }
    function K(ce, xe) {
      if (!R.test(xe = W())) throw z(xe, "name");
      var be = new l(xe);
      Be(be, function ($e) {
        switch ($e) {
          case "option":
            fe(be, $e), J(";");
            break;
          case "reserved":
            Le(be.reserved || (be.reserved = []), !0), be.reserved === void 0 && (be.reserved = []);
            break;
          default:
            G(be, $e);
        }
      }), ce.add(be), ce === Ue && nt.push(be);
    }
    function G(ce, xe) {
      if (!R.test(xe)) throw z(xe, "name");
      J("=");
      var be = Fe(W(), !0),
        Ce = {
          options: void 0
        };
      Ce.getOption = function ($e) {
        return this.options[$e];
      }, Ce.setOption = function ($e, ie) {
        d.prototype.setOption.call(Ce, $e, ie);
      }, Ce.setParsedOption = function () {}, Be(Ce, function (ie) {
        if (ie === "option") fe(Ce, ie), J(";");else throw z(ie);
      }, function () {
        ot(Ce);
      }), ce.add(xe, be, Ce.comment, Ce.parsedOptions || Ce.options);
    }
    function fe(ce, xe) {
      var be,
        Ce,
        $e = !0;
      for (xe === "option" && (xe = W()); xe !== "=";) {
        if (xe === "(") {
          var ie = W();
          J(")"), xe = "(" + ie + ")";
        }
        if ($e) {
          if ($e = !1, xe.includes(".") && !xe.includes("(")) {
            var Ne = xe.split(".");
            be = Ne[0] + ".", xe = Ne[1];
            continue;
          }
          be = xe;
        } else Ce = Ce ? Ce += xe : xe;
        xe = W();
      }
      var je = Ce ? be.concat(Ce) : be,
        rt = Re(ce, je);
      Ce = Ce && Ce[0] === "." ? Ce.slice(1) : Ce, be = be && be[be.length - 1] === "." ? be.slice(0, -1) : be, Me(ce, be, rt, Ce);
    }
    function Re(ce, xe) {
      if (J("{", !0)) {
        for (var be = {}; !J("}", !0);) {
          if (!R.test(Ge = W())) throw z(Ge, "name");
          if (Ge === null) throw z(Ge, "end of input");
          var Ce,
            $e = Ge;
          if (J(":", !0), Z() === "{") Ce = Re(ce, xe + "." + Ge);else if (Z() === "[") {
            Ce = [];
            var ie;
            if (J("[", !0)) {
              do ie = _e(), Ce.push(ie); while (J(",", !0));
              J("]"), typeof ie < "u" && Ve(ce, xe + "." + Ge, ie);
            }
          } else Ce = _e(), Ve(ce, xe + "." + Ge, Ce);
          var Ne = be[$e];
          Ne && (Ce = [].concat(Ne).concat(Ce)), be[$e] = Ce, J(",", !0), J(";", !0);
        }
        return be;
      }
      var je = _e();
      return Ve(ce, xe, je), je;
    }
    function Ve(ce, xe, be) {
      if (Ue === ce && /^features\./.test(xe)) {
        mt[xe] = be;
        return;
      }
      ce.setOption && ce.setOption(xe, be);
    }
    function Me(ce, xe, be, Ce) {
      ce.setParsedOption && ce.setParsedOption(xe, be, Ce);
    }
    function ot(ce) {
      if (J("[", !0)) {
        do fe(ce, "option"); while (J(",", !0));
        J("]");
      }
      return ce;
    }
    function tt(ce, xe) {
      if (!R.test(xe = W())) throw z(xe, "service name");
      var be = new c(xe);
      Be(be, function ($e) {
        if (!Oe(be, $e)) if ($e === "rpc") ut(be, $e);else throw z($e);
      }), ce.add(be), ce === Ue && nt.push(be);
    }
    function ut(ce, xe) {
      var be = se(),
        Ce = xe;
      if (!R.test(xe = W())) throw z(xe, "name");
      var $e = xe,
        ie,
        Ne,
        je,
        rt;
      if (J("("), J("stream", !0) && (Ne = !0), !P.test(xe = W()) || (ie = xe, J(")"), J("returns"), J("("), J("stream", !0) && (rt = !0), !P.test(xe = W()))) throw z(xe);
      je = xe, J(")");
      var Ke = new h($e, Ce, ie, je, Ne, rt);
      Ke.comment = be, Be(Ke, function (ct) {
        if (ct === "option") fe(Ke, ct), J(";");else throw z(ct);
      }), ce.add(Ke);
    }
    function ft(ce, xe) {
      if (!P.test(xe = W())) throw z(xe, "reference");
      var be = xe;
      Be(null, function ($e) {
        switch ($e) {
          case "required":
          case "repeated":
            Y(ce, $e, be);
            break;
          case "optional":
            Te === "proto3" ? Y(ce, "proto3_optional", be) : Y(ce, "optional", be);
            break;
          default:
            if (Te === "proto2" || !P.test($e)) throw z($e);
            $($e), Y(ce, "optional", be);
            break;
        }
      });
    }
    for (var Ge; (Ge = W()) !== null;) switch (Ge) {
      case "package":
        if (!re) throw z(Ge);
        st();
        break;
      case "import":
        if (!re) throw z(Ge);
        j();
        break;
      case "syntax":
        if (!re) throw z(Ge);
        De();
        break;
      case "edition":
        if (!re) throw z(Ge);
        Pe();
        break;
      case "option":
        fe(Ue, Ge), J(";", !0);
        break;
      default:
        if (Oe(Ue, Ge)) {
          re = !1;
          continue;
        }
        throw z(Ge);
    }
    return ne(), U.filename = null, {
      package: he,
      imports: ee,
      weakImports: Ie,
      root: N
    };
  }
  return scope.parse_1;
};
}
