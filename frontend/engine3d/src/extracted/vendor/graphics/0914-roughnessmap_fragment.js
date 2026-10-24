/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 402670:402868.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0914(scope) {
scope.roughnessmap_fragment = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`;
}
