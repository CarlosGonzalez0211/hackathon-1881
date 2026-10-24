/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1514963:1516464.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1979(scope) {
scope.requireEncoder = function requireEncoder() {
  if (scope.hasRequiredEncoder) return scope.encoder_1;
  scope.hasRequiredEncoder = 1, scope.encoder_1 = a;
  var r = scope.require_enum(),
    e = scope.requireTypes(),
    i = scope.requireUtil();
  function s(o, l, c, h) {
    return l.delimited ? o("types[%i].encode(%s,w.uint32(%i)).uint32(%i)", c, h, (l.id << 3 | 3) >>> 0, (l.id << 3 | 4) >>> 0) : o("types[%i].encode(%s,w.uint32(%i).fork()).ldelim()", c, h, (l.id << 3 | 2) >>> 0);
  }
  function a(o) {
    for (var l = i.codegen(["m", "w"], o.name + "$encode")("if(!w)")("w=Writer.create()"), c, h, d = o.fieldsArray.slice().sort(i.compareFieldsById), c = 0; c < d.length; ++c) {
      var p = d[c].resolve(),
        f = o._fieldsArray.indexOf(p),
        _ = p.resolvedType instanceof r ? "int32" : p.type,
        x = e.basic[_];
      h = "m" + i.safeProp(p.name), p.map ? (l("if(%s!=null&&Object.hasOwnProperty.call(m,%j)){", h, p.name)("for(var ks=Object.keys(%s),i=0;i<ks.length;++i){", h)("w.uint32(%i).fork().uint32(%i).%s(ks[i])", (p.id << 3 | 2) >>> 0, 8 | e.mapKey[p.keyType], p.keyType), x === void 0 ? l("types[%i].encode(%s[ks[i]],w.uint32(18).fork()).ldelim().ldelim()", f, h) : l(".uint32(%i).%s(%s[ks[i]]).ldelim()", 16 | x, _, h), l("}")("}")) : p.repeated ? (l("if(%s!=null&&%s.length){", h, h), p.packed && e.packed[_] !== void 0 ? l("w.uint32(%i).fork()", (p.id << 3 | 2) >>> 0)("for(var i=0;i<%s.length;++i)", h)("w.%s(%s[i])", _, h)("w.ldelim()") : (l("for(var i=0;i<%s.length;++i)", h), x === void 0 ? s(l, p, f, h + "[i]") : l("w.uint32(%i).%s(%s[i])", (p.id << 3 | x) >>> 0, _, h)), l("}")) : (p.optional && l("if(%s!=null&&Object.hasOwnProperty.call(m,%j))", h, p.name), x === void 0 ? s(l, p, f, h) : l("w.uint32(%i).%s(%s)", (p.id << 3 | x) >>> 0, _, h));
    }
    return l("return w");
  }
  return scope.encoder_1;
};
}
