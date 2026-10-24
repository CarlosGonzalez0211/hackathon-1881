/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1478245:1480255.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1965(scope) {
scope.requireDecoder = function requireDecoder() {
  if (scope.hasRequiredDecoder) return scope.decoder_1;
  scope.hasRequiredDecoder = 1, scope.decoder_1 = a;
  var r = scope.require_enum(),
    e = scope.requireTypes(),
    i = scope.requireUtil();
  function s(o) {
    return "missing required '" + o.name + "'";
  }
  function a(o) {
    for (var l = i.codegen(["r", "l", "e"], o.name + "$decode")("if(!(r instanceof Reader))")("r=Reader.create(r)")("var c=l===undefined?r.len:r.pos+l,m=new this.ctor" + (o.fieldsArray.filter(function (_) {
        return _.map;
      }).length ? ",k,value" : ""))("while(r.pos<c){")("var t=r.uint32()")("if(t===e)")("break")("switch(t>>>3){"), c = 0; c < o.fieldsArray.length; ++c) {
      var h = o._fieldsArray[c].resolve(),
        d = h.resolvedType instanceof r ? "int32" : h.type,
        p = "m" + i.safeProp(h.name);
      l("case %i: {", h.id), h.map ? (l("if(%s===util.emptyObject)", p)("%s={}", p)("var c2 = r.uint32()+r.pos"), e.defaults[h.keyType] !== void 0 ? l("k=%j", e.defaults[h.keyType]) : l("k=null"), e.defaults[d] !== void 0 ? l("value=%j", e.defaults[d]) : l("value=null"), l("while(r.pos<c2){")("var tag2=r.uint32()")("switch(tag2>>>3){")("case 1: k=r.%s(); break", h.keyType)("case 2:"), e.basic[d] === void 0 ? l("value=types[%i].decode(r,r.uint32())", c) : l("value=r.%s()", d), l("break")("default:")("r.skipType(tag2&7)")("break")("}")("}"), e.long[h.keyType] !== void 0 ? l('%s[typeof k==="object"?util.longToHash(k):k]=value', p) : l("%s[k]=value", p)) : h.repeated ? (l("if(!(%s&&%s.length))", p, p)("%s=[]", p), e.packed[d] !== void 0 && l("if((t&7)===2){")("var c2=r.uint32()+r.pos")("while(r.pos<c2)")("%s.push(r.%s())", p, d)("}else"), e.basic[d] === void 0 ? l(h.delimited ? "%s.push(types[%i].decode(r,undefined,((t&~7)|4)))" : "%s.push(types[%i].decode(r,r.uint32()))", p, c) : l("%s.push(r.%s())", p, d)) : e.basic[d] === void 0 ? l(h.delimited ? "%s=types[%i].decode(r,undefined,((t&~7)|4))" : "%s=types[%i].decode(r,r.uint32())", p, c) : l("%s=r.%s()", p, d), l("break")("}");
    }
    for (l("default:")("r.skipType(t&7)")("break")("}")("}"), c = 0; c < o._fieldsArray.length; ++c) {
      var f = o._fieldsArray[c];
      f.required && l("if(!m.hasOwnProperty(%j))", f.name)("throw util.ProtocolError(%j,{instance:m})", s(f));
    }
    return l("return m");
  }
  return scope.decoder_1;
};
}
