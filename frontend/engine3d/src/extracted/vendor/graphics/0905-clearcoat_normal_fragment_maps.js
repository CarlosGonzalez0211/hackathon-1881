/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 398138:398403.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0905(scope) {
scope.clearcoat_normal_fragment_maps = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`;
}
