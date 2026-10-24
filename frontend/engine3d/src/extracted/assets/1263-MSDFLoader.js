/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 760346:761780.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1263(scope) {
scope.MSDFLoader = class MSDFLoader {
  constructor() {
    this.jsonLoader = new scope.FileLoader(), this.jsonCache = new Map(), this.workerTask = new scope.workerTask().setWorkerCreator(() => new scope.WorkerWrapper$4());
  }
  loadAsync(e) {
    return new Promise(async i => {
      if (!e.font) throw new Error("You must specify a MSDF font.");
      const s = e.font;
      this.jsonCache.has(s) || this.jsonCache.set(s, new Promise(async l => {
        try {
          const c = JSON.parse(await this.jsonLoader.loadAsync(`${e.font}.json`)),
            h = c.glyphs;
          c.glyphs = {}, h.forEach(d => {
            const p = String.fromCharCode(d.unicode);
            d.isWhitespace = /\s/.test(p), c.glyphs[p] = d;
          }), c.placeholderChar = Object.keys(c.glyphs).sort()[0], l(c);
        } catch (c) {
          console.log("Error loading msdf json:", c), l(!1);
        }
      }));
      const a = new scope.BufferGeometry(),
        o = await this.jsonCache.get(s);
      if (o) {
        const l = (await this.workerTask.postMessage({
          font: o,
          options: e
        })).buffers;
        a.setIndex(new scope.BufferAttribute(l.index, 1)), a.setAttribute("position", new scope.BufferAttribute(l.position, 3)), a.setAttribute("uv", new scope.BufferAttribute(l.uv, 2)), a.setAttribute("uvMask", new scope.BufferAttribute(l.uvMask, 4)), a.setAttribute("textWeights", new scope.BufferAttribute(l.textWeights, 2)), a.setAttribute("lineWeights", new scope.BufferAttribute(l.lineWeights, 3)), a.setAttribute("centr", new scope.BufferAttribute(l.centr, 3)), a._maxLineHeight = l.maxLineHeight, a._maxUVDisp = l.maxUVDisp, a._sizes = l.sizes;
      } else a._maxLineHeight = 0, a._maxUVDisp = 0, a._sizes = {
        width: 0,
        height: 0
      };
      i(a);
    });
  }
  setPath(e) {
    this.jsonLoader.setPath(e);
  }
  dispose() {
    this.workerTask.dispose(), this.jsonCache.clear();
  }
};
}
