/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 527934:528263.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1083(scope) {
scope.fetchAttributeLocations = function fetchAttributeLocations(r, e) {
  const i = {},
    s = r.getProgramParameter(e, r.ACTIVE_ATTRIBUTES);
  for (let a = 0; a < s; a++) {
    const o = r.getActiveAttrib(e, a),
      l = o.name;
    let c = 1;
    o.type === r.FLOAT_MAT2 && (c = 2), o.type === r.FLOAT_MAT3 && (c = 3), o.type === r.FLOAT_MAT4 && (c = 4), i[l] = {
      type: o.type,
      location: r.getAttribLocation(e, l),
      locationSize: c
    };
  }
  return i;
};
}
