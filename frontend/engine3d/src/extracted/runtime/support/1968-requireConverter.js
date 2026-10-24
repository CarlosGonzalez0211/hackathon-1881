/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1482911:1487870.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1968(scope) {
scope.requireConverter = function requireConverter() {
  return scope.hasRequiredConverter || (scope.hasRequiredConverter = 1, function (r) {
    var e = r,
      i = scope.require_enum(),
      s = scope.requireUtil();
    function a(l, c, h, d) {
      var p = !1;
      if (c.resolvedType) {
        if (c.resolvedType instanceof i) {
          l("switch(d%s){", d);
          for (var f = c.resolvedType.values, _ = Object.keys(f), x = 0; x < _.length; ++x) f[_[x]] === c.typeDefault && !p && (l("default:")('if(typeof(d%s)==="number"){m%s=d%s;break}', d, d, d), c.repeated || l("break"), p = !0), l("case%j:", _[x])("case %i:", f[_[x]])("m%s=%j", d, f[_[x]])("break");
          l("}");
        } else l('if(typeof d%s!=="object")', d)("throw TypeError(%j)", c.fullName + ": object expected")("m%s=types[%i].fromObject(d%s)", d, h, d);
      } else {
        var b = !1;
        switch (c.type) {
          case "double":
          case "float":
            l("m%s=Number(d%s)", d, d);
            break;
          case "uint32":
          case "fixed32":
            l("m%s=d%s>>>0", d, d);
            break;
          case "int32":
          case "sint32":
          case "sfixed32":
            l("m%s=d%s|0", d, d);
            break;
          case "uint64":
            b = !0;
          case "int64":
          case "sint64":
          case "fixed64":
          case "sfixed64":
            l("if(util.Long)")("(m%s=util.Long.fromValue(d%s)).unsigned=%j", d, d, b)('else if(typeof d%s==="string")', d)("m%s=parseInt(d%s,10)", d, d)('else if(typeof d%s==="number")', d)("m%s=d%s", d, d)('else if(typeof d%s==="object")', d)("m%s=new util.LongBits(d%s.low>>>0,d%s.high>>>0).toNumber(%s)", d, d, d, b ? "true" : "");
            break;
          case "bytes":
            l('if(typeof d%s==="string")', d)("util.base64.decode(d%s,m%s=util.newBuffer(util.base64.length(d%s)),0)", d, d, d)("else if(d%s.length >= 0)", d)("m%s=d%s", d, d);
            break;
          case "string":
            l("m%s=String(d%s)", d, d);
            break;
          case "bool":
            l("m%s=Boolean(d%s)", d, d);
            break;
        }
      }
      return l;
    }
    e.fromObject = function (c) {
      var h = c.fieldsArray,
        d = s.codegen(["d"], c.name + "$fromObject")("if(d instanceof this.ctor)")("return d");
      if (!h.length) return d("return new this.ctor");
      d("var m=new this.ctor");
      for (var p = 0; p < h.length; ++p) {
        var f = h[p].resolve(),
          _ = s.safeProp(f.name);
        f.map ? (d("if(d%s){", _)('if(typeof d%s!=="object")', _)("throw TypeError(%j)", f.fullName + ": object expected")("m%s={}", _)("for(var ks=Object.keys(d%s),i=0;i<ks.length;++i){", _), a(d, f, p, _ + "[ks[i]]")("}")("}")) : f.repeated ? (d("if(d%s){", _)("if(!Array.isArray(d%s))", _)("throw TypeError(%j)", f.fullName + ": array expected")("m%s=[]", _)("for(var i=0;i<d%s.length;++i){", _), a(d, f, p, _ + "[i]")("}")("}")) : (f.resolvedType instanceof i || d("if(d%s!=null){", _), a(d, f, p, _), f.resolvedType instanceof i || d("}"));
      }
      return d("return m");
    };
    function o(l, c, h, d) {
      if (c.resolvedType) c.resolvedType instanceof i ? l("d%s=o.enums===String?(types[%i].values[m%s]===undefined?m%s:types[%i].values[m%s]):m%s", d, h, d, d, h, d, d) : l("d%s=types[%i].toObject(m%s,o)", d, h, d);else {
        var p = !1;
        switch (c.type) {
          case "double":
          case "float":
            l("d%s=o.json&&!isFinite(m%s)?String(m%s):m%s", d, d, d, d);
            break;
          case "uint64":
            p = !0;
          case "int64":
          case "sint64":
          case "fixed64":
          case "sfixed64":
            l('if(typeof m%s==="number")', d)("d%s=o.longs===String?String(m%s):m%s", d, d, d)("else")("d%s=o.longs===String?util.Long.prototype.toString.call(m%s):o.longs===Number?new util.LongBits(m%s.low>>>0,m%s.high>>>0).toNumber(%s):m%s", d, d, d, d, p ? "true" : "", d);
            break;
          case "bytes":
            l("d%s=o.bytes===String?util.base64.encode(m%s,0,m%s.length):o.bytes===Array?Array.prototype.slice.call(m%s):m%s", d, d, d, d, d);
            break;
          default:
            l("d%s=m%s", d, d);
            break;
        }
      }
      return l;
    }
    e.toObject = function (c) {
      var h = c.fieldsArray.slice().sort(s.compareFieldsById);
      if (!h.length) return s.codegen()("return {}");
      for (var d = s.codegen(["m", "o"], c.name + "$toObject")("if(!o)")("o={}")("var d={}"), p = [], f = [], _ = [], x = 0; x < h.length; ++x) h[x].partOf || (h[x].resolve().repeated ? p : h[x].map ? f : _).push(h[x]);
      if (p.length) {
        for (d("if(o.arrays||o.defaults){"), x = 0; x < p.length; ++x) d("d%s=[]", s.safeProp(p[x].name));
        d("}");
      }
      if (f.length) {
        for (d("if(o.objects||o.defaults){"), x = 0; x < f.length; ++x) d("d%s={}", s.safeProp(f[x].name));
        d("}");
      }
      if (_.length) {
        for (d("if(o.defaults){"), x = 0; x < _.length; ++x) {
          var b = _[x],
            T = s.safeProp(b.name);
          if (b.resolvedType instanceof i) d("d%s=o.enums===String?%j:%j", T, b.resolvedType.valuesById[b.typeDefault], b.typeDefault);else if (b.long) d("if(util.Long){")("var n=new util.Long(%i,%i,%j)", b.typeDefault.low, b.typeDefault.high, b.typeDefault.unsigned)("d%s=o.longs===String?n.toString():o.longs===Number?n.toNumber():n", T)("}else")("d%s=o.longs===String?%j:%i", T, b.typeDefault.toString(), b.typeDefault.toNumber());else if (b.bytes) {
            var M = "[" + Array.prototype.slice.call(b.typeDefault).join(",") + "]";
            d("if(o.bytes===String)d%s=%j", T, String.fromCharCode.apply(String, b.typeDefault))("else{")("d%s=%s", T, M)("if(o.bytes!==Array)d%s=util.newBuffer(d%s)", T, T)("}");
          } else d("d%s=%j", T, b.typeDefault);
        }
        d("}");
      }
      var w = !1;
      for (x = 0; x < h.length; ++x) {
        var b = h[x],
          D = c._fieldsArray.indexOf(b),
          T = s.safeProp(b.name);
        b.map ? (w || (w = !0, d("var ks2")), d("if(m%s&&(ks2=Object.keys(m%s)).length){", T, T)("d%s={}", T)("for(var j=0;j<ks2.length;++j){"), o(d, b, D, T + "[ks2[j]]")("}")) : b.repeated ? (d("if(m%s&&m%s.length){", T, T)("d%s=[]", T)("for(var j=0;j<m%s.length;++j){", T), o(d, b, D, T + "[j]")("}")) : (d("if(m%s!=null&&m.hasOwnProperty(%j)){", T, b.name), o(d, b, D, T), b.partOf && d("if(o.oneofs)")("d%s=%j", s.safeProp(b.partOf.name), b.name)), d("}");
      }
      return d("return d");
    };
  }(scope.converter)), scope.converter;
};
}
