/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 243319:243788.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0686(scope) {
scope.ShapeUtils = class ShapeUtils {
  static area(e) {
    const i = e.length;
    let s = 0;
    for (let a = i - 1, o = 0; o < i; a = o++) s += e[a].x * e[o].y - e[o].x * e[a].y;
    return s * .5;
  }
  static isClockWise(e) {
    return scope.ShapeUtils.area(e) < 0;
  }
  static triangulateShape(e, i) {
    const s = [],
      a = [],
      o = [];
    scope.removeDupEndPts(e), scope.addContour(s, e);
    let l = e.length;
    i.forEach(scope.removeDupEndPts);
    for (let h = 0; h < i.length; h++) a.push(l), l += i[h].length, scope.addContour(s, i[h]);
    const c = scope.Earcut.triangulate(s, a);
    for (let h = 0; h < c.length; h += 3) o.push(c.slice(h, h + 3));
    return o;
  }
};
}
