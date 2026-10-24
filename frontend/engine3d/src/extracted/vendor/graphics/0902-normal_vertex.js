/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 396932:397165.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0902(scope) {
scope.normal_vertex = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`;
}
