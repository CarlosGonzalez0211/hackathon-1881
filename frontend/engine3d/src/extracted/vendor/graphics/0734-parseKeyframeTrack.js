/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 266485:266828.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0734(scope) {
scope.parseKeyframeTrack = function parseKeyframeTrack(r) {
  if (r.type === void 0) throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");
  const e = scope.getTrackTypeForValueTypeName(r.type);
  if (r.times === void 0) {
    const i = [],
      s = [];
    scope.flattenJSON(r.keys, i, s, "value"), r.times = i, r.values = s;
  }
  return e.parse !== void 0 ? e.parse(r) : new e(r.name, r.times, r.values, r.interpolation);
};
}
