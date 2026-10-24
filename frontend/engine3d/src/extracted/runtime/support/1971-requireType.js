/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1488883:1495486.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1971(scope) {
scope.requireType = function requireType() {
  if (scope.hasRequiredType) return scope.type;
  scope.hasRequiredType = 1, scope.type = T;
  var r = scope.requireNamespace();
  ((T.prototype = Object.create(r.prototype)).constructor = T).className = "Type";
  var e = scope.require_enum(),
    i = scope.requireOneof(),
    s = scope.requireField(),
    a = scope.requireMapfield(),
    o = scope.requireService(),
    l = scope.requireMessage(),
    c = scope.requireReader(),
    h = scope.requireWriter(),
    d = scope.requireUtil(),
    p = scope.requireEncoder(),
    f = scope.requireDecoder(),
    _ = scope.requireVerifier(),
    x = scope.requireConverter(),
    b = scope.requireWrappers();
  function T(w, D) {
    r.call(this, w, D), this.fields = {}, this.oneofs = void 0, this.extensions = void 0, this.reserved = void 0, this.group = void 0, this._fieldsById = null, this._fieldsArray = null, this._oneofsArray = null, this._ctor = null;
  }
  Object.defineProperties(T.prototype, {
    fieldsById: {
      get: function () {
        if (this._fieldsById) return this._fieldsById;
        this._fieldsById = {};
        for (var w = Object.keys(this.fields), D = 0; D < w.length; ++D) {
          var R = this.fields[w[D]],
            P = R.id;
          if (this._fieldsById[P]) throw Error("duplicate id " + P + " in " + this);
          this._fieldsById[P] = R;
        }
        return this._fieldsById;
      }
    },
    fieldsArray: {
      get: function () {
        return this._fieldsArray || (this._fieldsArray = d.toArray(this.fields));
      }
    },
    oneofsArray: {
      get: function () {
        return this._oneofsArray || (this._oneofsArray = d.toArray(this.oneofs));
      }
    },
    ctor: {
      get: function () {
        return this._ctor || (this.ctor = T.generateConstructor(this)());
      },
      set: function (w) {
        var D = w.prototype;
        D instanceof l || ((w.prototype = new l()).constructor = w, d.merge(w.prototype, D)), w.$type = w.prototype.$type = this, d.merge(w, l, !0), this._ctor = w;
        for (var R = 0; R < this.fieldsArray.length; ++R) this._fieldsArray[R].resolve();
        var P = {};
        for (R = 0; R < this.oneofsArray.length; ++R) P[this._oneofsArray[R].resolve().name] = {
          get: d.oneOfGetter(this._oneofsArray[R].oneof),
          set: d.oneOfSetter(this._oneofsArray[R].oneof)
        };
        R && Object.defineProperties(w.prototype, P);
      }
    }
  }), T.generateConstructor = function (D) {
    for (var R = d.codegen(["p"], D.name), P = 0, U; P < D.fieldsArray.length; ++P) (U = D._fieldsArray[P]).map ? R("this%s={}", d.safeProp(U.name)) : U.repeated && R("this%s=[]", d.safeProp(U.name));
    return R("if(p)for(var ks=Object.keys(p),i=0;i<ks.length;++i)if(p[ks[i]]!=null)")("this[ks[i]]=p[ks[i]]");
  };
  function M(w) {
    return w._fieldsById = w._fieldsArray = w._oneofsArray = null, delete w.encode, delete w.decode, delete w.verify, w;
  }
  return T.fromJSON = function (D, R) {
    var P = new T(D, R.options);
    P.extensions = R.extensions, P.reserved = R.reserved;
    for (var U = Object.keys(R.fields), O = 0; O < U.length; ++O) P.add((typeof R.fields[U[O]].keyType < "u" ? a.fromJSON : s.fromJSON)(U[O], R.fields[U[O]]));
    if (R.oneofs) for (U = Object.keys(R.oneofs), O = 0; O < U.length; ++O) P.add(i.fromJSON(U[O], R.oneofs[U[O]]));
    if (R.nested) for (U = Object.keys(R.nested), O = 0; O < U.length; ++O) {
      var N = R.nested[U[O]];
      P.add((N.id !== void 0 ? s.fromJSON : N.fields !== void 0 ? T.fromJSON : N.values !== void 0 ? e.fromJSON : N.methods !== void 0 ? o.fromJSON : r.fromJSON)(U[O], N));
    }
    return R.extensions && R.extensions.length && (P.extensions = R.extensions), R.reserved && R.reserved.length && (P.reserved = R.reserved), R.group && (P.group = !0), R.comment && (P.comment = R.comment), R.edition && (P._edition = R.edition), P._defaultEdition = "proto3", P;
  }, T.prototype.toJSON = function (D) {
    var R = r.prototype.toJSON.call(this, D),
      P = D ? !!D.keepComments : !1;
    return d.toObject(["edition", this._editionToJSON(), "options", R && R.options || void 0, "oneofs", r.arrayToJSON(this.oneofsArray, D), "fields", r.arrayToJSON(this.fieldsArray.filter(function (U) {
      return !U.declaringField;
    }), D) || {}, "extensions", this.extensions && this.extensions.length ? this.extensions : void 0, "reserved", this.reserved && this.reserved.length ? this.reserved : void 0, "group", this.group || void 0, "nested", R && R.nested || void 0, "comment", P ? this.comment : void 0]);
  }, T.prototype.resolveAll = function () {
    if (!this._needsRecursiveResolve) return this;
    r.prototype.resolveAll.call(this);
    var D = this.oneofsArray;
    for (P = 0; P < D.length;) D[P++].resolve();
    for (var R = this.fieldsArray, P = 0; P < R.length;) R[P++].resolve();
    return this;
  }, T.prototype._resolveFeaturesRecursive = function (D) {
    return this._needsRecursiveFeatureResolution ? (D = this._edition || D, r.prototype._resolveFeaturesRecursive.call(this, D), this.oneofsArray.forEach(R => {
      R._resolveFeatures(D);
    }), this.fieldsArray.forEach(R => {
      R._resolveFeatures(D);
    }), this) : this;
  }, T.prototype.get = function (D) {
    return this.fields[D] || this.oneofs && this.oneofs[D] || this.nested && this.nested[D] || null;
  }, T.prototype.add = function (D) {
    if (this.get(D.name)) throw Error("duplicate name '" + D.name + "' in " + this);
    if (D instanceof s && D.extend === void 0) {
      if (this._fieldsById ? this._fieldsById[D.id] : this.fieldsById[D.id]) throw Error("duplicate id " + D.id + " in " + this);
      if (this.isReservedId(D.id)) throw Error("id " + D.id + " is reserved in " + this);
      if (this.isReservedName(D.name)) throw Error("name '" + D.name + "' is reserved in " + this);
      return D.parent && D.parent.remove(D), this.fields[D.name] = D, D.message = this, D.onAdd(this), M(this);
    }
    return D instanceof i ? (this.oneofs || (this.oneofs = {}), this.oneofs[D.name] = D, D.onAdd(this), M(this)) : r.prototype.add.call(this, D);
  }, T.prototype.remove = function (D) {
    if (D instanceof s && D.extend === void 0) {
      if (!this.fields || this.fields[D.name] !== D) throw Error(D + " is not a member of " + this);
      return delete this.fields[D.name], D.parent = null, D.onRemove(this), M(this);
    }
    if (D instanceof i) {
      if (!this.oneofs || this.oneofs[D.name] !== D) throw Error(D + " is not a member of " + this);
      return delete this.oneofs[D.name], D.parent = null, D.onRemove(this), M(this);
    }
    return r.prototype.remove.call(this, D);
  }, T.prototype.isReservedId = function (D) {
    return r.isReservedId(this.reserved, D);
  }, T.prototype.isReservedName = function (D) {
    return r.isReservedName(this.reserved, D);
  }, T.prototype.create = function (D) {
    return new this.ctor(D);
  }, T.prototype.setup = function () {
    for (var D = this.fullName, R = [], P = 0; P < this.fieldsArray.length; ++P) R.push(this._fieldsArray[P].resolve().resolvedType);
    this.encode = p(this)({
      Writer: h,
      types: R,
      util: d
    }), this.decode = f(this)({
      Reader: c,
      types: R,
      util: d
    }), this.verify = _(this)({
      types: R,
      util: d
    }), this.fromObject = x.fromObject(this)({
      types: R,
      util: d
    }), this.toObject = x.toObject(this)({
      types: R,
      util: d
    });
    var U = b[D];
    if (U) {
      var O = Object.create(this);
      O.fromObject = this.fromObject, this.fromObject = U.fromObject.bind(O), O.toObject = this.toObject, this.toObject = U.toObject.bind(O);
    }
    return this;
  }, T.prototype.encode = function (D, R) {
    return this.setup().encode(D, R);
  }, T.prototype.encodeDelimited = function (D, R) {
    return this.encode(D, R && R.len ? R.fork() : R).ldelim();
  }, T.prototype.decode = function (D, R) {
    return this.setup().decode(D, R);
  }, T.prototype.decodeDelimited = function (D) {
    return D instanceof c || (D = c.create(D)), this.decode(D, D.uint32());
  }, T.prototype.verify = function (D) {
    return this.setup().verify(D);
  }, T.prototype.fromObject = function (D) {
    return this.setup().fromObject(D);
  }, T.prototype.toObject = function (D, R) {
    return this.setup().toObject(D, R);
  }, T.d = function (D) {
    return function (P) {
      d.decorateType(P, D);
    };
  }, scope.type;
};
}
