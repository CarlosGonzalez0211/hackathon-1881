/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 294169:296781.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0781(scope) {
scope.PropertyMixer = class PropertyMixer {
  constructor(e, i, s) {
    this.binding = e, this.valueSize = s;
    let a, o, l;
    switch (i) {
      case "quaternion":
        a = this._slerp, o = this._slerpAdditive, l = this._setAdditiveIdentityQuaternion, this.buffer = new Float64Array(s * 6), this._workIndex = 5;
        break;
      case "string":
      case "bool":
        a = this._select, o = this._select, l = this._setAdditiveIdentityOther, this.buffer = new Array(s * 5);
        break;
      default:
        a = this._lerp, o = this._lerpAdditive, l = this._setAdditiveIdentityNumeric, this.buffer = new Float64Array(s * 5);
    }
    this._mixBufferRegion = a, this._mixBufferRegionAdditive = o, this._setIdentity = l, this._origIndex = 3, this._addIndex = 4, this.cumulativeWeight = 0, this.cumulativeWeightAdditive = 0, this.useCount = 0, this.referenceCount = 0;
  }
  accumulate(e, i) {
    const s = this.buffer,
      a = this.valueSize,
      o = e * a + a;
    let l = this.cumulativeWeight;
    if (l === 0) {
      for (let c = 0; c !== a; ++c) s[o + c] = s[c];
      l = i;
    } else {
      l += i;
      const c = i / l;
      this._mixBufferRegion(s, o, 0, c, a);
    }
    this.cumulativeWeight = l;
  }
  accumulateAdditive(e) {
    const i = this.buffer,
      s = this.valueSize,
      a = s * this._addIndex;
    this.cumulativeWeightAdditive === 0 && this._setIdentity(), this._mixBufferRegionAdditive(i, a, 0, e, s), this.cumulativeWeightAdditive += e;
  }
  apply(e) {
    const i = this.valueSize,
      s = this.buffer,
      a = e * i + i,
      o = this.cumulativeWeight,
      l = this.cumulativeWeightAdditive,
      c = this.binding;
    if (this.cumulativeWeight = 0, this.cumulativeWeightAdditive = 0, o < 1) {
      const h = i * this._origIndex;
      this._mixBufferRegion(s, a, h, 1 - o, i);
    }
    l > 0 && this._mixBufferRegionAdditive(s, a, this._addIndex * i, 1, i);
    for (let h = i, d = i + i; h !== d; ++h) if (s[h] !== s[h + i]) {
      c.setValue(s, a);
      break;
    }
  }
  saveOriginalState() {
    const e = this.binding,
      i = this.buffer,
      s = this.valueSize,
      a = s * this._origIndex;
    e.getValue(i, a);
    for (let o = s, l = a; o !== l; ++o) i[o] = i[a + o % s];
    this._setIdentity(), this.cumulativeWeight = 0, this.cumulativeWeightAdditive = 0;
  }
  restoreOriginalState() {
    const e = this.valueSize * 3;
    this.binding.setValue(this.buffer, e);
  }
  _setAdditiveIdentityNumeric() {
    const e = this._addIndex * this.valueSize,
      i = e + this.valueSize;
    for (let s = e; s < i; s++) this.buffer[s] = 0;
  }
  _setAdditiveIdentityQuaternion() {
    this._setAdditiveIdentityNumeric(), this.buffer[this._addIndex * this.valueSize + 3] = 1;
  }
  _setAdditiveIdentityOther() {
    const e = this._origIndex * this.valueSize,
      i = this._addIndex * this.valueSize;
    for (let s = 0; s < this.valueSize; s++) this.buffer[i + s] = this.buffer[e + s];
  }
  _select(e, i, s, a, o) {
    if (a >= .5) for (let l = 0; l !== o; ++l) e[i + l] = e[s + l];
  }
  _slerp(e, i, s, a) {
    scope.Quaternion.slerpFlat(e, i, e, i, e, s, a);
  }
  _slerpAdditive(e, i, s, a, o) {
    const l = this._workIndex * o;
    scope.Quaternion.multiplyQuaternionsFlat(e, l, e, i, e, s), scope.Quaternion.slerpFlat(e, i, e, i, e, l, a);
  }
  _lerp(e, i, s, a, o) {
    const l = 1 - a;
    for (let c = 0; c !== o; ++c) {
      const h = i + c;
      e[h] = e[h] * l + e[s + c] * a;
    }
  }
  _lerpAdditive(e, i, s, a, o) {
    for (let l = 0; l !== o; ++l) {
      const c = i + l;
      e[c] = e[c] + e[s + l] * a;
    }
  }
};
}
