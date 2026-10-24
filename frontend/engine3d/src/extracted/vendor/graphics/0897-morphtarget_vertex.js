/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 394466:394740.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0897(scope) {
scope.morphtarget_vertex = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`;
}
