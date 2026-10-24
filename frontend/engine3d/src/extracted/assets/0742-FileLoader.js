/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 268721:271286.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0742(scope) {
scope.FileLoader = class FileLoader extends scope.Loader$1 {
  constructor(e) {
    super(e), this.mimeType = "", this.responseType = "", this._abortController = new AbortController();
  }
  load(e, i, s, a) {
    e === void 0 && (e = ""), this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const o = scope.Cache.get(`file:${e}`);
    if (o !== void 0) return this.manager.itemStart(e), scope.__lifecycle.setTimeout(() => {
      i && i(o), this.manager.itemEnd(e);
    }, 0), o;
    if (scope.loading[e] !== void 0) {
      scope.loading[e].push({
        onLoad: i,
        onProgress: s,
        onError: a
      });
      return;
    }
    scope.loading[e] = [], scope.loading[e].push({
      onLoad: i,
      onProgress: s,
      onError: a
    });
    const l = new Request(e, {
        headers: new Headers(this.requestHeader),
        credentials: this.withCredentials ? "include" : "same-origin",
        signal: typeof AbortSignal.any == "function" ? AbortSignal.any([this._abortController.signal, this.manager.abortController.signal]) : this._abortController.signal
      }),
      c = this.mimeType,
      h = this.responseType;
    fetch(l).then(d => {
      if (d.status === 200 || d.status === 0) {
        if (d.status === 0 && console.warn("THREE.FileLoader: HTTP Status 0 received."), typeof ReadableStream > "u" || d.body === void 0 || d.body.getReader === void 0) return d;
        const p = scope.loading[e],
          f = d.body.getReader(),
          _ = d.headers.get("X-File-Size") || d.headers.get("Content-Length"),
          x = _ ? parseInt(_) : 0,
          b = x !== 0;
        let T = 0;
        const M = new ReadableStream({
          start(w) {
            D();
            function D() {
              f.read().then(({
                done: R,
                value: P
              }) => {
                if (R) w.close();else {
                  T += P.byteLength;
                  const U = new ProgressEvent("progress", {
                    lengthComputable: b,
                    loaded: T,
                    total: x
                  });
                  for (let O = 0, N = p.length; O < N; O++) {
                    const H = p[O];
                    H.onProgress && H.onProgress(U);
                  }
                  w.enqueue(P), D();
                }
              }, R => {
                w.error(R);
              });
            }
          }
        });
        return new Response(M);
      } else throw new scope.HttpError(`fetch for "${d.url}" responded with ${d.status}: ${d.statusText}`, d);
    }).then(d => {
      switch (h) {
        case "arraybuffer":
          return d.arrayBuffer();
        case "blob":
          return d.blob();
        case "document":
          return d.text().then(p => new DOMParser().parseFromString(p, c));
        case "json":
          return d.json();
        default:
          if (c === "") return d.text();
          {
            const f = /charset="?([^;"\s]*)"?/i.exec(c),
              _ = f && f[1] ? f[1].toLowerCase() : void 0,
              x = new TextDecoder(_);
            return d.arrayBuffer().then(b => x.decode(b));
          }
      }
    }).then(d => {
      scope.Cache.add(`file:${e}`, d);
      const p = scope.loading[e];
      delete scope.loading[e];
      for (let f = 0, _ = p.length; f < _; f++) {
        const x = p[f];
        x.onLoad && x.onLoad(d);
      }
    }).catch(d => {
      const p = scope.loading[e];
      if (p === void 0) throw this.manager.itemError(e), d;
      delete scope.loading[e];
      for (let f = 0, _ = p.length; f < _; f++) {
        const x = p[f];
        x.onError && x.onError(d);
      }
      this.manager.itemError(e);
    }).finally(() => {
      this.manager.itemEnd(e);
    }), this.manager.itemStart(e);
  }
  setResponseType(e) {
    return this.responseType = e, this;
  }
  setMimeType(e) {
    return this.mimeType = e, this;
  }
  abort() {
    return this._abortController.abort(), this._abortController = new AbortController(), this;
  }
};
}
