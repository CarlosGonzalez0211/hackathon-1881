/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 713302:714308.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1176(scope) {
scope.Qi = new WeakMap(), scope.Rn = new WeakMap(), scope.Zt = new WeakMap(), scope.li = new WeakMap(), scope.Pn = new WeakMap(), scope.Ln = new WeakMap(), scope.Us = new WeakMap(), scope.Vr = new WeakSet(), scope.so = function () {
  for (const i in scope.L(this, scope.li)) scope.L(this, scope.Zt)[i] === void 0 && (scope.L(this, scope.Rn) ? scope.L(this, scope.Zt)[i] = scope.L(this, scope.Qi).style[i] : scope.L(this, scope.Zt)[i] = scope.L(this, scope.Qi)[i]);
  for (const i in scope.L(this, scope.Zt)) {
    scope.L(this, scope.li)[i] === void 0 && (scope.L(this, scope.li)[i] = scope.L(this, scope.Zt)[i]);
    const s = scope.L(this, scope.Zt)[i],
      a = typeof s;
    if (!scope.Di.TYPES_STR.includes(a)) throw new Error(`tween: invalid type "${a}" for property "${i}".`);
    if (a !== typeof scope.L(this, scope.li)[i] && (console.warn(`tween: "from" and "to" values for "${i}" must be of the same type. This property won't animate.`), scope.L(this, scope.li)[i] = s), a !== "string") {
      scope.L(this, scope.Pn)[i] = scope.Di.TYPES[a];
      continue;
    }
    let o = scope.numberUnitRegexp.exec(s);
    const l = o && !isNaN(o[1]);
    l && (scope.L(this, scope.Zt)[i] = Number(o[1])), scope.L(this, scope.Pn)[i] = l ? scope.Di.TYPES.number : scope.Di.TYPES.string, l && o[2] !== "" && (scope.L(this, scope.Ln)[i] = o[2]), l && (o = scope.numberUnitRegexp.exec(scope.L(this, scope.li)[i]), scope.L(this, scope.li)[i] = Number(o[1]));
  }
}, scope.Ye(scope.Di, "TYPES", {
  number: 0,
  boolean: 1,
  string: 2
}), scope.Ye(scope.Di, "TYPES_STR", Object.keys(scope.Di.TYPES));
}
