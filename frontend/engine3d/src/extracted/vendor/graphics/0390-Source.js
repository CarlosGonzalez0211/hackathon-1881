/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 58722:59576.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0390(scope) {
scope.Source = class Source {
  constructor(e = null) {
    this.isSource = !0, Object.defineProperty(this, "id", {
      value: scope._sourceId++
    }), this.uuid = scope.generateUUID(), this.data = e, this.dataReady = !0, this.version = 0;
  }
  getSize(e) {
    const i = this.data;
    return typeof HTMLVideoElement < "u" && i instanceof HTMLVideoElement ? e.set(i.videoWidth, i.videoHeight, 0) : i instanceof VideoFrame ? e.set(i.displayHeight, i.displayWidth, 0) : i !== null ? e.set(i.width, i.height, i.depth || 0) : e.set(0, 0, 0), e;
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  toJSON(e) {
    const i = e === void 0 || typeof e == "string";
    if (!i && e.images[this.uuid] !== void 0) return e.images[this.uuid];
    const s = {
        uuid: this.uuid,
        url: ""
      },
      a = this.data;
    if (a !== null) {
      let o;
      if (Array.isArray(a)) {
        o = [];
        for (let l = 0, c = a.length; l < c; l++) a[l].isDataTexture ? o.push(scope.serializeImage(a[l].image)) : o.push(scope.serializeImage(a[l]));
      } else o = scope.serializeImage(a);
      s.url = o;
    }
    return i || (e.images[this.uuid] = s), s;
  }
};
}
