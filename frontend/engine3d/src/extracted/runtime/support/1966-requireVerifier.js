/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1480290:1482873.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1966(scope) {
scope.requireVerifier = function requireVerifier() {
  if (scope.hasRequiredVerifier) return scope.verifier_1;
  scope.hasRequiredVerifier = 1, scope.verifier_1 = o;
  var r = scope.require_enum(),
    e = scope.requireUtil();
  function i(l, c) {
    return l.name + ": " + c + (l.repeated && c !== "array" ? "[]" : l.map && c !== "object" ? "{k:" + l.keyType + "}" : "") + " expected";
  }
  function s(l, c, h, d) {
    if (c.resolvedType) {
      if (c.resolvedType instanceof r) {
        l("switch(%s){", d)("default:")("return%j", i(c, "enum value"));
        for (var p = Object.keys(c.resolvedType.values), f = 0; f < p.length; ++f) l("case %i:", c.resolvedType.values[p[f]]);
        l("break")("}");
      } else l("{")("var e=types[%i].verify(%s);", h, d)("if(e)")("return%j+e", c.name + ".")("}");
    } else switch (c.type) {
      case "int32":
      case "uint32":
      case "sint32":
      case "fixed32":
      case "sfixed32":
        l("if(!util.isInteger(%s))", d)("return%j", i(c, "integer"));
        break;
      case "int64":
      case "uint64":
      case "sint64":
      case "fixed64":
      case "sfixed64":
        l("if(!util.isInteger(%s)&&!(%s&&util.isInteger(%s.low)&&util.isInteger(%s.high)))", d, d, d, d)("return%j", i(c, "integer|Long"));
        break;
      case "float":
      case "double":
        l('if(typeof %s!=="number")', d)("return%j", i(c, "number"));
        break;
      case "bool":
        l('if(typeof %s!=="boolean")', d)("return%j", i(c, "boolean"));
        break;
      case "string":
        l("if(!util.isString(%s))", d)("return%j", i(c, "string"));
        break;
      case "bytes":
        l('if(!(%s&&typeof %s.length==="number"||util.isString(%s)))', d, d, d)("return%j", i(c, "buffer"));
        break;
    }
    return l;
  }
  function a(l, c, h) {
    switch (c.keyType) {
      case "int32":
      case "uint32":
      case "sint32":
      case "fixed32":
      case "sfixed32":
        l("if(!util.key32Re.test(%s))", h)("return%j", i(c, "integer key"));
        break;
      case "int64":
      case "uint64":
      case "sint64":
      case "fixed64":
      case "sfixed64":
        l("if(!util.key64Re.test(%s))", h)("return%j", i(c, "integer|Long key"));
        break;
      case "bool":
        l("if(!util.key2Re.test(%s))", h)("return%j", i(c, "boolean key"));
        break;
    }
    return l;
  }
  function o(l) {
    var c = e.codegen(["m"], l.name + "$verify")('if(typeof m!=="object"||m===null)')("return%j", "object expected"),
      h = l.oneofsArray,
      d = {};
    h.length && c("var p={}");
    for (var p = 0; p < l.fieldsArray.length; ++p) {
      var f = l._fieldsArray[p].resolve(),
        _ = "m" + e.safeProp(f.name);
      if (f.optional && c("if(%s!=null&&m.hasOwnProperty(%j)){", _, f.name), f.map) c("if(!util.isObject(%s))", _)("return%j", i(f, "object"))("var k=Object.keys(%s)", _)("for(var i=0;i<k.length;++i){"), a(c, f, "k[i]"), s(c, f, p, _ + "[k[i]]")("}");else if (f.repeated) c("if(!Array.isArray(%s))", _)("return%j", i(f, "array"))("for(var i=0;i<%s.length;++i){", _), s(c, f, p, _ + "[i]")("}");else {
        if (f.partOf) {
          var x = e.safeProp(f.partOf.name);
          d[f.partOf.name] === 1 && c("if(p%s===1)", x)("return%j", f.partOf.name + ": multiple values"), d[f.partOf.name] = 1, c("p%s=1", x);
        }
        s(c, f, p, _);
      }
      f.optional && c("}");
    }
    return c("return null");
  }
  return scope.verifier_1;
};
}
