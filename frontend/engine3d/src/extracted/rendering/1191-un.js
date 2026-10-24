/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 716384:721015.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1191(scope) {
scope.un = class un {
  constructor() {
    scope.oe(this, scope.di);
    scope.oe(this, scope.Hr, document.querySelector("html"));
    scope.Ye(this, "capabilities", {
      webgpu: navigator.gpu !== void 0,
      webgl2: scope.WebGL.isWebGL2Available(),
      touch: "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0,
      offscreenCanvas: !!HTMLCanvasElement.prototype.transferControlToOffscreen,
      userMedia: !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia),
      matchMedia: !!window.matchMedia,
      colorScheme: !!((scope.to = window.matchMedia) != null && scope.to.call(window, "(prefers-color-scheme: dark)")),
      fullScreen: document.fullscreenEnabled || document.mozFullscreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled,
      geo: typeof navigator.geolocation < "u",
      gamepad: !!navigator.getGamepads,
      opus: !0,
      imageBitmap: !0
    });
    scope.Ye(this, "relativePath", "");
    scope.Ye(this, "absolutePath", window.location.origin);
    scope.Ye(this, "https", window.location.protocol === "https:");
    scope.Ye(this, "crossOriginIsolated", !!window.crossOriginIsolated);
    scope.Ye(this, "userAgent", navigator.userAgent);
    scope.Ye(this, "language", (navigator.language || navigator.userLanguage).substr(0, 2));
    scope.Ye(this, "darkMode", this.capabilities.colorScheme ? window.matchMedia("(prefers-color-scheme: dark)").matches : !1);
    scope.Ye(this, "visible", !0);
    scope.Ye(this, "focused", !0);
    scope.Ye(this, "localStorage", scope.storage);
    scope.Ye(this, "electron", this.userAgent.toLowerCase().indexOf(" electron/") > -1);
    scope.Ye(this, "iOS", !1);
    scope.Ye(this, "iOSVersion", 0);
    scope.Ye(this, "oldIphone", !1);
    scope.Ye(this, "iphone", !1);
    scope.Ye(this, "lowMemoryDevice", !1);
    scope.Ye(this, "browser", {
      name: "",
      version: 0
    });
    scope.Ye(this, "screen", {
      dpr: window.devicePixelRatio || 1,
      aspectRatio: 1,
      width: 0,
      height: 0,
      w: 0,
      h: 0
    });
    scope.oe(this, scope.Wi, null);
    scope.Ye(this, "boundVisibilityChange", scope.Ee(this, scope.di, scope._a).bind(this));
    scope.Ye(this, "boundFocusChange", scope.Ee(this, scope.di, scope.xa).bind(this));
    scope.Ye(this, "boundDarkModeChange", scope.Ee(this, scope.di, scope.ao).bind(this));
    scope.Ye(this, "query", new Proxy(new URLSearchParams(window.location.search), {
      get: (e, i) => e.get(i)
    }));
    scope.Ye(this, "devScene", !1);
    var e, i, s, a;
    if (/firefox|iceweasel|fxios/i.test(this.userAgent) === !0) {
      this.browser.name = "firefox";
      const o = this.userAgent.match(/(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i);
      this.browser.version = o ? scope.Ee(e = un, scope.tn, scope.ys).call(e, o[1]) : 0;
    }
    if (/(ipod|iphone|ipad)/i.test(this.userAgent) === !0) {
      this.iOS = !0;
      const o = this.userAgent.match(/os (\d+([_\s]\d+)*) like mac os x/i);
      this.iOSVersion = o ? scope.Ee(i = un, scope.tn, scope.ys).call(i, o[1].replace(/[_\s]/g, ".")) : 0;
    }
    if (!this.browser.name && /^((?!chrome|android).)*safari/i.test(this.userAgent) === !0) {
      this.browser.name = "safari";
      const o = this.userAgent.match(/version\/(\d+(\.?_?\d+)+)/i);
      this.browser.version = o ? scope.Ee(s = un, scope.tn, scope.ys).call(s, o[1]) : 0, this.browser.version === 0 && this.iOS && (this.browser.version = this.iOSVersion);
    }
    if (!this.browser.name && /chrome|crios|crmo/i.test(this.userAgent) === !0) {
      this.browser.name = "chrome";
      const o = this.userAgent.match(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i);
      this.browser.version = o ? scope.Ee(a = un, scope.tn, scope.ys).call(a, o[1]) : 0;
    }
    !this.iOS && this.browser.name === "safari" && this.capabilities.touch && (this.iOS = !0, this.iOSVersion = this.browser.version), this.iOS && Math.min(window.screen.width, window.screen.height) / Math.max(window.screen.width, window.screen.height) < .65 && (this.iphone = !0, this.oldIphone = window.devicePixelRatio < 3), this.capabilities.opus = this.browser.name !== "safari", (this.browser.name === "safari" || this.browser.name === "firefox" && this.browser.version < 100 || this.iOS && this.browser.name !== "safari") && (this.capabilities.imageBitmap = !1), this.lowMemoryDevice = this.iphone, scope.ze(this, scope.Wi, scope.miscutils.debounce(scope.Ee(this, scope.di, scope.Aa).bind(this), this.iOS ? 500 : 50)), this.init();
  }
  init() {
    scope.__lifecycle.listen(window, "resize", scope.L(this, scope.Wi)), scope.__lifecycle.listen(window, "orientationchange", scope.L(this, scope.Wi)), scope.Ee(this, scope.di, scope.Aa).call(this), scope.L(this, scope.Wi).call(this), scope.__lifecycle.listen(document, "visibilitychange", this.boundVisibilityChange), scope.__lifecycle.listen(window, "focus", this.boundFocusChange), scope.__lifecycle.listen(window, "blur", this.boundFocusChange), this.capabilities.colorScheme && scope.__lifecycle.listen(window.matchMedia("(prefers-color-scheme: dark)"), "change", this.boundDarkModeChange), scope.Ee(this, scope.di, scope._a).call(this), scope.Ee(this, scope.di, scope.xa).call(this);
  }
  setRelativePath(e) {
    var i;
    this.relativePath = scope.Ee(i = un, scope.tn, scope.ro).call(i, e), this.absolutePath = `${window.location.origin}${this.relativePath !== "" ? `/${this.relativePath}` : ""}`;
  }
  dispose() {
    scope.__lifecycle.unlisten(window, "resize", scope.L(this, scope.Wi)), scope.__lifecycle.unlisten(window, "orientationchange", scope.L(this, scope.Wi)), scope.__lifecycle.unlisten(document, "visibilitychange", this.boundVisibilityChange), scope.__lifecycle.unlisten(window, "focus", this.boundFocusChange), scope.__lifecycle.unlisten(window, "blur", this.boundFocusChange), this.capabilities.colorScheme && scope.__lifecycle.unlisten(window.matchMedia("(prefers-color-scheme: dark)"), "change", this.boundDarkModeChange);
  }
};
}
