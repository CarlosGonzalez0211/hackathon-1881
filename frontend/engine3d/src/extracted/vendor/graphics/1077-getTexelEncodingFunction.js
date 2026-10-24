/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 526586:526768.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1077(scope) {
scope.getTexelEncodingFunction = function getTexelEncodingFunction(r, e) {
  const i = scope.getEncodingComponents(e);
  return [`vec4 ${r}( vec4 value ) {`, `	return ${i[1]}( vec4( value.rgb * ${i[0]}, value.a ) );`, "}"].join(`
`);
};
}
