/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 764759:766860.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1279(scope) {
scope.geometryLoader = {
  _geometryCache: new Map(),
  _initLoad(r, e) {
    return this._geometryCache.has(r) || this._geometryCache.set(r, new Promise(e)), this._geometryCache.get(r);
  },
  load(r, e = !1) {
    return this._initLoad(r, async i => {
      const s = r.split(".").pop();
      let a = null;
      try {
        s.startsWith("drc") || s.startsWith("bin") ? a = await scope.customDracoLoader.loadAsync(r) : a = await scope.bufferGeometryLoader.loadAsync(r), i(a);
      } catch (o) {
        console.log("Geometry loader", o), i(scope.fallbackGeometry);
      }
      e || (scope.customDracoLoader.deleteFromCache(r), scope.deleteFromCache$1(r));
    });
  },
  instanced(r, e, i = "load", s = !1) {
    const a = `instanced_<>_${r}-${e}`;
    return this._initLoad(a, async o => {
      const [l, c] = await Promise.all([this[i](r, !1), this.load(e, !1)]),
        h = await scope.geometryProcessor.instanced(l, c);
      o(h), s || scope.deleteFromCache$1(a);
    });
  },
  instancedPatches(r, e, i = "load", s = !1) {
    const a = `instancedPatches_<>_${r}-${e}`;
    return this._initLoad(a, async o => {
      const [l, c] = await Promise.all([this[i](r, !1), this.load(e, !1)]),
        h = await scope.geometryProcessor.instancedPatches(l, c);
      o(h), s || scope.deleteFromCache$1(a);
    });
  },
  batched(r, e = !1) {
    const i = `batched_<>_${r}`;
    return this._initLoad(i, async s => {
      const a = await this.load(r, !1),
        o = await scope.geometryProcessor.batched(a);
      s(o), e || scope.deleteFromCache$1(i);
    });
  },
  vertexAnimation(r, e = !1) {
    const i = `vertexanimation_<>_${r}`;
    return this._initLoad(i, async s => {
      const a = await this.load(r, !1);
      s(scope.createVertexAnimation(a)), e || scope.deleteFromCache$1(i);
    });
  },
  curves(r, e = !1, i = 1, s = !1) {
    const a = `curves_<>_${r}_${e}_${i}`;
    return this._initLoad(a, async o => {
      const l = await this.load(r, !1);
      o(scope.createCurves(l, i, e)), s || scope.deleteFromCache$1(a);
    });
  },
  pointAnimation(r, e = !1) {
    const i = `pointanimation_<>_${r}`;
    return this._initLoad(i, async s => {
      const a = await this.load(r, !1);
      s(new scope.pointAnimation(a)), e || scope.deleteFromCache$1(i);
    });
  },
  skin(r, e, i = !1) {
    const s = `skin_<>_${r}-${e}`;
    return this._initLoad(`skin_<>_${r}-${e}`, async a => {
      const [o, l] = await Promise.all([this.load(r, !1), this.load(e, !1)]);
      a(scope.createSkin(o, l)), i || scope.deleteFromCache$1(s);
    });
  },
  skinAnimation(r, e = !1) {
    const i = `skinanimation_<>_${r}`;
    return this._initLoad(i, async s => {
      const a = await this.load(r, !1);
      s(scope.createSkinAnimation(r, a)), e || scope.deleteFromCache$1(i);
    });
  },
  msdf(r) {
    return scope.msdfLoader.loadAsync(r);
  }
};
}
