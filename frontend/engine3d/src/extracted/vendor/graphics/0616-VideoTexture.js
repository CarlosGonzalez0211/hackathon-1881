/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 216708:217438.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0616(scope) {
scope.VideoTexture = class VideoTexture extends scope.Texture {
  constructor(e, i, s, a, o = scope.LinearFilter, l = scope.LinearFilter, c, h, d) {
    super(e, i, s, a, o, l, c, h, d), this.isVideoTexture = !0, this.generateMipmaps = !1, this._requestVideoFrameCallbackId = 0;
    const p = this;
    function f() {
      p.needsUpdate = !0, p._requestVideoFrameCallbackId = e.requestVideoFrameCallback(f);
    }
    "requestVideoFrameCallback" in e && (this._requestVideoFrameCallbackId = e.requestVideoFrameCallback(f));
  }
  clone() {
    return new this.constructor(this.image).copy(this);
  }
  update() {
    const e = this.image;
    "requestVideoFrameCallback" in e === !1 && e.readyState >= e.HAVE_CURRENT_DATA && (this.needsUpdate = !0);
  }
  dispose() {
    this._requestVideoFrameCallbackId !== 0 && this.source.data.cancelVideoFrameCallback(this._requestVideoFrameCallbackId), super.dispose();
  }
};
}
