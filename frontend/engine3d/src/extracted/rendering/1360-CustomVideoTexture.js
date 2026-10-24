/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 830758:831589.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1360(scope) {
scope.CustomVideoTexture = class CustomVideoTexture extends scope.VideoTexture {
  constructor(e, i = !1) {
    const s = document.createElement("video");
    super(s), s.loop = !0, s.muted = !0, s.preload = "auto", s.crossOrigin = "anonymous", s.playsInline = !0;
    const a = document.createElement("source");
    a.src = e, a.type = `video/${e.split(".").pop().startsWith("mp4") ? "mp4" : "webm"}`, s.appendChild(a), s.load(), this._autoplay = i, this._videoLoadAsync = new Promise((o, l) => {
      const c = () => {
          scope.__lifecycle.unlisten(s, "canplaythrough", h), scope.__lifecycle.unlisten(s, "error", d);
        },
        h = () => {
          c(), o();
        },
        d = () => {
          c(), l(new Error(`fetch for "${e}" responded with 404: Not Found.`));
        };
      scope.__lifecycle.listen(s, "canplaythrough", h), scope.__lifecycle.listen(s, "error", d), s.readyState > 3 && h();
    });
  }
  update() {
    this._autoplay && this.image.paused && this.image.play().catch(() => {}), super.update();
  }
  dispose() {
    this.image.pause(), this.image.currentTime = 0, super.dispose();
  }
};
}
