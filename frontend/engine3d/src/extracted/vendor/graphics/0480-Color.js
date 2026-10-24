/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 116199:121601.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0480(scope) {
scope.Color = class Color {
  constructor(e, i, s) {
    return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, this.set(e, i, s);
  }
  set(e, i, s) {
    if (i === void 0 && s === void 0) {
      const a = e;
      a && a.isColor ? this.copy(a) : typeof a == "number" ? this.setHex(a) : typeof a == "string" && this.setStyle(a);
    } else this.setRGB(e, i, s);
    return this;
  }
  setScalar(e) {
    return this.r = e, this.g = e, this.b = e, this;
  }
  setHex(e, i = scope.SRGBColorSpace) {
    return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, scope.ColorManagement.colorSpaceToWorking(this, i), this;
  }
  setRGB(e, i, s, a = scope.ColorManagement.workingColorSpace) {
    return this.r = e, this.g = i, this.b = s, scope.ColorManagement.colorSpaceToWorking(this, a), this;
  }
  setHSL(e, i, s, a = scope.ColorManagement.workingColorSpace) {
    if (e = scope.euclideanModulo(e, 1), i = scope.clamp(i, 0, 1), s = scope.clamp(s, 0, 1), i === 0) this.r = this.g = this.b = s;else {
      const o = s <= .5 ? s * (1 + i) : s + i - s * i,
        l = 2 * s - o;
      this.r = scope.hue2rgb(l, o, e + 1 / 3), this.g = scope.hue2rgb(l, o, e), this.b = scope.hue2rgb(l, o, e - 1 / 3);
    }
    return scope.ColorManagement.colorSpaceToWorking(this, a), this;
  }
  setStyle(e, i = scope.SRGBColorSpace) {
    function s(o) {
      o !== void 0 && parseFloat(o) < 1 && console.warn("THREE.Color: Alpha component of " + e + " will be ignored.");
    }
    let a;
    if (a = /^(\w+)\(([^\)]*)\)/.exec(e)) {
      let o;
      const l = a[1],
        c = a[2];
      switch (l) {
        case "rgb":
        case "rgba":
          if (o = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(c)) return s(o[4]), this.setRGB(Math.min(255, parseInt(o[1], 10)) / 255, Math.min(255, parseInt(o[2], 10)) / 255, Math.min(255, parseInt(o[3], 10)) / 255, i);
          if (o = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(c)) return s(o[4]), this.setRGB(Math.min(100, parseInt(o[1], 10)) / 100, Math.min(100, parseInt(o[2], 10)) / 100, Math.min(100, parseInt(o[3], 10)) / 100, i);
          break;
        case "hsl":
        case "hsla":
          if (o = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(c)) return s(o[4]), this.setHSL(parseFloat(o[1]) / 360, parseFloat(o[2]) / 100, parseFloat(o[3]) / 100, i);
          break;
        default:
          console.warn("THREE.Color: Unknown color model " + e);
      }
    } else if (a = /^\#([A-Fa-f\d]+)$/.exec(e)) {
      const o = a[1],
        l = o.length;
      if (l === 3) return this.setRGB(parseInt(o.charAt(0), 16) / 15, parseInt(o.charAt(1), 16) / 15, parseInt(o.charAt(2), 16) / 15, i);
      if (l === 6) return this.setHex(parseInt(o, 16), i);
      console.warn("THREE.Color: Invalid hex color " + e);
    } else if (e && e.length > 0) return this.setColorName(e, i);
    return this;
  }
  setColorName(e, i = scope.SRGBColorSpace) {
    const s = scope._colorKeywords[e.toLowerCase()];
    return s !== void 0 ? this.setHex(s, i) : console.warn("THREE.Color: Unknown color " + e), this;
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(e) {
    return this.r = e.r, this.g = e.g, this.b = e.b, this;
  }
  copySRGBToLinear(e) {
    return this.r = scope.SRGBToLinear(e.r), this.g = scope.SRGBToLinear(e.g), this.b = scope.SRGBToLinear(e.b), this;
  }
  copyLinearToSRGB(e) {
    return this.r = scope.LinearToSRGB(e.r), this.g = scope.LinearToSRGB(e.g), this.b = scope.LinearToSRGB(e.b), this;
  }
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this;
  }
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this;
  }
  getHex(e = scope.SRGBColorSpace) {
    return scope.ColorManagement.workingToColorSpace(scope._color.copy(this), e), Math.round(scope.clamp(scope._color.r * 255, 0, 255)) * 65536 + Math.round(scope.clamp(scope._color.g * 255, 0, 255)) * 256 + Math.round(scope.clamp(scope._color.b * 255, 0, 255));
  }
  getHexString(e = scope.SRGBColorSpace) {
    return ("000000" + this.getHex(e).toString(16)).slice(-6);
  }
  getHSL(e, i = scope.ColorManagement.workingColorSpace) {
    scope.ColorManagement.workingToColorSpace(scope._color.copy(this), i);
    const s = scope._color.r,
      a = scope._color.g,
      o = scope._color.b,
      l = Math.max(s, a, o),
      c = Math.min(s, a, o);
    let h, d;
    const p = (c + l) / 2;
    if (c === l) h = 0, d = 0;else {
      const f = l - c;
      switch (d = p <= .5 ? f / (l + c) : f / (2 - l - c), l) {
        case s:
          h = (a - o) / f + (a < o ? 6 : 0);
          break;
        case a:
          h = (o - s) / f + 2;
          break;
        case o:
          h = (s - a) / f + 4;
          break;
      }
      h /= 6;
    }
    return e.h = h, e.s = d, e.l = p, e;
  }
  getRGB(e, i = scope.ColorManagement.workingColorSpace) {
    return scope.ColorManagement.workingToColorSpace(scope._color.copy(this), i), e.r = scope._color.r, e.g = scope._color.g, e.b = scope._color.b, e;
  }
  getStyle(e = scope.SRGBColorSpace) {
    scope.ColorManagement.workingToColorSpace(scope._color.copy(this), e);
    const i = scope._color.r,
      s = scope._color.g,
      a = scope._color.b;
    return e !== scope.SRGBColorSpace ? `color(${e} ${i.toFixed(3)} ${s.toFixed(3)} ${a.toFixed(3)})` : `rgb(${Math.round(i * 255)},${Math.round(s * 255)},${Math.round(a * 255)})`;
  }
  offsetHSL(e, i, s) {
    return this.getHSL(scope._hslA), this.setHSL(scope._hslA.h + e, scope._hslA.s + i, scope._hslA.l + s);
  }
  add(e) {
    return this.r += e.r, this.g += e.g, this.b += e.b, this;
  }
  addColors(e, i) {
    return this.r = e.r + i.r, this.g = e.g + i.g, this.b = e.b + i.b, this;
  }
  addScalar(e) {
    return this.r += e, this.g += e, this.b += e, this;
  }
  sub(e) {
    return this.r = Math.max(0, this.r - e.r), this.g = Math.max(0, this.g - e.g), this.b = Math.max(0, this.b - e.b), this;
  }
  multiply(e) {
    return this.r *= e.r, this.g *= e.g, this.b *= e.b, this;
  }
  multiplyScalar(e) {
    return this.r *= e, this.g *= e, this.b *= e, this;
  }
  lerp(e, i) {
    return this.r += (e.r - this.r) * i, this.g += (e.g - this.g) * i, this.b += (e.b - this.b) * i, this;
  }
  lerpColors(e, i, s) {
    return this.r = e.r + (i.r - e.r) * s, this.g = e.g + (i.g - e.g) * s, this.b = e.b + (i.b - e.b) * s, this;
  }
  lerpHSL(e, i) {
    this.getHSL(scope._hslA), e.getHSL(scope._hslB);
    const s = scope.lerp(scope._hslA.h, scope._hslB.h, i),
      a = scope.lerp(scope._hslA.s, scope._hslB.s, i),
      o = scope.lerp(scope._hslA.l, scope._hslB.l, i);
    return this.setHSL(s, a, o), this;
  }
  setFromVector3(e) {
    return this.r = e.x, this.g = e.y, this.b = e.z, this;
  }
  applyMatrix3(e) {
    const i = this.r,
      s = this.g,
      a = this.b,
      o = e.elements;
    return this.r = o[0] * i + o[3] * s + o[6] * a, this.g = o[1] * i + o[4] * s + o[7] * a, this.b = o[2] * i + o[5] * s + o[8] * a, this;
  }
  equals(e) {
    return e.r === this.r && e.g === this.g && e.b === this.b;
  }
  fromArray(e, i = 0) {
    return this.r = e[i], this.g = e[i + 1], this.b = e[i + 2], this;
  }
  toArray(e = [], i = 0) {
    return e[i] = this.r, e[i + 1] = this.g, e[i + 2] = this.b, e;
  }
  fromBufferAttribute(e, i) {
    return this.r = e.getX(i), this.g = e.getY(i), this.b = e.getZ(i), this;
  }
  toJSON() {
    return this.getHex();
  }
  *[Symbol.iterator]() {
    yield this.r, yield this.g, yield this.b;
  }
};
}
