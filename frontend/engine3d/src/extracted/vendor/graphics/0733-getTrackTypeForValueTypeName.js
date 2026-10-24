/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 266002:266485.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0733(scope) {
scope.getTrackTypeForValueTypeName = function getTrackTypeForValueTypeName(r) {
  switch (r.toLowerCase()) {
    case "scalar":
    case "double":
    case "float":
    case "number":
    case "integer":
      return scope.NumberKeyframeTrack;
    case "vector":
    case "vector2":
    case "vector3":
    case "vector4":
      return scope.VectorKeyframeTrack;
    case "color":
      return scope.ColorKeyframeTrack;
    case "quaternion":
      return scope.QuaternionKeyframeTrack;
    case "bool":
    case "boolean":
      return scope.BooleanKeyframeTrack;
    case "string":
      return scope.StringKeyframeTrack;
  }
  throw new Error("THREE.KeyframeTrack: Unsupported typeName: " + r);
};
}
