/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 334832:334953.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0836(scope) {
scope.batching_vertex = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`;
}
