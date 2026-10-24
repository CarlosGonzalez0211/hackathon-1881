/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 728785:729322.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1208(scope) {
scope.audiobufferLoader = {
  _audiobuffersCache: new Map(),
  _initLoad(r, e) {
    return this._audiobuffersCache.has(r) || this._audiobuffersCache.set(r, new Promise(e)), this._audiobuffersCache.get(r);
  },
  load(r, e = !1) {
    return this._initLoad(r, async i => {
      try {
        const s = r.endsWith(".ogg") && !scope.client$1.capabilities.opus ? `${r.slice(0, -3)}mp3` : r,
          a = await scope.bufferLoader$1.loadAsync(s);
        scope.offlineAudioContext.decodeAudioData(a, o => {
          i(o);
        }, () => {
          throw new Error(`audio could not be decoded: ${r}`);
        });
      } catch (s) {
        console.log(`audio ${r} load error: ${s}`), i(!1);
      }
      e || scope.deleteFromCache$3(r);
    });
  }
};
}
