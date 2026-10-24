/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 714790:715898.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1185(scope) {
scope.WebGL = class WebGL {
  static isWebGL2Available() {
    try {
      const e = document.createElement("canvas");
      return !!(window.WebGL2RenderingContext && e.getContext("webgl2"));
    } catch {
      return !1;
    }
  }
  static isColorSpaceAvailable(e) {
    try {
      const i = document.createElement("canvas"),
        s = window.WebGL2RenderingContext && i.getContext("webgl2");
      return s.drawingBufferColorSpace = e, s.drawingBufferColorSpace === e;
    } catch {
      return !1;
    }
  }
  static getWebGL2ErrorMessage() {
    return this._getErrorMessage(2);
  }
  static _getErrorMessage(e) {
    const i = {
        1: "WebGL",
        2: "WebGL 2"
      },
      s = {
        1: window.WebGLRenderingContext,
        2: window.WebGL2RenderingContext
      };
    let a = 'Your $0 does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">$1</a>';
    const o = document.createElement("div");
    return o.id = "webglmessage", o.style.fontFamily = "monospace", o.style.fontSize = "13px", o.style.fontWeight = "normal", o.style.textAlign = "center", o.style.background = "#fff", o.style.color = "#000", o.style.padding = "1.5em", o.style.width = "400px", o.style.margin = "5em auto 0", s[e] ? a = a.replace("$0", "graphics card") : a = a.replace("$0", "browser"), a = a.replace("$1", i[e]), o.innerHTML = a, o;
  }
};
}
