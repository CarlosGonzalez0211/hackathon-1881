/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1937434:1938657.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2165(scope) {
scope.App3D = function App3D(r, e) {
  scope.push(e, !0);
  const i = scope.prop(e, "interactionNode", 3, null),
    s = scope.prop(e, "relativePath", 3, ""),
    a = scope.miscutils.deferred();
  let o = null,
    l = !1,
    c = scope.state(null),
    h = scope.state(null);
  scope.user_effect(async () => {
    if (!scope.get(h) || l) return;
    l = !0, scope.events$1.on("toggle_loader", M => {
      M ? o.show() : o.hide();
    }), scope.customEase("tweaked", "M0,0 C0.388,0 0.441,0.356 0.496,0.496 0.553,0.641 0.647,1 1,1");
    const T = window.devicePixelRatio <= 2 ? Math.min(window.devicePixelRatio, 1.15) : Math.min(window.devicePixelRatio, 1.5);
    await scope.global$1.init({
      canvasCnt: scope.get(h),
      interactionNode: i(),
      relativePath: s(),
      fingers: 2,
      audioContext: !0,
      contextMenu: !1,
      DPR: T || 1,
      adaptiveDPR: !0,
      shadowMap: !0,
      shadowMapType: scope.PCFSoftShadowMap
    });
    {
      const M = new scope.mainController();
      await M.ready, o.hide(), M.start();
    }
    a.resolve(!0);
  });
  const d = async () => {};
  (async () => {
    if (!scope.client$1.capabilities.webgl2) {
      a.resolve(!1), scope.set(c, !1);
      return;
    }
    await d(), scope.set(c, !0);
  })();
  var p = scope.root(),
    f = scope.first_child(p);
  {
    var _ = T => {
        scope.Unsupported(T);
      },
      x = T => {
        var M = scope.comment(),
          w = scope.first_child(M);
        {
          var D = R => {
            var P = scope.root_3(),
              U = scope.first_child(P);
            scope.bind_this(U, O => scope.set(h, O), () => scope.get(h)), scope.append(R, P);
          };
          scope.if_block(w, R => {
            scope.get(c) === !0 && R(D);
          }, !0);
        }
        scope.append(T, M);
      };
    scope.if_block(f, T => {
      scope.get(c) === !1 ? T(_) : T(x, !1);
    });
  }
  var b = scope.sibling(f, 2);
  return scope.bind_this(scope.Loader(b, {}), T => o = T, () => o), scope.append(r, p), scope.pop({
    ready: a
  });
};
}
