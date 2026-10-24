/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 393510:393786.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0895(scope) {
scope.morphnormal_vertex = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`;
}
