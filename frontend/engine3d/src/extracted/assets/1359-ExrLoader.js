/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 829912:830758.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1359(scope) {
scope.ExrLoader = class ExrLoader {
  constructor() {
    this.exrTextureCache = new Map(), this.path = "", this.workerTask = new scope.workerTask().setWorkerCreator(() => new scope.WorkerWrapper$2());
  }
  loadAsync(e) {
    if (this.exrTextureCache.has(e)) return this.exrTextureCache.get(e);
    const i = new Promise(async (s, a) => {
      const o = await this.workerTask.postMessage({
        url: this.path + e
      });
      if (o.error) a(new Error(`fetch for "${e}" responded with 404: Not Found.`));else {
        const {
            texData: l
          } = o,
          c = new scope.DataTexture();
        c.image.width = l.width, c.image.height = l.height, c.image.data = l.data, c.colorSpace = l.colorSpace, c.format = l.format, c.type = l.type, c.needsUpdate = !0, c.minFilter = scope.LinearFilter, c.magFilter = scope.LinearFilter, c.generateMipmaps = !1, c.flipY = !1, s(c);
      }
    });
    return this.exrTextureCache.set(e, i), i;
  }
  setPath(e) {
    this.path = e;
  }
  deleteFromCache(e) {
    this.exrTextureCache.delete(e);
  }
  dispose() {
    this.workerTask.dispose(), this.exrTextureCache.clear();
  }
};
}
