/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 527286:527580.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1080(scope) {
scope.getLuminanceFunction = function getLuminanceFunction() {
  scope.ColorManagement.getLuminanceCoefficients(scope._v0$m);
  const r = scope._v0$m.x.toFixed(4),
    e = scope._v0$m.y.toFixed(4),
    i = scope._v0$m.z.toFixed(4);
  return ["float luminance( const in vec3 rgb ) {", `	const vec3 weights = vec3( ${r}, ${e}, ${i} );`, "	return dot( weights, rgb );", "}"].join(`
`);
};
}
