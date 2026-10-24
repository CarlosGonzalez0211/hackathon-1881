/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 754943:755302.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1254(scope) {
scope.ji = new WeakMap(), scope.qs = new WeakMap(), scope.$s = new WeakMap(), scope.ds = new WeakMap(), scope.Zr = new WeakSet(), scope.Ao = function (e) {
  const i = new scope.BufferGeometry();
  e.userData && (i.userData = e.userData), e.index && i.setIndex(new scope.BufferAttribute(e.index.array, 1));
  for (let s = 0; s < e.attributes.length; s++) {
    const a = e.attributes[s],
      o = a.name,
      l = a.array,
      c = a.itemSize;
    i.setAttribute(o, new scope.BufferAttribute(l, c));
  }
  return i;
};
}
