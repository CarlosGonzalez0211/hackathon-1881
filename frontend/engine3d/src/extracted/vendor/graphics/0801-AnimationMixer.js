/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 310682:316896.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0801(scope) {
scope.AnimationMixer = class AnimationMixer extends scope.EventDispatcher {
  constructor(e) {
    super(), this._root = e, this._initMemoryManager(), this._accuIndex = 0, this.time = 0, this.timeScale = 1;
  }
  _bindAction(e, i) {
    const s = e._localRoot || this._root,
      a = e._clip.tracks,
      o = a.length,
      l = e._propertyBindings,
      c = e._interpolants,
      h = s.uuid,
      d = this._bindingsByRootAndName;
    let p = d[h];
    p === void 0 && (p = {}, d[h] = p);
    for (let f = 0; f !== o; ++f) {
      const _ = a[f],
        x = _.name;
      let b = p[x];
      if (b !== void 0) ++b.referenceCount, l[f] = b;else {
        if (b = l[f], b !== void 0) {
          b._cacheIndex === null && (++b.referenceCount, this._addInactiveBinding(b, h, x));
          continue;
        }
        const T = i && i._propertyBindings[f].binding.parsedPath;
        b = new scope.PropertyMixer(scope.PropertyBinding.create(s, x, T), _.ValueTypeName, _.getValueSize()), ++b.referenceCount, this._addInactiveBinding(b, h, x), l[f] = b;
      }
      c[f].resultBuffer = b.buffer;
    }
  }
  _activateAction(e) {
    if (!this._isActiveAction(e)) {
      if (e._cacheIndex === null) {
        const s = (e._localRoot || this._root).uuid,
          a = e._clip.uuid,
          o = this._actionsByClip[a];
        this._bindAction(e, o && o.knownActions[0]), this._addInactiveAction(e, a, s);
      }
      const i = e._propertyBindings;
      for (let s = 0, a = i.length; s !== a; ++s) {
        const o = i[s];
        o.useCount++ === 0 && (this._lendBinding(o), o.saveOriginalState());
      }
      this._lendAction(e);
    }
  }
  _deactivateAction(e) {
    if (this._isActiveAction(e)) {
      const i = e._propertyBindings;
      for (let s = 0, a = i.length; s !== a; ++s) {
        const o = i[s];
        --o.useCount === 0 && (o.restoreOriginalState(), this._takeBackBinding(o));
      }
      this._takeBackAction(e);
    }
  }
  _initMemoryManager() {
    this._actions = [], this._nActiveActions = 0, this._actionsByClip = {}, this._bindings = [], this._nActiveBindings = 0, this._bindingsByRootAndName = {}, this._controlInterpolants = [], this._nActiveControlInterpolants = 0;
    const e = this;
    this.stats = {
      actions: {
        get total() {
          return e._actions.length;
        },
        get inUse() {
          return e._nActiveActions;
        }
      },
      bindings: {
        get total() {
          return e._bindings.length;
        },
        get inUse() {
          return e._nActiveBindings;
        }
      },
      controlInterpolants: {
        get total() {
          return e._controlInterpolants.length;
        },
        get inUse() {
          return e._nActiveControlInterpolants;
        }
      }
    };
  }
  _isActiveAction(e) {
    const i = e._cacheIndex;
    return i !== null && i < this._nActiveActions;
  }
  _addInactiveAction(e, i, s) {
    const a = this._actions,
      o = this._actionsByClip;
    let l = o[i];
    if (l === void 0) l = {
      knownActions: [e],
      actionByRoot: {}
    }, e._byClipCacheIndex = 0, o[i] = l;else {
      const c = l.knownActions;
      e._byClipCacheIndex = c.length, c.push(e);
    }
    e._cacheIndex = a.length, a.push(e), l.actionByRoot[s] = e;
  }
  _removeInactiveAction(e) {
    const i = this._actions,
      s = i[i.length - 1],
      a = e._cacheIndex;
    s._cacheIndex = a, i[a] = s, i.pop(), e._cacheIndex = null;
    const o = e._clip.uuid,
      l = this._actionsByClip,
      c = l[o],
      h = c.knownActions,
      d = h[h.length - 1],
      p = e._byClipCacheIndex;
    d._byClipCacheIndex = p, h[p] = d, h.pop(), e._byClipCacheIndex = null;
    const f = c.actionByRoot,
      _ = (e._localRoot || this._root).uuid;
    delete f[_], h.length === 0 && delete l[o], this._removeInactiveBindingsForAction(e);
  }
  _removeInactiveBindingsForAction(e) {
    const i = e._propertyBindings;
    for (let s = 0, a = i.length; s !== a; ++s) {
      const o = i[s];
      --o.referenceCount === 0 && this._removeInactiveBinding(o);
    }
  }
  _lendAction(e) {
    const i = this._actions,
      s = e._cacheIndex,
      a = this._nActiveActions++,
      o = i[a];
    e._cacheIndex = a, i[a] = e, o._cacheIndex = s, i[s] = o;
  }
  _takeBackAction(e) {
    const i = this._actions,
      s = e._cacheIndex,
      a = --this._nActiveActions,
      o = i[a];
    e._cacheIndex = a, i[a] = e, o._cacheIndex = s, i[s] = o;
  }
  _addInactiveBinding(e, i, s) {
    const a = this._bindingsByRootAndName,
      o = this._bindings;
    let l = a[i];
    l === void 0 && (l = {}, a[i] = l), l[s] = e, e._cacheIndex = o.length, o.push(e);
  }
  _removeInactiveBinding(e) {
    const i = this._bindings,
      s = e.binding,
      a = s.rootNode.uuid,
      o = s.path,
      l = this._bindingsByRootAndName,
      c = l[a],
      h = i[i.length - 1],
      d = e._cacheIndex;
    h._cacheIndex = d, i[d] = h, i.pop(), delete c[o], Object.keys(c).length === 0 && delete l[a];
  }
  _lendBinding(e) {
    const i = this._bindings,
      s = e._cacheIndex,
      a = this._nActiveBindings++,
      o = i[a];
    e._cacheIndex = a, i[a] = e, o._cacheIndex = s, i[s] = o;
  }
  _takeBackBinding(e) {
    const i = this._bindings,
      s = e._cacheIndex,
      a = --this._nActiveBindings,
      o = i[a];
    e._cacheIndex = a, i[a] = e, o._cacheIndex = s, i[s] = o;
  }
  _lendControlInterpolant() {
    const e = this._controlInterpolants,
      i = this._nActiveControlInterpolants++;
    let s = e[i];
    return s === void 0 && (s = new scope.LinearInterpolant(new Float32Array(2), new Float32Array(2), 1, scope._controlInterpolantsResultBuffer), s.__cacheIndex = i, e[i] = s), s;
  }
  _takeBackControlInterpolant(e) {
    const i = this._controlInterpolants,
      s = e.__cacheIndex,
      a = --this._nActiveControlInterpolants,
      o = i[a];
    e.__cacheIndex = a, i[a] = e, o.__cacheIndex = s, i[s] = o;
  }
  clipAction(e, i, s) {
    const a = i || this._root,
      o = a.uuid;
    let l = typeof e == "string" ? scope.AnimationClip.findByName(a, e) : e;
    const c = l !== null ? l.uuid : e,
      h = this._actionsByClip[c];
    let d = null;
    if (s === void 0 && (l !== null ? s = l.blendMode : s = scope.NormalAnimationBlendMode), h !== void 0) {
      const f = h.actionByRoot[o];
      if (f !== void 0 && f.blendMode === s) return f;
      d = h.knownActions[0], l === null && (l = d._clip);
    }
    if (l === null) return null;
    const p = new scope.AnimationAction(this, l, i, s);
    return this._bindAction(p, d), this._addInactiveAction(p, c, o), p;
  }
  existingAction(e, i) {
    const s = i || this._root,
      a = s.uuid,
      o = typeof e == "string" ? scope.AnimationClip.findByName(s, e) : e,
      l = o ? o.uuid : e,
      c = this._actionsByClip[l];
    return c !== void 0 && c.actionByRoot[a] || null;
  }
  stopAllAction() {
    const e = this._actions,
      i = this._nActiveActions;
    for (let s = i - 1; s >= 0; --s) e[s].stop();
    return this;
  }
  update(e) {
    e *= this.timeScale;
    const i = this._actions,
      s = this._nActiveActions,
      a = this.time += e,
      o = Math.sign(e),
      l = this._accuIndex ^= 1;
    for (let d = 0; d !== s; ++d) i[d]._update(a, e, o, l);
    const c = this._bindings,
      h = this._nActiveBindings;
    for (let d = 0; d !== h; ++d) c[d].apply(l);
    return this;
  }
  setTime(e) {
    this.time = 0;
    for (let i = 0; i < this._actions.length; i++) this._actions[i].time = 0;
    return this.update(e);
  }
  getRoot() {
    return this._root;
  }
  uncacheClip(e) {
    const i = this._actions,
      s = e.uuid,
      a = this._actionsByClip,
      o = a[s];
    if (o !== void 0) {
      const l = o.knownActions;
      for (let c = 0, h = l.length; c !== h; ++c) {
        const d = l[c];
        this._deactivateAction(d);
        const p = d._cacheIndex,
          f = i[i.length - 1];
        d._cacheIndex = null, d._byClipCacheIndex = null, f._cacheIndex = p, i[p] = f, i.pop(), this._removeInactiveBindingsForAction(d);
      }
      delete a[s];
    }
  }
  uncacheRoot(e) {
    const i = e.uuid,
      s = this._actionsByClip;
    for (const l in s) {
      const c = s[l].actionByRoot,
        h = c[i];
      h !== void 0 && (this._deactivateAction(h), this._removeInactiveAction(h));
    }
    const a = this._bindingsByRootAndName,
      o = a[i];
    if (o !== void 0) for (const l in o) {
      const c = o[l];
      c.restoreOriginalState(), this._removeInactiveBinding(c);
    }
  }
  uncacheAction(e, i) {
    const s = this.existingAction(e, i);
    s !== null && (this._deactivateAction(s), this._removeInactiveAction(s));
  }
};
}
