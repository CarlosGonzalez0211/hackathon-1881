/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 682130:682733.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1151(scope) {
scope.Tn = new WeakMap(), scope.ai = new WeakMap(), scope.Hi = new WeakMap(), scope.es = new WeakMap(), scope.Nr = new WeakMap(), scope.Or = new WeakMap(), scope.ts = new WeakMap(), scope.Is = new WeakMap(), scope.kr = new WeakMap(), scope.zr = new WeakMap(), scope.fn = new WeakMap(), scope.is = new WeakMap(), scope.Bs = new WeakSet(), scope.va = function (e) {
  e.isTween ? scope.ze(this, scope.ai, scope.L(this, scope.ai).filter(i => !i.isTween && !i.isTimeline ? !0 : (i.isTween ? [i] : i._tweens.slice()).every(s => s._obj !== e._obj ? !0 : (Object.keys(s._from).forEach(a => {
    a in e._from && s._removeProp(a);
  }), !(Object.keys(s._from).length === 0 && (i.isTween || (i._tweens = i._tweens.filter(a => a !== s), i._tweens.length === 0))))))) : e.isTimeline && e._tweens.forEach(i => scope.Ee(this, scope.Bs, scope.va).call(this, i));
}, scope.ns = new WeakMap();
}
