/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 272682:273435.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0746(scope) {
scope.Light = class Light extends scope.Object3D {
  constructor(e, i = 1) {
    super(), this.isLight = !0, this.type = "Light", this.color = new scope.Color(e), this.intensity = i;
  }
  dispose() {}
  copy(e, i) {
    return super.copy(e, i), this.color.copy(e.color), this.intensity = e.intensity, this;
  }
  toJSON(e) {
    const i = super.toJSON(e);
    return i.object.color = this.color.getHex(), i.object.intensity = this.intensity, this.groundColor !== void 0 && (i.object.groundColor = this.groundColor.getHex()), this.distance !== void 0 && (i.object.distance = this.distance), this.angle !== void 0 && (i.object.angle = this.angle), this.decay !== void 0 && (i.object.decay = this.decay), this.penumbra !== void 0 && (i.object.penumbra = this.penumbra), this.shadow !== void 0 && (i.object.shadow = this.shadow.toJSON()), this.target !== void 0 && (i.object.target = this.target.uuid), i;
  }
};
}
