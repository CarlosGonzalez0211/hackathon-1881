/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 392397:392595.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0891(scope) {
scope.metalnessmap_fragment = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`;
}
