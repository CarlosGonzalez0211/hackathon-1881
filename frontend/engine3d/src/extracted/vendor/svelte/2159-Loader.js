/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1936372:1936977.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2159(scope) {
scope.Loader = function Loader(r, e) {
  scope.push(e, !0);
  let i = scope.state(null),
    s = scope.state(!scope.client$1.devScene);
  const a = {
      opacity: 0
    },
    o = () => {
      scope.set(s, !0);
    },
    l = () => {
      !scope.get(s) || !scope.get(i) || scope.createTween(a, {
        to: {
          opacity: 0
        },
        ease: "power2.inOut",
        duration: .5,
        onUpdate: () => {
          scope.get(i).style.opacity = a.opacity;
        },
        onComplete: () => {
          scope.set(s, !1);
        }
      });
    };
  scope.user_effect(() => {
    scope.get(s) && scope.createTween(a, {
      to: {
        opacity: 1
      },
      ease: "power2.inOut",
      duration: .5,
      onUpdate: () => {
        scope.get(i).style.opacity = a.opacity;
      }
    });
  });
  var c = scope.comment(),
    h = scope.first_child(c);
  {
    var d = p => {
      var f = scope.root_1(),
        _ = scope.child(f);
      scope.bind_this(_, x => scope.set(i, x), () => scope.get(i)), scope.append(p, f);
    };
    scope.if_block(h, p => {
      scope.get(s) && p(d);
    });
  }
  return scope.append(r, c), scope.pop({
    show: o,
    hide: l
  });
};
}
